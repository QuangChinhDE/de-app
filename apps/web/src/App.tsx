import { useEffect } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { useFlowStore } from "./state/flow-store";
import { Sidebar } from "./components/Sidebar";
import { FlowCanvas } from "./components/FlowCanvas";
import { ConfigPanel } from "./components/ConfigPanel";
import { ResultPanel } from "./components/ResultPanel";

export default function App(): JSX.Element {
  const steps = useFlowStore((state) => state.steps);
  const selectedStepKey = useFlowStore((state) => state.selectedStepKey);
  const selectStep = useFlowStore((state) => state.selectStep);
  const stepOutputs = useFlowStore((state) => state.stepOutputs);
  const showConfig = useFlowStore((state) => state.showConfigPanel);
  const showResult = useFlowStore((state) => state.showResultPanel);
  const setShowConfig = useFlowStore((state) => state.setShowConfigPanel);
  const setShowResult = useFlowStore((state) => state.setShowResultPanel);
  const importFlow = useFlowStore((state) => state.importFlow);

  // Auto-load test workflow on first mount
  useEffect(() => {
    if (steps.length === 0) {
      fetch('/test-workflow-import.json')
        .then(response => response.json())
        .then(payload => {
          importFlow(payload);
          console.log('✅ Test workflow auto-loaded');
        })
        .catch(error => {
          console.error('Failed to auto-load test workflow:', error);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Auto-select first step if none selected
  useEffect(() => {
    if (steps.length > 0 && !selectedStepKey) {
      selectStep(steps[0].key);
    }
  }, [steps, selectedStepKey, selectStep]);

  // Open result when any node has output
  useEffect(() => {
    if (Object.keys(stepOutputs).length > 0) {
      setShowResult(true);
    }
  }, [stepOutputs, setShowResult]);

  // Calculate layout widths based on what's open
  const bothOpen = showConfig && showResult;
  const canvasWidth = !showConfig && !showResult ? "100%" : bothOpen ? "33.33%" : "66.67%";
  const panelWidth = bothOpen ? "33.33%" : "33.33%";

  return (
    <ReactFlowProvider>
      <div className="flex h-screen overflow-hidden bg-ink-50 text-ink-900">
        {/* Left: Sidebar - Node Palette */}
        <aside className="border-r-2 border-ink-300 bg-gradient-to-b from-ink-100 to-ink-50 shadow-lg">
          <Sidebar />
        </aside>

        {/* Center: Canvas - Workflow Visualization */}
        <main 
          className="flex overflow-hidden border-r-2 border-ink-300 bg-gradient-to-br from-ink-50 to-white transition-all duration-300"
          style={{ width: canvasWidth }}
        >
          <FlowCanvas />
        </main>

        {/* Middle: Results Panel */}
        {showResult && (
          <aside 
            className="flex flex-col border-r-2 border-ink-300 bg-gray-50 shadow-2xl transition-all duration-300"
            style={{ width: panelWidth }}
          >
            <div className="flex items-center justify-between border-b border-emerald-200 bg-gradient-to-r from-emerald-50 to-white px-4 py-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                📊 Results
                <span className="ml-2 text-[10px] text-emerald-500">(Drag zone - Kéo data từ đây)</span>
              </h2>
              <button
                onClick={() => setShowResult(false)}
                className="text-ink-400 hover:text-red-600 transition-colors"
                title="Close results panel"
              >
                ✕
              </button>
            </div>
            <ResultPanel />
          </aside>
        )}

        {/* Right: Configuration Panel */}
        {showConfig && (
          <aside 
            className="flex flex-col bg-white shadow-2xl transition-all duration-300"
            style={{ width: panelWidth }}
          >
            <div className="flex items-center justify-between border-b border-indigo-200 bg-gradient-to-r from-indigo-50 to-white px-4 py-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                ⚙️ Configuration
                <span className="ml-2 text-[10px] text-indigo-500">(Drop zone - Thả data vào đây)</span>
              </h2>
              <button
                onClick={() => setShowConfig(false)}
                className="text-ink-400 hover:text-red-600 transition-colors"
                title="Close configuration panel"
              >
                ✕
              </button>
            </div>
            <ConfigPanel />
          </aside>
        )}
      </div>
    </ReactFlowProvider>
  );
}
