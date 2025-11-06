import { useMemo, useState, useEffect } from "react";
import { DataFieldsPanel } from "./DataFieldsPanel";
import { useFlowStore } from "../state/flow-store";
import type { RunRecord, SampleCatalogEntry } from "@node-playground/types";
import { getBranchConnection } from "../utils/run-data";

const TAB_ORDER: Array<"logs" | "data"> = [
  "data",
  "logs",
];

export function ResultPanel(): JSX.Element {
  const [activeTab, setActiveTab] = useState<(typeof TAB_ORDER)[number]>("data");
  const [resultNodeKey, setResultNodeKey] = useState<string | null>(null);
  const selectedStepKey = useFlowStore((state) => state.selectedStepKey);
  const runTimeline = useFlowStore((state) => state.runTimeline);
  const stepOutputs = useFlowStore((state) => state.stepOutputs);
  const stepRunStates = useFlowStore((state) => state.stepRunStates);
  const samples = useFlowStore((state) => state.samples);
  const markSample = useFlowStore((state) => state.markSample);
  const clearLogs = useFlowStore((state) => state.clearLogs);
  const steps = useFlowStore((state) => state.steps);
  const customEdges = useFlowStore((state) => state.customEdges);

  // Auto-select nearest branching ancestor when selectedStepKey changes
  useEffect(() => {
    if (!selectedStepKey) {
      setResultNodeKey(null);
      return;
    }

    // Find nearest branching ancestor (IF/SWITCH node)
    const findBranchingAncestor = (nodeKey: string, visited = new Set<string>()): string | null => {
      if (visited.has(nodeKey)) return null; // Prevent infinite loop
      visited.add(nodeKey);

      // Find incoming edges to this node
      const incomingEdges = customEdges.filter((e) => e.target === nodeKey);
      if (incomingEdges.length === 0) return null;

      // Get source node of the first incoming edge
      const sourceKey = incomingEdges[0].source;
      const sourceNode = steps.find((s) => s.key === sourceKey);
      if (!sourceNode) return null;

      // Check if source is a branching node (IF/SWITCH)
      const isBranching = sourceNode.schemaKey === "if" || sourceNode.schemaKey === "switch";
      
      if (isBranching) {
        return sourceKey; // Found branching ancestor
      } else {
        // Continue tracing upward
        return findBranchingAncestor(sourceKey, visited);
      }
    };

    const branchingAncestor = findBranchingAncestor(selectedStepKey);
    
    if (branchingAncestor) {
      setResultNodeKey(branchingAncestor);
    } else {
      // No branching ancestor found - fall back to immediate previous node
      const selectedIndex = steps.findIndex((s) => s.key === selectedStepKey);
      if (selectedIndex > 0) {
        const previousNode = steps[selectedIndex - 1];
        setResultNodeKey(previousNode.key);
      } else {
        // First node or no previous node - show the selected node itself
        setResultNodeKey(selectedStepKey);
      }
    }
  }, [selectedStepKey, steps, customEdges]);

  const logs = useMemo(
    () =>
      selectedStepKey
        ? runTimeline
            .filter((record: RunRecord) => record.stepKey === selectedStepKey)
            .reverse()
        : [],
    [runTimeline, selectedStepKey]
  );

  // Show output of the selected result node (or all nodes if none selected)
  const combinedOutputs = useMemo(() => {
    const outputs: Record<string, unknown> = {};
    
    if (resultNodeKey) {
      // Check if this is a branching node (IF/SWITCH)
      const resultStep = steps.find(s => s.key === resultNodeKey);
      const isBranchingNode = resultStep && (resultStep.schemaKey === 'if' || resultStep.schemaKey === 'switch');
      
      if (isBranchingNode) {
        // For branching nodes: collect all branch outputs (if-TRUE, if-FALSE)
        const branchOutputs: Record<string, unknown> = {};
        Object.keys(stepOutputs).forEach(key => {
          if (key.startsWith(`${resultNodeKey}-`)) {
            const branchName = key.substring(resultNodeKey.length + 1); // Extract "TRUE", "FALSE", etc.
            branchOutputs[branchName] = stepOutputs[key];
          }
        });
        
        if (Object.keys(branchOutputs).length > 0) {
          // Show as object with branch keys (like original IF output format)
          outputs[resultNodeKey] = branchOutputs;
        }
      } else if (stepOutputs[resultNodeKey] !== undefined) {
        // Normal node: show direct output (previous node data)
        outputs[resultNodeKey] = stepOutputs[resultNodeKey];
      }
    } else {
      // No result node selected - show all outputs from nodes before selected canvas node
      const selectedIndex = selectedStepKey 
        ? steps.findIndex((s) => s.key === selectedStepKey)
        : -1;
      
      if (selectedIndex > 0) {
        for (let i = 0; i < selectedIndex; i++) {
          const stepKey = steps[i].key;
          const step = steps[i];
          const isBranchingNode = step.schemaKey === 'if' || step.schemaKey === 'switch';
          
          if (isBranchingNode) {
            // Collect branch outputs
            const branchOutputs: Record<string, unknown> = {};
            Object.keys(stepOutputs).forEach(key => {
              if (key.startsWith(`${stepKey}-`)) {
                const branchName = key.substring(stepKey.length + 1);
                branchOutputs[branchName] = stepOutputs[key];
              }
            });
            if (Object.keys(branchOutputs).length > 0) {
              outputs[stepKey] = branchOutputs;
            }
          } else if (stepOutputs[stepKey] !== undefined) {
            outputs[stepKey] = stepOutputs[stepKey];
          }
        }
      }
    }
    
    // Always include samples
    samples.forEach((sample: SampleCatalogEntry) => {
      outputs[`sample:${sample.label}`] = sample.data;
    });
    
    return outputs;
  }, [stepOutputs, samples, selectedStepKey, steps, resultNodeKey]);

  // Calculate connected branches for each step
  const connectedBranches = useMemo(() => {
    if (!selectedStepKey) return {};
    
    const branches: Record<string, string> = {};
    
    // Find edges connecting to selected step
    const incomingEdges = customEdges.filter(e => e.target === selectedStepKey);
    
    // PRIORITY 1: Use edge.sourceHandle directly (most reliable)
    // This works both before and after running nodes
    incomingEdges.forEach(edge => {
      if (edge.sourceHandle) {
        const sourceStep = steps.find(s => s.key === edge.source);
        if (sourceStep && (sourceStep.schemaKey === 'if' || sourceStep.schemaKey === 'switch')) {
          // Normalize handle: IF node uses "TRUE"/"FALSE", Switch uses case names
          const normalizedHandle = sourceStep.schemaKey === 'if' 
            ? edge.sourceHandle.toUpperCase() 
            : edge.sourceHandle;
          branches[edge.source] = normalizedHandle;
        }
      }
    });
    
    // If we found branches from edges, return immediately
    if (Object.keys(branches).length > 0) {
      return branches;
    }
    
    // FALLBACK: Use item lineage tracing (only when no sourceHandle available)
    const selectedRunState = stepRunStates[selectedStepKey];
    const targetRunRecord = selectedRunState?.lastRun;
    
    if (!targetRunRecord) {
      return branches;
    }
    
    const sourceNodes = new Set<string>();
    
    if (targetRunRecord?.source) {
      targetRunRecord.source.forEach(s => sourceNodes.add(s.previousNode));
    }
    
    incomingEdges.forEach(e => sourceNodes.add(e.source));
    
    for (const sourceKey of sourceNodes) {
      const sourceRunState = stepRunStates[sourceKey];
      const sourceRunRecord = sourceRunState?.lastRun;
      
      const connection = getBranchConnection(
        sourceKey,
        selectedStepKey,
        targetRunRecord,
        sourceRunRecord,
        customEdges,
        steps
      );
      
      if (connection.isMixed) {
        branches[sourceKey] = "MIXED";
      } else if (connection.branch) {
        branches[sourceKey] = connection.branch;
      }
    }
    
    return branches;
  }, [selectedStepKey, customEdges, steps, stepRunStates]);

  // Get available nodes for dropdown - only ancestors, no self or siblings
  const availableNodes = useMemo(() => {
    if (!selectedStepKey) return [];
    
    // Build set of all ancestors by tracing backward through edges
    const ancestors = new Set<string>();
    const visited = new Set<string>();
    
    const traceAncestors = (nodeKey: string) => {
      if (visited.has(nodeKey)) return;
      visited.add(nodeKey);
      
      const incomingEdges = customEdges.filter(e => e.target === nodeKey);
      for (const edge of incomingEdges) {
        ancestors.add(edge.source);
        traceAncestors(edge.source); // Recursive trace
      }
    };
    
    traceAncestors(selectedStepKey);
    
    // FALLBACK: If no edges found, use simple sequential order (all nodes before selected)
    if (ancestors.size === 0) {
      const selectedIndex = steps.findIndex(s => s.key === selectedStepKey);
      if (selectedIndex > 0) {
        for (let i = 0; i < selectedIndex; i++) {
          ancestors.add(steps[i].key);
        }
      }
    }
    
    // Filter steps: must be ancestor AND have output data
    return steps
      .filter(step => ancestors.has(step.key) && stepOutputs[step.key] !== undefined);
  }, [selectedStepKey, steps, stepOutputs, customEdges]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-gray-50">
      <header className="flex items-center gap-2 border-b-2 border-emerald-100 bg-white px-4 py-3">
        <h2 className="text-sm font-bold text-emerald-800">Output</h2>
        
        {/* Node selector dropdown */}
        {availableNodes.length > 0 && (
          <select
            value={resultNodeKey || ""}
            onChange={(e) => setResultNodeKey(e.target.value || null)}
            className="ml-auto rounded-md border-2 border-emerald-300 bg-white px-2 py-1 text-xs font-semibold text-emerald-800 focus:border-emerald-500 focus:outline-none"
            aria-label="Select node to view output"
          >
            <option value="">-- None --</option>
            {availableNodes.map((step) => (
              <option key={step.key} value={step.key}>
                {step.key} - {step.name}
              </option>
            ))}
          </select>
        )}
      </header>

      <nav className="flex items-center gap-2 border-b-2 border-gray-200 bg-white px-4 py-2 text-sm shadow-sm">
        {TAB_ORDER.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 font-bold transition-all ${
              activeTab === tab 
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
            }`}
          >
            {tab === "logs" && "📜 "}
            {tab === "data" && "🗂️ "}
            {tab.toUpperCase()}
          </button>
        ))}
      </nav>

      <div className="flex-1 overflow-hidden bg-white">
        {activeTab === "logs" && <LogsPanel logs={logs} />}
        {activeTab === "data" && (
          <DataFieldsPanel 
            outputs={combinedOutputs} 
            selectedStepKey={selectedStepKey}  // Canvas selected node (for branch lock logic)
            resultNodeKey={resultNodeKey}       // Result panel selected node (for display)
            connectedBranches={connectedBranches} 
          />
        )}
      </div>
    </div>
  );
}

interface LogsPanelProps {
  logs: RunRecord[];
}

function LogsPanel({ logs }: LogsPanelProps): JSX.Element {
  if (!logs.length) {
    return <EmptyState message="Logs will appear here when you run nodes." />;
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-4 text-xs">
      <ul className="space-y-4">
        {logs.map((log) => (
          <li key={log.at} className="rounded-lg border border-ink-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
            <header className="mb-3 flex items-center justify-between border-b border-ink-100 pb-2 text-ink-600">
              <span className="font-semibold text-sm">{new Date(log.at).toLocaleTimeString()}</span>
              <span className="text-xs">
                {typeof log.status !== "undefined" ? `✓ Status ${log.status}` : "✗ Error"} · {log.durationMs?.toFixed(0)} ms
              </span>
            </header>
            <div className="grid grid-cols-2 gap-4 text-ink-600">
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-ink-500 mb-2">Resolved Input</h4>
                <pre className="max-h-48 overflow-auto rounded-md bg-ink-50 p-3 text-xs border border-ink-200">
                  {JSON.stringify(log.resolvedInput, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-ink-500 mb-2">Output</h4>
                {log.error ? (
                  <pre className="max-h-48 overflow-auto rounded-md bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                    {log.error.message}
                  </pre>
                ) : (
                  <pre className="max-h-48 overflow-auto rounded-md bg-emerald-50 p-3 text-xs border border-emerald-200">
                    {JSON.stringify(trimOutput(log.output), null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface EmptyStateProps {
  message: string;
}

function EmptyState({ message }: EmptyStateProps): JSX.Element {
  return (
    <div className="flex h-full items-center justify-center px-4 py-4 text-sm text-ink-500">
      {message}
    </div>
  );
}

function trimOutput(output: unknown): unknown {
  if (typeof output === "string" && output.length > 256) {
    return `${output.slice(0, 256)}…`;
  }
  if (Array.isArray(output)) {
    return output.slice(0, 10);
  }
  return output;
}
