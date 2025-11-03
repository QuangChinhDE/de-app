import { useRef, type ChangeEvent } from "react";
import { useFlowStore } from "../state/flow-store";

export function Toolbar(): JSX.Element {
  const runFlow = useFlowStore((state) => state.runFlow);
  const exportFlow = useFlowStore((state) => state.exportFlow);
  const importFlow = useFlowStore((state) => state.importFlow);
  const isRunningFlow = useFlowStore((state) => state.isRunningFlow);
  const triggerAutoLayout = useFlowStore((state) => state.triggerAutoLayout);
  const toggleLayoutDirection = useFlowStore((state) => state.toggleLayoutDirection);
  const layoutDirection = useFlowStore((state) => state.layoutDirection);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExport = () => {
    const data = exportFlow();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `node-playground-flow-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const text = await file.text();
    try {
      const payload = JSON.parse(text);
      importFlow(payload);
    } catch (error) {
      // eslint-disable-next-line no-alert
      alert(`Failed to import flow: ${(error as Error).message}`);
    }
  };

  return (
    <header className="flex items-center gap-2 border-b border-ink-200 bg-white px-4 py-3">
      <h1 className="text-lg font-semibold text-ink-800">Workflow Debugger</h1>
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => toggleLayoutDirection()}
          className="rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-purple-500"
          title={layoutDirection === "TB" ? "Switch to Horizontal Layout (→)" : "Switch to Vertical Layout (↓)"}
        >
          {layoutDirection === "TB" ? "⬇️ Vertical" : "➡️ Horizontal"}
        </button>
        <button
          type="button"
          onClick={() => triggerAutoLayout()}
          className="rounded-md bg-purple-500 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-purple-400"
          title="Re-arrange nodes with current layout direction"
        >
          🎨 Re-layout
        </button>
        <button
          type="button"
          onClick={async () => {
            try {
              const response = await fetch('/test-workflow-import.json');
              const payload = await response.json();
              importFlow(payload);
              // eslint-disable-next-line no-alert
              alert('✅ Test workflow loaded! Click "Run flow" to execute.');
            } catch (error) {
              // eslint-disable-next-line no-alert
              alert(`Failed to load test workflow: ${(error as Error).message}`);
            }
          }}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-500"
        >
          🧪 Load Test Workflow
        </button>
        <button
          type="button"
          onClick={() => runFlow()}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-ink-300"
          disabled={isRunningFlow}
        >
          {isRunningFlow ? "Running..." : "▶️ Run flow"}
        </button>
        <button
          type="button"
          onClick={handleExport}
          className="rounded-md border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-100"
        >
          Export JSON
        </button>
        <button
          type="button"
          onClick={handleImportClick}
          className="rounded-md border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-100"
        >
          Import JSON
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleImport}
        aria-label="Import flow configuration JSON"
      />
    </header>
  );
}
