import { create } from "zustand";
import type {
  FlowConfig,
  RunRecord,
  SampleCatalogEntry,
} from "@node-playground/types";
import { nodeDefinitions, type NodeDefinitionKey } from "../nodes";
import { resolveTokens, maskSensitive } from "../utils/expression";
import type { HttpRunResult } from "@node-playground/types";

// Helper to check if value is object
function isObject(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === "object" && !Array.isArray(val);
}

// Helper to flatten wrapper objects: { value: [...] } -> [...]
function flattenOutput(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data.map(item => flattenOutput(item));
  }
  
  if (isObject(data)) {
    const result: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Flatten { value: [...] } or { value: {...} } pattern
      if (isObject(value)) {
        const valueObj = value as Record<string, unknown>;
        const keys = Object.keys(valueObj);
        
        // If object has single "value" key, unwrap it
        if (keys.length === 1 && keys[0] === 'value') {
          result[key] = flattenOutput(valueObj.value);
          continue;
        }
      }
      
      result[key] = flattenOutput(value);
    }
    
    return result;
  }
  
  return data;
}

export interface StepInstance {
  key: string;
  schemaKey: NodeDefinitionKey;
  name: string;
  config: Record<string, unknown>;
  createdAt: string;
}

export interface StepRunState {
  status: "idle" | "running" | "success" | "error";
  lastRun?: RunRecord;
  requestPreview?: HttpRunResult["requestPreview"];
  response?: HttpRunResult;
  errorMessage?: string;
}

export interface CustomEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

interface FlowStoreState {
  steps: StepInstance[];
  customEdges: CustomEdge[]; // User-defined edges between nodes
  selectedStepKey?: string;
  stepOutputs: Record<string, unknown>;
  stepRunStates: Record<string, StepRunState>;
  runTimeline: RunRecord[];
  samples: SampleCatalogEntry[];
  isRunningFlow: boolean;
  showConfigPanel: boolean;
  showResultPanel: boolean;
  layoutTrigger: number; // Increment to trigger re-layout
  layoutDirection: "TB" | "LR"; // TB = Top-Bottom (vertical), LR = Left-Right (horizontal)
  nodePositions: Record<string, { x: number; y: number }>; // Cache node positions to preserve manual layout
}

interface FlowStoreActions {
  addStep: (schemaKey: NodeDefinitionKey) => void;
  removeStep: (stepKey: string) => void;
  reorderSteps: (sourceIndex: number, targetIndex: number) => void;
  selectStep: (stepKey?: string) => void;
  updateConfig: (stepKey: string, data: Record<string, unknown>) => void;
  runStep: (stepKey: string, skipDependencies?: boolean, originalStepKey?: string) => Promise<void>;
  runFlow: () => Promise<void>;
  markSample: (stepKey: string) => void;
  exportFlow: () => FlowConfig;
  importFlow: (input: FlowConfig) => void;
  clearLogs: (stepKey?: string) => void;
  setShowConfigPanel: (show: boolean) => void;
  setShowResultPanel: (show: boolean) => void;
  triggerAutoLayout: () => void;
  toggleLayoutDirection: () => void;
  updateEdges: (edges: CustomEdge[]) => void;
  addEdge: (edge: CustomEdge) => void;
  removeEdge: (edgeId: string) => void;
  saveNodePositions: (positions: Record<string, { x: number; y: number }>) => void;
}

type FlowStore = FlowStoreState & FlowStoreActions;

type SetState<T> = (
  partial: T | Partial<T> | ((state: T) => T | Partial<T>),
  replace?: boolean
) => void;

type GetState<T> = () => T;

const DEFAULT_STATE: Pick<FlowStoreState, "steps" | "customEdges" | "selectedStepKey" | "stepOutputs" | "stepRunStates" | "runTimeline" | "samples" | "isRunningFlow" | "showConfigPanel" | "showResultPanel" | "layoutTrigger" | "layoutDirection" | "nodePositions"> = {
  steps: [],
  customEdges: [],
  selectedStepKey: undefined,
  stepOutputs: {},
  stepRunStates: {},
  runTimeline: [],
  samples: [],
  isRunningFlow: false,
  showConfigPanel: false,
  showResultPanel: false,
  layoutTrigger: 0,
  layoutDirection: "TB", // Default to vertical (Top-Bottom) for better mobile/small screen
  nodePositions: {},
};

const storeCreator = (set: SetState<FlowStore>, get: GetState<FlowStore>): FlowStore => ({
  ...DEFAULT_STATE,
  addStep: (schemaKey: NodeDefinitionKey) => {
    const definition = nodeDefinitions[schemaKey];
    if (!definition) {
      throw new Error(`Unknown node type: ${schemaKey}`);
    }

    // Only allow one manual trigger node per workflow
    if (schemaKey === "manual") {
      const state = get();
      const hasManualNode = state.steps.some((step) => step.schemaKey === "manual");
      if (hasManualNode) {
        alert("⚠️ Only one Manual Trigger node is allowed per workflow");
        return;
      }
    }

    set((state) => {
      const index = state.steps.filter((step) => step.schemaKey === schemaKey).length + 1;
      const key = `${schemaKey}${index}`;
      const now = new Date().toISOString();
      const step: StepInstance = {
        key,
        schemaKey,
        name: `${definition.schema.name} ${index}`,
        config: definition.createInitialConfig(),
        createdAt: now,
      };
      return {
        steps: [...state.steps, step],
        selectedStepKey: key,
        stepRunStates: {
          ...state.stepRunStates,
          [key]: { status: "idle" },
        },
      };
    });
  },
  removeStep: (stepKey: string) => {
    set((state) => {
      const steps = state.steps.filter((step) => step.key !== stepKey);
      const { [stepKey]: _removed, ...restOutputs } = state.stepOutputs;
      const { [stepKey]: _runState, ...restRunStates } = state.stepRunStates;
      const runTimeline = state.runTimeline.filter((record) => record.stepKey !== stepKey);
      const samples = state.samples.filter((sample) => sample.stepKey !== stepKey);

      return {
        steps,
        selectedStepKey: steps.length ? steps[steps.length - 1].key : undefined,
        stepOutputs: restOutputs,
        stepRunStates: restRunStates,
        runTimeline,
        samples,
      };
    });
  },
  reorderSteps: (sourceIndex: number, targetIndex: number) => {
    set((state) => {
      if (
        sourceIndex < 0 ||
        sourceIndex >= state.steps.length ||
        targetIndex < 0 ||
        targetIndex >= state.steps.length
      ) {
        return {};
      }
      const steps = [...state.steps];
      const [moved] = steps.splice(sourceIndex, 1);
      steps.splice(targetIndex, 0, moved);
      return { steps };
    });
  },
  selectStep: (stepKey?: string) => set({ selectedStepKey: stepKey }),
  updateConfig: (stepKey: string, data: Record<string, unknown>) => {
    set((state) => ({
      steps: state.steps.map((step) =>
        step.key === stepKey ? { ...step, config: { ...step.config, ...data } } : step
      ),
    }));
  },
  runStep: async (stepKey: string, skipDependencies = false, originalStepKey?: string) => {
    const state = get();
    const step = state.steps.find((item) => item.key === stepKey);
    if (!step) {
      throw new Error(`Step ${stepKey} not found`);
    }

    // Track the original step key (the one user clicked Run on)
    const targetStepKey = originalStepKey || stepKey;

    // Run all previous nodes first (dependencies)
    if (!skipDependencies) {
      const currentIndex = state.steps.findIndex((s) => s.key === stepKey);
      if (currentIndex > 0) {
        for (let i = 0; i < currentIndex; i++) {
          const previousStep = state.steps[i];
          const previousState = get().stepRunStates[previousStep.key];
          
          // Only run if not already successfully run
          if (!previousState || previousState.status !== "success") {
            await get().runStep(previousStep.key, true, targetStepKey); // Pass original step key
            
            // Check if previous step failed
            const updatedState = get().stepRunStates[previousStep.key];
            if (updatedState?.status === "error") {
              throw new Error(`Cannot run ${stepKey}: dependency ${previousStep.key} failed`);
            }
          }
        }
      }
    }

    const definition = nodeDefinitions[step.schemaKey];
    if (!definition) {
      throw new Error(`Node definition missing for ${step.schemaKey}`);
    }

    set((store) => ({
      stepRunStates: {
        ...store.stepRunStates,
        [stepKey]: { status: "running", lastRun: store.stepRunStates[stepKey]?.lastRun },
      },
    }));

    const start = performance.now();
    const tokenContext: Record<string, unknown> = {};
    Object.entries(state.stepOutputs).forEach(([key, output]) => {
      tokenContext[`steps.${key}`] = output;
    });
    let resolvedConfig = resolveTokens(step.config, tokenContext);

    // Tự động truyền output của node trước vào tất cả các node (trừ Manual trigger)
    // Điều này giúp các node như IF/Switch/Filter/etc có thể xử lý data từ node trước
    let previousOutput: unknown = undefined;
    let previousNodeType: NodeDefinitionKey | undefined = undefined;
    
    // Collect inputs from all incoming edges (for MERGE node with multiple inputs)
    const inputsByHandle: Record<string, unknown> = {};
    const incomingEdges = state.customEdges.filter((e) => e.target === stepKey);
    
    if (step.schemaKey !== "manual") {
      if (incomingEdges.length > 0) {
        const primaryEdge = incomingEdges[0];
        const sourceOutput = state.stepOutputs[primaryEdge.source];
        const sourceStep = state.steps.find((s) => s.key === primaryEdge.source);
        
        if (sourceOutput !== undefined && sourceStep) {
          previousNodeType = sourceStep.schemaKey as NodeDefinitionKey;
          
          // Branch detection for IF/SWITCH nodes
          const isBranchingNode = (sourceStep.schemaKey === "if" || sourceStep.schemaKey === "switch");
          const hasBranchData = typeof sourceOutput === "object" && sourceOutput !== null && !Array.isArray(sourceOutput) &&
            (Object.prototype.hasOwnProperty.call(sourceOutput, 'TRUE') || Object.prototype.hasOwnProperty.call(sourceOutput, 'FALSE') || 
             Object.keys(sourceOutput as Record<string, unknown>).some(k => k.startsWith('case_')));
          
          if (isBranchingNode && hasBranchData) {
            let extractedBranch: string | undefined;
            
            if (primaryEdge.sourceHandle) {
              extractedBranch = primaryEdge.sourceHandle;
            }
            
            if (extractedBranch) {
              const branchData = (sourceOutput as Record<string, unknown>)[extractedBranch];
              
              if (branchData !== undefined) {
                previousOutput = branchData;
              } else {
                previousOutput = sourceOutput;
              }
            } else {
              previousOutput = sourceOutput;
            }
          } else {
            previousOutput = sourceOutput;
          }
          
          if (previousOutput !== undefined) {
            resolvedConfig = { ...resolvedConfig, __previousOutput: previousOutput };
          }
        }
      } else {
        // Priority 2: Fallback to sequential previous step (old behavior)
        const currentIndex = state.steps.findIndex((s) => s.key === stepKey);
        if (currentIndex > 0) {
          const previousStep = state.steps[currentIndex - 1];
          previousOutput = state.stepOutputs[previousStep.key];
          previousNodeType = previousStep.schemaKey as NodeDefinitionKey;
          
          if (previousOutput !== undefined) {
            resolvedConfig = { ...resolvedConfig, __previousOutput: previousOutput };
          }
        }
      }
    }
    
    // Build inputsByHandle map for nodes with multiple inputs (MERGE)
    for (const edge of incomingEdges) {
      const sourceOutput = state.stepOutputs[edge.source];
      if (sourceOutput !== undefined) {
        const handleId = edge.targetHandle || "default";
        
        // Extract branch data if connecting from IF/SWITCH
        if (edge.sourceHandle && typeof sourceOutput === "object" && sourceOutput !== null && !Array.isArray(sourceOutput)) {
          const branchData = (sourceOutput as Record<string, unknown>)[edge.sourceHandle];
          inputsByHandle[handleId] = branchData !== undefined ? branchData : sourceOutput;
        } else {
          inputsByHandle[handleId] = sourceOutput;
        }
      }
    }

    // Pass all step outputs to runtime for per-item token resolution (used by SET node)
    resolvedConfig = { ...resolvedConfig, __stepOutputs: tokenContext };

    try {
      const runtimeResult = await definition.run({
        config: step.config,
        resolvedConfig,
        previousOutput,
        previousNodeType,
        currentNodeKey: stepKey,
        allStepOutputs: state.stepOutputs,
        inputsByHandle, // Add inputs from multiple handles
      });
      const duration = runtimeResult.durationMs ?? performance.now() - start;
      
      // Flatten output to normalize data structure
      const flattenedOutput = flattenOutput(runtimeResult.output);
      
      const runRecord: RunRecord = {
        stepKey: step.key,
        resolvedInput: maskSensitive(resolvedConfig),
        output: maskSensitive(flattenedOutput),
        status: runtimeResult.status,
        durationMs: duration,
        at: new Date().toISOString(),
      };

      set((store) => ({
        stepOutputs: { ...store.stepOutputs, [step.key]: flattenedOutput },
        stepRunStates: {
          ...store.stepRunStates,
          [step.key]: {
            status: "success",
            lastRun: runRecord,
            requestPreview: runtimeResult.requestPreview,
            response: runtimeResult.response,
          },
        },
        runTimeline: [...store.runTimeline, runRecord],
        showResultPanel: true, // Auto-open result panel on successful run
        // Select only the original step that user clicked Run on
        selectedStepKey: stepKey === targetStepKey ? targetStepKey : store.selectedStepKey,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const duration = performance.now() - start;
      const errorRecord: RunRecord = {
        stepKey: step.key,
        resolvedInput: maskSensitive(resolvedConfig),
        error: { code: "runtime", message },
        durationMs: duration,
        at: new Date().toISOString(),
      };

      set((store) => ({
        stepRunStates: {
          ...store.stepRunStates,
          [step.key]: {
            status: "error",
            errorMessage: message,
            lastRun: errorRecord,
          },
        },
        runTimeline: [...store.runTimeline, errorRecord],
      }));
    }
  },
  runFlow: async () => {
    const state = get();
    if (!state.steps.length) {
      return;
    }
    set({ isRunningFlow: true });
    for (const step of state.steps) {
      await get().runStep(step.key);
      const lastState = get().stepRunStates[step.key];
      if (lastState?.status === "error") {
        break;
      }
    }
    set({ isRunningFlow: false });
  },
  markSample: (stepKey: string) => {
    const { stepOutputs, steps, stepRunStates } = get();
    const output = stepOutputs[stepKey];
    if (typeof output === "undefined") {
      return;
    }
    const step = steps.find((item) => item.key === stepKey);
    if (!step) {
      return;
    }
    const runMeta = stepRunStates[stepKey]?.lastRun;
    const catalogEntry: SampleCatalogEntry = {
      stepKey,
      schemaKey: step.schemaKey,
      label: `${step.name} sample ${new Date().toLocaleTimeString()}`,
      createdAt: new Date().toISOString(),
      data: output,
      metadata: {
        durationMs: runMeta?.durationMs,
        status: runMeta?.status,
      },
    };
    set((store) => ({ samples: [catalogEntry, ...store.samples] }));
  },
  exportFlow: () => {
    const stateSnapshot = get();
    const flow: FlowConfig = {
      steps: stateSnapshot.steps.map((step) => ({
        key: step.key,
        type: step.schemaKey,
        config: step.config,
      })),
      mappings: extractMappings(stateSnapshot.steps),
    };
    return flow;
  },
  importFlow: (flow: FlowConfig) => {
    const steps = flow.steps.map((step): StepInstance => {
      const definition = nodeDefinitions[step.type as NodeDefinitionKey];
      const name = definition ? definition.schema.name : step.type;
      return {
        key: step.key,
        schemaKey: step.type as NodeDefinitionKey,
        name,
        config: step.config,
        createdAt: new Date().toISOString(),
      };
    });

    const stepRunStates: Record<string, StepRunState> = {};
    steps.forEach((step: StepInstance) => {
      stepRunStates[step.key] = { status: "idle" };
    });

    set({
      steps,
      selectedStepKey: steps[0]?.key,
      stepOutputs: {},
      stepRunStates,
      runTimeline: [],
    });
  },
  clearLogs: (stepKey?: string) => {
    if (!stepKey) {
      set({ runTimeline: [] });
      return;
    }
    set((state) => ({
      runTimeline: state.runTimeline.filter((record) => record.stepKey !== stepKey),
      stepRunStates: {
        ...state.stepRunStates,
        [stepKey]: { status: "idle" },
      },
    }));
  },
  setShowConfigPanel: (show: boolean) => {
    set({ showConfigPanel: show });
  },
  setShowResultPanel: (show: boolean) => {
    set({ showResultPanel: show });
  },
  triggerAutoLayout: () => {
    set((state) => ({ layoutTrigger: state.layoutTrigger + 1 }));
  },
  toggleLayoutDirection: () => {
    set((state) => ({
      layoutDirection: state.layoutDirection === "TB" ? "LR" : "TB",
      layoutTrigger: state.layoutTrigger + 1, // Also trigger re-layout
    }));
  },
  updateEdges: (edges: CustomEdge[]) => {
    set({ customEdges: edges });
  },
  addEdge: (edge: CustomEdge) => {
    set((state) => ({
      customEdges: [...state.customEdges, edge],
    }));
  },
  removeEdge: (edgeId: string) => {
    set((state) => ({
      customEdges: state.customEdges.filter((e) => e.id !== edgeId)
    }));
  },
  saveNodePositions: (positions: Record<string, { x: number; y: number }>) => {
    set({ nodePositions: positions });
  },
});

export const useFlowStore = create<FlowStore>(storeCreator);



function extractMappings(steps: StepInstance[]): Record<string, unknown> {
  const mappings: Record<string, unknown> = {};
  steps.forEach((step) => {
    const found = findTokens(step.config);
    if (Object.keys(found).length) {
      mappings[step.key] = found;
    }
  });
  return mappings;
}

function findTokens(value: unknown, path: string[] = []): Record<string, string[]> {
  const tokens: Record<string, string[]> = {};

  if (typeof value === "string") {
    const matches = value.match(/\{\{\s*steps\.[^}]+\}\}/g);
    if (matches) {
      tokens[path.join(".")] = matches;
    }
    return tokens;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const childTokens = findTokens(item, [...path, String(index)]);
      mergeTokenRecords(tokens, childTokens);
    });
    return tokens;
  }

  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, val]) => {
      const childTokens = findTokens(val, [...path, key]);
      mergeTokenRecords(tokens, childTokens);
    });
    return tokens;
  }

  return tokens;
}

function mergeTokenRecords(target: Record<string, string[]>, source: Record<string, string[]>): void {
  Object.entries(source).forEach(([key, value]) => {
    if (!target[key]) {
      target[key] = [];
    }
    target[key] = Array.from(new Set([...target[key], ...value]));
  });
}
