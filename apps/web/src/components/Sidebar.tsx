import { useMemo, useState } from "react";
import { nodeSchemas } from "../nodes";
import type { NodeDefinitionKey } from "../nodes/types";
import { useFlowStore } from "../state/flow-store";
import { NODE_CATEGORY_COLORS, type NodeCategory } from "../constants/node-colors";

export function Sidebar(): JSX.Element {
  const addStep = useFlowStore((state) => state.addStep);
  const runFlow = useFlowStore((state) => state.runFlow);
  const exportFlow = useFlowStore((state) => state.exportFlow);
  const importFlow = useFlowStore((state) => state.importFlow);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  
  // Collapsible categories state
  const [expandedCategories, setExpandedCategories] = useState<Record<NodeCategory, boolean>>({
    trigger: true,
    action: true,
    utility: true,
  });

  // Group and filter nodes by category and search
  const nodesByCategory = useMemo(() => {
    const grouped: Record<NodeCategory, typeof nodeSchemas> = {
      trigger: [],
      action: [],
      utility: [],
    };
    
    const query = searchQuery.toLowerCase().trim();
    
    nodeSchemas.forEach((schema) => {
      // Filter by search query
      if (query && !schema.name.toLowerCase().includes(query) && !schema.key.toLowerCase().includes(query)) {
        return;
      }
      
      const category = schema.type as NodeCategory;
      grouped[category].push(schema);
    });
    
    return grouped;
  }, [searchQuery]);

  const toggleCategory = (category: NodeCategory) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleAddNode = (key: string) => {
    addStep(key as NodeDefinitionKey);
  };

  const handleExport = () => {
    const flow = exportFlow();
    const blob = new Blob([JSON.stringify(flow, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flow.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        return;
      }
      const text = await file.text();
      const flow = JSON.parse(text);
      importFlow(flow);
    };
    input.click();
  };

  return (
    <aside className="flex h-screen w-72 flex-col bg-gradient-to-b from-slate-800 to-slate-900 text-white shadow-2xl">
      {/* Header */}
      <div className="border-b-2 border-slate-700 bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-4 shadow-lg">
        <h1 className="mb-1 text-lg font-black uppercase tracking-wider text-white">
          ⚡ Node Playground
        </h1>
        <p className="text-xs text-indigo-100">Build & Test Workflows</p>
      </div>

      {/* Flow Controls */}
      <div className="border-b-2 border-slate-700 bg-slate-800 px-4 py-4">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
          🎮 Flow Controls
        </h2>
        <button
          type="button"
          onClick={() => void runFlow()}
          className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl"
        >
          ▶️ RUN ENTIRE FLOW
        </button>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="rounded-md border-2 border-slate-600 bg-slate-700 px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-slate-600 hover:text-white"
          >
            💾 Export
          </button>
          <button
            type="button"
            onClick={handleImport}
            className="rounded-md border-2 border-slate-600 bg-slate-700 px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-slate-600 hover:text-white"
          >
            📂 Import
          </button>
        </div>
      </div>

      {/* Add Nodes Section - Grouped by Category */}
      <section className="flex flex-col flex-1 overflow-hidden min-h-0">
        {/* Section Header */}
        <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-slate-700">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            ➕ Add Nodes
          </h2>
          
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search nodes..."
              className="w-full rounded-lg border-2 border-slate-600 bg-slate-800 px-3 py-2 pl-9 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              🔍
            </span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 hover:bg-slate-700 hover:text-white"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        {/* Scrollable Categories */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 pt-4">
            {/* Triggers */}
          {nodesByCategory.trigger.length > 0 && (
            <div className="mb-4">
              <button
                type="button"
                onClick={() => toggleCategory("trigger")}
                className="mb-2 flex w-full items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-800/50"
              >
                <h3 className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <span className="text-sm">{expandedCategories.trigger ? "▼" : "▶"}</span>
                  🔔 TRIGGERS
                  <span className="text-[9px] text-slate-500">({nodesByCategory.trigger.length})</span>
                </h3>
              </button>
              
              {expandedCategories.trigger && (
                <ul className="space-y-1.5">
                  {nodesByCategory.trigger.map((schema) => (
                    <li key={schema.key}>
                      <button
                        type="button"
                        onClick={() => handleAddNode(schema.key)}
                        className="group flex w-full items-center gap-2 rounded-lg border border-amber-600/30 bg-gradient-to-r from-amber-900/20 to-amber-800/20 px-3 py-2 text-left shadow-sm transition hover:border-amber-400 hover:from-amber-600 hover:to-amber-500 hover:shadow-md"
                      >
                        <span className="text-lg">{getNodeIcon(schema.key)}</span>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-white">{schema.name}</p>
                        </div>
                        <span className="text-sm text-slate-600 group-hover:text-white">+</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        
          {/* Actions/Apps */}
          {nodesByCategory.action.length > 0 && (
            <div className="mb-4">
              <button
                type="button"
                onClick={() => toggleCategory("action")}
                className="mb-2 flex w-full items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-800/50"
              >
                <h3 className="flex items-center gap-2 text-xs font-bold text-blue-400">
                  <span className="text-sm">{expandedCategories.action ? "▼" : "▶"}</span>
                  🔌 APPS
                  <span className="text-[9px] text-slate-500">({nodesByCategory.action.length})</span>
                </h3>
              </button>
              
              {expandedCategories.action && (
                <ul className="space-y-1.5">
                  {nodesByCategory.action.map((schema) => (
                    <li key={schema.key}>
                      <button
                        type="button"
                        onClick={() => handleAddNode(schema.key)}
                        className="group flex w-full items-center gap-2 rounded-lg border border-blue-600/30 bg-gradient-to-r from-blue-900/20 to-blue-800/20 px-3 py-2 text-left shadow-sm transition hover:border-blue-400 hover:from-blue-600 hover:to-blue-500 hover:shadow-md"
                      >
                        <span className="text-lg">{getNodeIcon(schema.key)}</span>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-white">{schema.name}</p>
                        </div>
                        <span className="text-sm text-slate-600 group-hover:text-white">+</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        
          {/* Transform/Utility */}
          {nodesByCategory.utility.length > 0 && (
            <div className="mb-4">
              <button
                type="button"
                onClick={() => toggleCategory("utility")}
                className="mb-2 flex w-full items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-800/50"
              >
                <h3 className="flex items-center gap-2 text-xs font-bold text-purple-400">
                  <span className="text-sm">{expandedCategories.utility ? "▼" : "▶"}</span>
                  ⚙️ TRANSFORM
                  <span className="text-[9px] text-slate-500">({nodesByCategory.utility.length})</span>
                </h3>
              </button>
              
              {expandedCategories.utility && (
                <ul className="space-y-1.5">
                  {nodesByCategory.utility.map((schema) => (
                    <li key={schema.key}>
                      <button
                        type="button"
                        onClick={() => handleAddNode(schema.key)}
                        className="group flex w-full items-center gap-2 rounded-lg border border-purple-600/30 bg-gradient-to-r from-purple-900/20 to-purple-800/20 px-3 py-2 text-left shadow-sm transition hover:border-purple-400 hover:from-purple-600 hover:to-purple-500 hover:shadow-md"
                      >
                        <span className="text-lg">{getNodeIcon(schema.key)}</span>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-white">{schema.name}</p>
                        </div>
                        <span className="text-sm text-slate-600 group-hover:text-white">+</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          
          {/* No Results */}
          {searchQuery && 
           nodesByCategory.trigger.length === 0 && 
           nodesByCategory.action.length === 0 && 
           nodesByCategory.utility.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-500">No nodes found for "{searchQuery}"</p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-2 text-xs text-indigo-400 hover:text-indigo-300"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer Tip - Always at bottom */}
      <div className="flex-shrink-0 border-t-2 border-slate-700 bg-slate-900 px-4 py-3">
        <p className="text-[10px] text-slate-400">
          💡 <strong>Tip:</strong> Click nodes on canvas to configure
        </p>
      </div>
    </aside>
  );
}

function getNodeIcon(key: string): string {
  switch (key) {
    case "manual":
      return "▶️";
    case "http":
      return "🌐";
    case "if":
      return "❓";
    case "switch":
      return "🔀";
    case "filter":
      return "🔍";
    case "set":
      return "📝";
    case "split":
      return "✂️";
    case "merge":
      return "🔀";
    case "loop":
      return "🔁";
    case "wait":
      return "⏱️";
    case "aggregate":
      return "📊";
    case "code":
      return "💻";
    case "sort":
      return "🔢";
    case "limit":
      return "✂️";
    default:
      return "⚙️";
  }
}

interface SectionTitleProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

function SectionTitle({ title, actionLabel, onAction, className }: SectionTitleProps): JSX.Element {
  return (
    <div className={`mb-2 flex items-center justify-between ${className ?? ""}`}>
      <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-500">{title}</h2>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="rounded-md border border-ink-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink-500 hover:bg-ink-100"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

