import { create } from "zustand";
import type {
  FlowConfig,
  RunRecord,
  SampleCatalogEntry,
  INodeExecutionOutput,
  AdvancedOptions,
} from "@node-playground/types";
import { nodeDefinitions, type NodeDefinitionKey } from "../nodes";
import { resolveTokens, maskSensitive } from "../utils/expression";
import { executeWithRegistry } from "./execution";
import type { HttpRunResult } from "@node-playground/types";
import { log } from "../utils/logger";

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

// Helper to get nested value using dot notation
function getNestedValue(obj: unknown, path: string): unknown {
  if (!isObject(obj)) return undefined;
  
  const keys = path.split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (!isObject(current)) return undefined;
    current = current[key];
  }
  
  return current;
}

// Apply advanced options (post-processing): Wait → Sort → Limit
async function applyAdvancedOptions(data: unknown, options: AdvancedOptions): Promise<unknown> {
  let result = data;
  
  // 1. Wait (delay execution)
  if (options.wait?.enabled && options.wait.duration > 0) {
    await new Promise(resolve => setTimeout(resolve, options.wait!.duration));
  }
  
  // 2. Sort (only works on arrays)
  if (options.sort?.enabled && options.sort.field && Array.isArray(result)) {
    const field = options.sort.field;
    const order = options.sort.order;
    
    result = [...result].sort((a, b) => {
      const aVal = getNestedValue(a, field);
      const bVal = getNestedValue(b, field);
      
      // Handle undefined/null
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      
      // Compare values
      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }
      
      return order === 'asc' ? comparison : -comparison;
    });
  }
  
  // 3. Limit (skip/take)
  if (options.limit?.enabled && Array.isArray(result)) {
    const skip = options.limit.skip || 0;
    const take = options.limit.take || result.length;
    
    result = result.slice(skip, skip + take);
  }
  
  return result;
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
  renameStep: (stepKey: string, newName: string) => { success: boolean; error?: string };
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
      // Generate unique name first, then derive key from name
      // This ensures key and name are always in sync
      const sameTypeNodes = state.steps.filter((step) => step.schemaKey === schemaKey);
      const index = sameTypeNodes.length + 1;
      
      // Ensure name is unique by checking existing names
      let finalName = `${definition.schema.name}`;
      let nameIndex = index;
      
      if (index > 1 || state.steps.some(s => s.name === finalName)) {
        finalName = `${definition.schema.name} ${nameIndex}`;
      }
      
      // Double check name uniqueness
      while (state.steps.some(s => s.name === finalName)) {
        nameIndex++;
        finalName = `${definition.schema.name} ${nameIndex}`;
      }
      
      // Derive key from name: normalize to lowercase, remove spaces, keep alphanumeric only
      // Example: "IF 2" -> "if2", "HTTP Request 3" -> "httprequest3"
      const key = finalName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
      
      // Ensure key uniqueness (should be guaranteed by unique name, but double check)
      let finalKey = key;
      let keyIndex = 1;
      while (state.steps.some(s => s.key === finalKey)) {
        keyIndex++;
        finalKey = `${key}${keyIndex}`;
      }
      
      const now = new Date().toISOString();
      const step: StepInstance = {
        key: finalKey,
        schemaKey,
        name: finalName,
        config: definition.createInitialConfig(),
        createdAt: now,
      };
      
      log.success('Node added to workflow', { 
        nodeKey: step.key, 
        stepName: step.name,
        nodeType: schemaKey 
      });
      
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
  renameStep: (stepKey: string, newName: string) => {
    const state = get();
    const trimmedName = newName.trim();
    
    // Validate: không được trống
    if (!trimmedName) {
      return { success: false, error: "Name cannot be empty" };
    }
    
    // Validate: không được trùng tên (case-insensitive)
    const isDuplicate = state.steps.some(
      (step) => step.key !== stepKey && step.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (isDuplicate) {
      return { success: false, error: `Name "${trimmedName}" already exists` };
    }
    
    // Update name
    set((state) => ({
      steps: state.steps.map((step) =>
        step.key === stepKey ? { ...step, name: trimmedName } : step
      ),
    }));
    
    return { success: true };
  },
  updateConfig: (stepKey: string, data: Record<string, unknown>) => {
    log.debug('Config update requested', {
      nodeKey: stepKey,
      dataKeys: Object.keys(data).join(', '),
      hasFields: 'fields' in data,
      isFieldsArray: Array.isArray(data.fields)
    });
    
    set((state) => {
      const targetStep = state.steps.find(s => s.key === stepKey);
      if (targetStep) {
        log.debug('Config before update', {
          nodeKey: stepKey,
          configKeys: Object.keys(targetStep.config).join(', ')
        });
      }
      
      const updatedSteps = state.steps.map((step) => {
        if (step.key !== stepKey) return step;
        
        // Deep clone data to prevent shared references between nodes
        const clonedData = JSON.parse(JSON.stringify(data));
        const newConfig = { ...step.config, ...clonedData };
        
        log.debug('Config updated with deep clone', {
          nodeKey: stepKey,
          configKeys: Object.keys(newConfig).join(', ')
        });
        
        return { ...step, config: newConfig };
      });
      
      // Check if any other steps share the same fields reference
      log.debug('Validating config references across steps');
      updatedSteps.forEach(step => {
        if (step.config.fields && Array.isArray(step.config.fields)) {
          const isSameAsUpdatedData = step.config.fields === data.fields;
          if (isSameAsUpdatedData && step.key !== stepKey) {
            log.error('Shared config reference detected!', undefined, {
              affectedNodeKey: step.key,
              targetNodeKey: stepKey,
              issue: 'Multiple nodes sharing same config object reference'
            });
          }
        }
        
        // Log all configs for debugging (only for SET nodes)
        if (step.schemaKey === 'set') {
          log.debug('SET node config state', {
            nodeKey: step.key,
            stepName: step.name,
            fieldCount: Array.isArray(step.config.fields) ? step.config.fields.length : 0
          });
        }
      });
      
      return { steps: updatedSteps };
    });
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
              
              // Normalize IF node handles: "true" → "TRUE", "false" → "FALSE"
              if (sourceStep.schemaKey === "if") {
                extractedBranch = extractedBranch.toUpperCase();
              }
            } else {
              // FALLBACK: Edge missing sourceHandle (old edge or import)
              // Try to detect from previous run's item lineage
              const targetRunState = state.stepRunStates[stepKey];
              const targetRunRecord = targetRunState?.lastRun;
              
              if (targetRunRecord?.source && targetRunRecord.source.length > 0) {
                const sourceInfo = targetRunRecord.source.find(s => s.previousNode === primaryEdge.source);
                if (sourceInfo?.previousNodeOutputKey) {
                  extractedBranch = sourceInfo.previousNodeOutputKey;
                }
              }
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
          const sourceStep = state.steps.find(s => s.key === edge.source);
          let normalizedHandle = edge.sourceHandle;
          
          // Normalize IF node handles: "true" → "TRUE", "false" → "FALSE"
          if (sourceStep?.schemaKey === "if") {
            normalizedHandle = edge.sourceHandle.toUpperCase();
          }
          
          const branchData = (sourceOutput as Record<string, unknown>)[normalizedHandle];
          inputsByHandle[handleId] = branchData !== undefined ? branchData : sourceOutput;
        } else {
          inputsByHandle[handleId] = sourceOutput;
        }
      }
    }

    // Pass all step outputs to runtime for per-item token resolution (used by SET node)
    resolvedConfig = { ...resolvedConfig, __stepOutputs: tokenContext };

    try {
      // Build execution context for executor registry
      const executionContext = {
        step,
        definition,
        resolvedConfig,
        previousOutput,
        previousNodeType,
        tokenContext,
        allSteps: state.steps,
        allEdges: state.customEdges,
        stepOutputs: state.stepOutputs,
      };

      const executionResult = await executeWithRegistry(executionContext as any);
      const runtimeResult = executionResult.runtimeResult;
      const duration = runtimeResult?.durationMs ?? performance.now() - start;

      // Normalize output for executionData conversion
      let normalizedOutput: unknown;
      if (runtimeResult && runtimeResult.outputs && Array.isArray(runtimeResult.outputs)) {
        const map: Record<string, unknown> = {};
        runtimeResult.outputs.forEach((o: any) => { map[String(o.label)] = o.data; });
        normalizedOutput = map;
      } else {
        normalizedOutput = runtimeResult.output;
      }

      // Flatten
      let flattenedOutput: unknown = flattenOutput(normalizedOutput);

      // Apply advanced options
      if (step.config.advanced) {
        flattenedOutput = await applyAdvancedOptions(flattenedOutput, step.config.advanced);
      }

      // Determine input executionData and sourceOutputIndex (same logic as before)
      let inputExecutionData: INodeExecutionOutput | undefined;
      let sourceOutputIndex: number | undefined;
      if (incomingEdges.length > 0) {
        const primaryEdge = incomingEdges[0];
        const sourceRunState = state.stepRunStates[primaryEdge.source];
        inputExecutionData = sourceRunState?.lastRun?.executionData;

        if (primaryEdge.sourceHandle && inputExecutionData) {
          const sourceStep = state.steps.find(s => s.key === primaryEdge.source);
          if (sourceStep?.schemaKey === "if") {
            const normalizedHandle = primaryEdge.sourceHandle.toUpperCase();
            sourceOutputIndex = normalizedHandle === "TRUE" ? 0 : 1;
          } else if (sourceStep?.schemaKey === "switch") {
            sourceOutputIndex = inputExecutionData.outputLabels?.indexOf(primaryEdge.sourceHandle) ?? 0;
          }
        }
      }

      const { convertToExecutionData } = await import("../utils/run-data");
      const executionData = convertToExecutionData(flattenedOutput, step.schemaKey, inputExecutionData, sourceOutputIndex);

      // Build source tracking
      const source: Array<{previousNode: string; previousNodeOutput?: number; previousNodeOutputKey?: string}> = [];
      for (const edge of incomingEdges) {
        if (state.stepOutputs[edge.source] !== undefined) {
          const sourceStep = state.steps.find(s => s.key === edge.source);
          let outputIndex: number | undefined;
          let outputKey: string | undefined;

          if (edge.sourceHandle) {
            if (sourceStep?.schemaKey === "if") {
              outputKey = edge.sourceHandle.toUpperCase();
              outputIndex = outputKey === "TRUE" ? 0 : 1;
            } else if (sourceStep?.schemaKey === "switch") {
              outputKey = edge.sourceHandle;
              if (outputKey.startsWith("case_")) outputIndex = parseInt(outputKey.substring(5), 10);
            }
          } else {
            outputIndex = 0;
          }

          source.push({ previousNode: edge.source, previousNodeOutput: outputIndex, previousNodeOutputKey: outputKey });
        }
      }

      const runRecord: RunRecord = {
        stepKey: step.key,
        resolvedInput: maskSensitive(resolvedConfig),
        output: maskSensitive(flattenedOutput),
        executionData,
        status: runtimeResult?.status,
        durationMs: duration,
        at: new Date().toISOString(),
        source: source.length > 0 ? source : undefined,
      };

      // Build final outputsToStore applying advanced options results
      const finalOutputs: Record<string, unknown> = {};
      if (executionResult.isBranchingNode && isObject(flattenedOutput)) {
        const map = flattenedOutput as Record<string, unknown>;
        Object.keys(map).forEach((label) => {
          finalOutputs[`${step.key}-${label}`] = map[label];
        });
      } else {
        finalOutputs[step.key] = flattenedOutput;
      }

      // Merge any outputsToStore provided by executor (but let finalOutputs take precedence)
      const mergedOutputs = { ...(executionResult.outputsToStore || {}), ...finalOutputs };

      set((store) => ({
        stepOutputs: { ...store.stepOutputs, ...mergedOutputs },
        stepRunStates: {
          ...store.stepRunStates,
          [step.key]: {
            status: "success",
            lastRun: runRecord,
            requestPreview: runtimeResult?.requestPreview,
            response: runtimeResult?.response,
          },
        },
        runTimeline: [...store.runTimeline, runRecord],
        showResultPanel: true,
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
        name: step.name,  // Preserve name for import
        config: step.config,
      })),
      edges: stateSnapshot.customEdges.map((edge) => ({
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      })),
      mappings: extractMappings(stateSnapshot.steps),
    };
    return flow;
  },
  importFlow: (flow: FlowConfig) => {
    const steps = flow.steps.map((step): StepInstance => {
      const definition = nodeDefinitions[step.type as NodeDefinitionKey];
      // Preserve name from export, fallback to definition name if not present
      const name = step.name || (definition ? definition.schema.name : step.type);
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

    // Restore edges if present
    const customEdges: CustomEdge[] = (flow.edges || []).map((edge, index) => ({
      id: `e${edge.source}-${edge.target}-${index}`,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
    }));

    set({
      steps,
      customEdges,
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
    set((state) => {
      const newStepOutputs = { ...state.stepOutputs };
      
      // Auto-create placeholder outputs for branching nodes when edge is created
      edges.forEach(edge => {
        if (edge.sourceHandle) {
          const sourceStep = state.steps.find(s => s.key === edge.source);
          
          // Check if source is branching node (IF/SWITCH)
          if (sourceStep && (sourceStep.schemaKey === 'if' || sourceStep.schemaKey === 'switch')) {
            let branchKey = edge.sourceHandle;
            
            // Normalize IF handles: "true" → "TRUE", "false" → "FALSE"
            if (sourceStep.schemaKey === 'if') {
              branchKey = branchKey.toUpperCase();
            }
            
            const outputKey = `${edge.source}-${branchKey}`;
            
            // Create placeholder if not exists (empty array)
            if (newStepOutputs[outputKey] === undefined) {
              newStepOutputs[outputKey] = [];
            }
          }
        }
      });
      
      return { 
        customEdges: edges,
        stepOutputs: newStepOutputs
      };
    });
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
