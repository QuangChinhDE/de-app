import { useMemo, useState, useEffect } from "react";
import { useFlowStore } from "../state/flow-store";
import { nodeDefinitions, type NodeDefinitionKey } from "../nodes";
import { generateFuzzValues } from "../utils/fuzz";
import type { FieldDef, AdvancedOptions } from "@node-playground/types";
import { AdvancedOptionsTab } from "./AdvancedOptionsTab";

// Helper to check if value is object
function isObject(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === "object" && !Array.isArray(val);
}

// Helper to extract schema (first item from arrays) and flatten unnecessary wrappers
function extractSchema(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data.length > 0 ? extractSchema(data[0]) : null;
  }
  if (isObject(data)) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      // If value is object with single "value" key containing array, flatten it
      if (isObject(value)) {
        const valueObj = value as Record<string, unknown>;
        const keys = Object.keys(valueObj);
        
        // Pattern: { value: [...] } -> just use [...]
        if (keys.length === 1 && keys[0] === 'value' && Array.isArray(valueObj.value)) {
          result[key] = extractSchema(valueObj.value);
          continue;
        }
      }
      
      result[key] = extractSchema(value);
    }
    return result;
  }
  return data;
}

// Component to display result data with SCHEMA/TABLE modes
interface ResultViewProps {
  data: unknown;
  stepKey?: string;
}

function ResultView({ data, stepKey }: ResultViewProps): JSX.Element {
  const [viewMode, setViewMode] = useState<"schema" | "table">("table"); // Default to table view
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const customEdges = useFlowStore((state) => state.customEdges);

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center text-sm text-gray-500">
          <div className="mb-2 text-3xl">📊</div>
          <p>No result data available</p>
        </div>
      </div>
    );
  }

  // Detect if this is branching node output (IF/SWITCH)
  // Only consider it branching if output has TRUE/FALSE or case_* keys
  const branches: string[] = [];
  
  if (isObject(data) && !Array.isArray(data)) {
    const keys = Object.keys(data);
    // IF node: Must have BOTH TRUE and FALSE keys
    if (keys.includes('TRUE') && keys.includes('FALSE')) {
      branches.push('TRUE', 'FALSE');
    }
    // SWITCH node: case_* or default
    else if (keys.some(k => k.startsWith('case_') || k === 'default')) {
      branches.push(...keys.sort());
    }
  }
  
  const isBranchingNode = branches.length > 0;

  // Set default branch
  if (branches.length > 0 && !selectedBranch) {
    setSelectedBranch(branches[0]);
  }

  // Get data to display - for non-branching nodes, always show original data
  let displayData: unknown;
  if (branches.length > 0 && selectedBranch) {
    // Show selected branch data (with dropdown)
    displayData = (data as Record<string, unknown>)[selectedBranch];
  } else {
    // Show original data
    displayData = data;
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Branch Selector - only show for actual branching nodes (IF/SWITCH with TRUE/FALSE or case_* keys) */}
      {branches.length > 0 && (
        <div className="border-b-2 border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-amber-900">
              🔀 Branch:
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="rounded-lg border-2 border-amber-400 bg-white px-3 py-1 text-sm font-semibold text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              aria-label="Select branch"
            >
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch === 'TRUE' && '✅ '}
                  {branch === 'FALSE' && '❌ '}
                  {branch}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* View Mode Tabs */}
      <div className="flex gap-2 border-b-2 border-emerald-200 bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => setViewMode("schema")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
            viewMode === "schema"
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          ⚡ SCHEMA
        </button>
        <button
          type="button"
          onClick={() => setViewMode("table")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
            viewMode === "table"
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          📊 TABLE
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {viewMode === "schema" ? (
          <SchemaResultView data={displayData} />
        ) : (
          <TableResultView data={displayData} searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        )}
      </div>
    </div>
  );
}

// Schema view component
interface SchemaResultViewProps {
  data: unknown;
}

function SchemaResultView({ data }: SchemaResultViewProps): JSX.Element {
  const schemaData = useMemo(() => extractSchema(data), [data]);
  
  // Show info about what we're displaying
  const dataInfo = useMemo(() => {
    if (Array.isArray(data)) {
      return `Array with ${data.length} items (showing structure of first item)`;
    }
    if (isObject(data)) {
      return 'Object structure';
    }
    return 'Single value';
  }, [data]);

  // Render data in a friendly format
  const renderValue = (value: unknown, depth: number = 0): JSX.Element => {
    const indent = depth * 20;

    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">null</span>;
    }

    if (typeof value === 'boolean') {
      return <span className="font-semibold text-purple-600">{String(value)}</span>;
    }

    if (typeof value === 'number') {
      return <span className="font-semibold text-blue-600">{value}</span>;
    }

    if (typeof value === 'string') {
      return <span className="text-green-700">"{value}"</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-400 italic">[ empty array ]</span>;
      }
      return (
        <div className="space-y-1">
          <span className="text-gray-500 text-xs">[ Array with {value.length} items ]</span>
          <div className="border-l-2 border-emerald-200 pl-3 ml-5">
            {renderValue(value[0], depth + 1)}
          </div>
        </div>
      );
    }

    if (typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      const entries = Object.entries(obj);
      
      if (entries.length === 0) {
        return <span className="text-gray-400 italic">{'{ empty }'}</span>;
      }

      return (
        <div className="space-y-2">
          {entries.map(([key, val]) => (
            <div key={key} className="flex items-start gap-2">
              <span className="font-bold text-emerald-800 min-w-fit">{key}:</span>
              <div className="flex-1">{renderValue(val, depth + 1)}</div>
            </div>
          ))}
        </div>
      );
    }

    return <span className="text-gray-600">{String(value)}</span>;
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 p-3">
        <div className="flex items-start gap-2">
          <span className="text-2xl">📋</span>
          <div className="flex-1">
            <strong className="text-sm text-emerald-900">Data Structure</strong>
            <p className="mt-1 text-xs text-emerald-700">
              {dataInfo}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border-2 border-gray-200 bg-white p-4">
        {renderValue(schemaData)}
      </div>
    </div>
  );
}

// Table view component
interface TableResultViewProps {
  data: unknown;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

function TableResultView({ data, searchTerm, onSearchChange }: TableResultViewProps): JSX.Element {
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const itemsPerPage = 10;

  // Determine what to display as table rows
  // Branch selection is handled by parent, so data here is already the selected branch
  const arrayData: unknown[] = useMemo(() => {
    if (Array.isArray(data)) {
      return data;
    } else if (isObject(data)) {
      return [data];
    } else if (data !== null && data !== undefined) {
      return [{ value: data }];
    }
    return [];
  }, [data]);

  // Get columns from first item - MUST be before any early returns
  const columns = useMemo(() => {
    if (arrayData.length === 0) return [];
    const firstItem = arrayData[0];
    if (isObject(firstItem)) {
      return Object.keys(firstItem);
    }
    return ['value'];
  }, [arrayData]);

  // Filter by search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return arrayData;
    const term = searchTerm.toLowerCase();
    return arrayData.filter(item => 
      JSON.stringify(item).toLowerCase().includes(term)
    );
  }, [arrayData, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // NOW safe to have early returns after all hooks
  if (arrayData.length === 0) {
    return (
      <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 text-center">
        <div className="mb-2 text-2xl">📭</div>
        <strong>No data to display</strong>
        <p className="mt-1 text-xs">The output is empty.</p>
      </div>
    );
  }

  // Show message if no results after filter
  if (filteredData.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="🔍 Search in results..."
            className="flex-1 rounded-lg border-2 border-emerald-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="rounded-lg bg-gray-200 px-3 py-2 text-xs font-bold hover:bg-gray-300"
          >
            Clear
          </button>
        </div>
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4 text-center text-sm text-amber-900">
          <div className="mb-2 text-2xl">🔍</div>
          <strong>No results found</strong>
          <p className="mt-1 text-xs">
            Try adjusting your search term. Total items: {arrayData.length}
          </p>
        </div>
      </div>
    );
  }

  // Render table content (reusable for both normal and fullscreen)
  const renderTableContent = () => (
    <>
      {/* Info */}
      <div className="text-xs text-emerald-700 flex items-center justify-between">
        <span>
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} items
          {searchTerm && ` (filtered from ${arrayData.length} total)`}
        </span>
      </div>

      {/* Table - with fixed header and better formatting */}
      <div className={`overflow-auto rounded-lg border-2 border-emerald-200 ${isFullscreen ? 'max-h-[calc(100vh-200px)]' : 'max-h-[600px]'}`}>
        <table className="w-full text-xs border-collapse">
          <thead className="bg-gradient-to-r from-emerald-100 to-teal-100 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="border-b-2 border-emerald-400 px-4 py-3 text-left font-bold text-emerald-900 bg-emerald-100 whitespace-nowrap">
                #
              </th>
              {columns.map(col => (
                <th 
                  key={col} 
                  className="border-b-2 border-emerald-400 px-4 py-3 text-left font-bold text-emerald-900 bg-emerald-100 whitespace-nowrap"
                  title={col}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {paginatedData.map((item, idx) => (
              <tr 
                key={idx} 
                className={`
                  transition-colors hover:bg-emerald-50 
                  ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                `}
              >
                <td className="border-b border-emerald-200 px-4 py-3 text-gray-600 font-medium whitespace-nowrap">
                  {startIndex + idx + 1}
                </td>
                {columns.map(col => {
                  const value = isObject(item) ? (item as Record<string, unknown>)[col] : item;
                  const isComplexType = typeof value === 'object' && value !== null;
                  const stringValue = isComplexType ? JSON.stringify(value, null, 2) : String(value ?? '');
                  const isTruncated = stringValue.length > 100;
                  
                  return (
                    <td 
                      key={col} 
                      className="border-b border-emerald-200 px-4 py-3 max-w-xs"
                      title={isTruncated ? stringValue : undefined}
                    >
                      {isComplexType ? (
                        <details className="cursor-pointer group">
                          <summary className="inline-flex items-center gap-1 text-indigo-600 font-medium hover:text-indigo-800 select-none">
                            <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
                            <span className="text-[10px] font-mono">
                              {Array.isArray(value) ? `Array[${value.length}]` : 'Object'}
                            </span>
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-[10px] overflow-auto max-h-40 border border-gray-300">
                            {stringValue}
                          </pre>
                        </details>
                      ) : (
                        <span 
                          className={`
                            ${isTruncated ? 'line-clamp-2' : ''} 
                            ${typeof value === 'number' ? 'font-mono text-blue-600' : ''}
                            ${typeof value === 'boolean' ? 'font-mono text-purple-600' : ''}
                          `}
                        >
                          {stringValue}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-bold text-white disabled:bg-gray-300"
          >
            ← Prev
          </button>
          <span className="text-xs text-emerald-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-bold text-white disabled:bg-gray-300"
          >
            Next →
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      <div className="space-y-3">
        {/* Search bar with fullscreen button */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="🔍 Search in results..."
            className="flex-1 rounded-lg border-2 border-emerald-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="rounded-lg bg-gray-200 px-3 py-2 text-xs font-bold hover:bg-gray-300"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-600 transition-colors shadow-sm whitespace-nowrap"
            title="Open in fullscreen"
          >
            🔍 Fullscreen
          </button>
        </div>

        {renderTableContent()}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full h-full max-w-7xl bg-white rounded-lg shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50">
              <h2 className="text-lg font-bold text-emerald-900">📊 Table View - Fullscreen</h2>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600 transition-colors"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Body - with search */}
            <div className="flex-1 overflow-hidden p-6 space-y-3">
              {/* Search bar */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    onSearchChange(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="🔍 Search in results..."
                  className="flex-1 rounded-lg border-2 border-emerald-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => onSearchChange("")}
                    className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-bold hover:bg-gray-300"
                  >
                    Clear
                  </button>
                )}
              </div>

              {renderTableContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function ConfigPanel(): JSX.Element {
  const [activeTab, setActiveTab] = useState<"config" | "result" | "advanced">("config");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  
  const selectedStepKey = useFlowStore((state) => state.selectedStepKey);
  const steps = useFlowStore((state) => state.steps);
  const updateConfig = useFlowStore((state) => state.updateConfig);
  const runStep = useFlowStore((state) => state.runStep);
  const renameStep = useFlowStore((state) => state.renameStep);
  const runStates = useFlowStore((state) => state.stepRunStates);
  const stepOutputs = useFlowStore((state) => state.stepOutputs);

  // Reset to config tab when selected node changes
  useEffect(() => {
    setActiveTab("config");
  }, [selectedStepKey]);

  const step = steps.find((item) => item.key === selectedStepKey);
  const definition = step ? nodeDefinitions[step.schemaKey] : undefined;
  const runState = step ? runStates[step.key] : undefined;
  const hasResult = step && stepOutputs[step.key] !== undefined;

  // Auto-switch to Result tab (Table view) when run completes successfully
  useEffect(() => {
    if (runState?.status === "success" && hasResult) {
      setActiveTab("result");
    }
  }, [runState?.status, hasResult]);

  // Filter stepOutputs to include nodes BEFORE and INCLUDING current node
  const filteredStepOutputs = useMemo(() => {
    if (!selectedStepKey) return {};
    
    const selectedIndex = steps.findIndex((s) => s.key === selectedStepKey);
    if (selectedIndex < 0) return {};
    
    const filtered: Record<string, unknown> = {};
    // Include all nodes from 0 to selectedIndex (inclusive)
    for (let i = 0; i <= selectedIndex; i++) {
      const stepKey = steps[i].key;
      if (stepOutputs[stepKey] !== undefined) {
        filtered[stepKey] = stepOutputs[stepKey];
      }
    }
    return filtered;
  }, [selectedStepKey, steps, stepOutputs]);

  const fuzzHandler = useMemo(
    () =>
      step && definition
        ? (values: Record<string, unknown>) =>
            generateFuzzValues(definition.schema.inputs as FieldDef[], values)
        : undefined,
    [step, definition]
  );

  if (!step || !definition) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white p-10 text-sm text-ink-400">
        👈 Double click a node from the canvas to configure it
      </div>
    );
  }

  const handleRun = async () => {
    await runStep(step.key);
    // Auto switch to result tab after run
    setActiveTab("result");
  };
  
  const handleNameEdit = () => {
    setIsEditingName(true);
    setEditNameValue(step.name);
    setNameError(null);
  };
  
  const handleNameSave = () => {
    if (!selectedStepKey) return;
    
    const result = renameStep(selectedStepKey, editNameValue);
    
    if (result.success) {
      setIsEditingName(false);
      setNameError(null);
    } else {
      setNameError(result.error || "Invalid name");
    }
  };
  
  const handleNameCancel = () => {
    setIsEditingName(false);
    setEditNameValue(step.name);
    setNameError(null);
  };
  
  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleNameSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleNameCancel();
    }
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white">
      {/* Node Info Header */}
      <div className="border-b-2 border-indigo-100 bg-gradient-to-r from-white to-indigo-50 px-4 py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Editable node name */}
            {isEditingName ? (
              <div className="space-y-1">
                <input
                  type="text"
                  value={editNameValue}
                  onChange={(e) => setEditNameValue(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyDown={handleNameKeyDown}
                  placeholder="Enter node name"
                  autoFocus
                  className="w-full text-base font-bold text-indigo-900 border-2 border-indigo-400 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {nameError && (
                  <p className="text-[10px] text-red-600 font-semibold">{nameError}</p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h3 className="text-base font-bold text-indigo-900 truncate">{step.name}</h3>
                <button
                  type="button"
                  onClick={handleNameEdit}
                  className="opacity-0 group-hover:opacity-100 text-indigo-500 hover:text-indigo-700 transition-all"
                  title="Rename node"
                >
                  ✏️
                </button>
              </div>
            )}
            <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-500">
              {definition.schema.type}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRun}
              disabled={runState?.status === "running"}
              className={`rounded-lg px-4 py-2 text-sm font-bold uppercase tracking-wide shadow-md transition-all ${
                runState?.status === "running"
                  ? "cursor-not-allowed bg-gray-300 text-gray-500"
                  : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
              }`}
            >
              {runState?.status === "running" ? "⏳ Running..." : "▶️ Run Test"}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <nav className="flex items-center gap-2 border-b-2 border-gray-200 bg-white px-4 py-2 text-sm shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab("config")}
          className={`rounded-lg px-4 py-2 font-bold transition-all ${
            activeTab === "config"
              ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
          }`}
        >
          ⚙️ Config
        </button>
        {hasResult && (
          <button
            type="button"
            onClick={() => setActiveTab("result")}
            className={`rounded-lg px-4 py-2 font-bold transition-all ${
              activeTab === "result"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
            }`}
          >
            📊 Result
          </button>
        )}
        <button
          type="button"
          onClick={() => setActiveTab("advanced")}
          className={`rounded-lg px-4 py-2 font-bold transition-all ${
            activeTab === "advanced"
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
          }`}
        >
          🔧 Advanced
        </button>
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "config" ? (
          // All nodes must have custom formComponent
          definition.schema.formComponent ? (
            <definition.schema.formComponent
              key={step.key}
              schema={definition.schema}
              value={step.config}
              onChange={(values) => updateConfig(step.key, values)}
              onRun={() => handleRun()}
              isRunning={runState?.status === "running"}
              onFuzz={fuzzHandler}
              stepOutputs={filteredStepOutputs}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-4">
              <div className="max-w-md rounded-lg border-2 border-rose-300 bg-rose-50 p-6 text-center">
                <p className="mb-2 text-lg font-bold text-rose-700">⚠️ Missing Form Component</p>
                <p className="text-sm text-rose-600">
                  Node <code className="rounded bg-rose-100 px-2 py-1">{definition.key}</code> does not have a custom form component.
                  <br />
                  All nodes must define a <code className="rounded bg-rose-100 px-2 py-1">formComponent</code> property.
                </p>
              </div>
            </div>
          )
        ) : activeTab === "result" ? (
          <ResultView data={stepOutputs[step.key]} stepKey={step.key} />
        ) : (
          <AdvancedOptionsTab
            value={step.config.advanced as AdvancedOptions}
            onChange={(advanced) => updateConfig(step.key, { ...step.config, advanced })}
          />
        )}
      </div>
    </div>
  );
}
