import { useMemo, useState, useEffect } from "react";
import { DataFieldsPanel } from "./DataFieldsPanel";
import { useFlowStore } from "../state/flow-store";
import type { RunRecord, SampleCatalogEntry } from "@node-playground/types";

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
  const samples = useFlowStore((state) => state.samples);
  const markSample = useFlowStore((state) => state.markSample);
  const clearLogs = useFlowStore((state) => state.clearLogs);
  const steps = useFlowStore((state) => state.steps);
  const customEdges = useFlowStore((state) => state.customEdges);

  // Auto-select previous node when selectedStepKey changes
  useEffect(() => {
    if (!selectedStepKey) {
      setResultNodeKey(null);
      return;
    }

    const selectedIndex = steps.findIndex((s) => s.key === selectedStepKey);
    if (selectedIndex > 0) {
      // Select the node right before current node
      const previousNode = steps[selectedIndex - 1];
      setResultNodeKey(previousNode.key);
    } else {
      setResultNodeKey(null);
    }
  }, [selectedStepKey, steps]);

  const logs = useMemo(
    () =>
      selectedStepKey
        ? runTimeline
            .filter((record: RunRecord) => record.stepKey === selectedStepKey)
            .reverse()
        : [],
    [runTimeline, selectedStepKey]
  );

  // Filter outputs: Only show nodes BEFORE the selected node
  const combinedOutputs = useMemo(() => {
    const outputs: Record<string, unknown> = {};
    
    // Find index of selected step
    const selectedIndex = selectedStepKey 
      ? steps.findIndex((s) => s.key === selectedStepKey)
      : -1;
    
    // Only include outputs from steps BEFORE selected step
    if (selectedIndex > 0) {
      for (let i = 0; i < selectedIndex; i++) {
        const stepKey = steps[i].key;
        if (stepOutputs[stepKey] !== undefined) {
          outputs[stepKey] = stepOutputs[stepKey];
        }
      }
    }
    
    // Always include samples
    samples.forEach((sample: SampleCatalogEntry) => {
      outputs[`sample:${sample.label}`] = sample.data;
    });
    
    return outputs;
  }, [stepOutputs, samples, selectedStepKey, steps]);

  // Calculate connected branches for each step (for branch filtering)
  const connectedBranches = useMemo(() => {
    if (!selectedStepKey) return {};
    
    const branches: Record<string, string> = {};
    
    // Find all edges going TO the selected step
    const incomingEdges = customEdges.filter(edge => edge.target === selectedStepKey);
    console.log(`[RESULTPANEL] 🔍 Connected branches for ${selectedStepKey}:`, { incomingEdges });
    
    // For each incoming edge, if it has sourceHandle, map the source step to that branch
    for (const edge of incomingEdges) {
      if (edge.sourceHandle) {
        branches[edge.source] = edge.sourceHandle;
        console.log(`[RESULTPANEL] ✅ Branch mapping: ${edge.source} → ${edge.sourceHandle}`);
      } else {
        console.log(`[RESULTPANEL] ❌ No sourceHandle for edge: ${edge.source} → ${edge.target}`);
      }
    }
    
    console.log(`[RESULTPANEL] 📋 Final connectedBranches:`, branches);
    return branches;
  }, [selectedStepKey, customEdges]);

  // Get available nodes for dropdown (nodes before current selected)
  const availableNodes = useMemo(() => {
    if (!selectedStepKey) return [];
    const selectedIndex = steps.findIndex((s) => s.key === selectedStepKey);
    if (selectedIndex <= 0) return [];
    return steps.slice(0, selectedIndex);
  }, [selectedStepKey, steps]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-gray-50">
      <header className="flex items-center gap-2 border-b-2 border-emerald-100 bg-white px-4 py-3">
        <h2 className="text-sm font-bold text-emerald-800">Output</h2>
        
        {/* Node selector dropdown */}
        {availableNodes.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-emerald-700">📌 Select Node:</label>
            <select
              value={resultNodeKey || ""}
              onChange={(e) => setResultNodeKey(e.target.value || null)}
              className="rounded-md border-2 border-emerald-300 bg-white px-2 py-1 text-xs font-semibold text-emerald-800 focus:border-emerald-500 focus:outline-none"
              aria-label="Select node to view output"
            >
              <option value="">-- None --</option>
              {availableNodes.map((step) => (
                <option key={step.key} value={step.key}>
                  {step.key} - {step.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="ml-auto flex items-center gap-2">
          {resultNodeKey && (
            <button
              type="button"
              onClick={() => markSample(resultNodeKey)}
              className="rounded-md border-2 border-emerald-500 bg-white px-3 py-1 text-xs font-bold uppercase text-emerald-700 transition hover:bg-emerald-500 hover:text-white"
            >
              💾 Mark sample
            </button>
          )}
          <button
            type="button"
            onClick={() => clearLogs(selectedStepKey)}
            className="rounded-md border-2 border-rose-300 bg-white px-3 py-1 text-xs font-bold uppercase text-rose-600 transition hover:bg-rose-500 hover:text-white"
          >
            🗑️ Clear
          </button>
        </div>
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
        {activeTab === "data" && <DataFieldsPanel outputs={combinedOutputs} selectedStepKey={resultNodeKey || undefined} connectedBranches={connectedBranches} />}
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
