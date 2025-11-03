import { useMemo, useState, useEffect } from "react";
import { SchemaForm } from "./SchemaForm";
import { useFlowStore } from "../state/flow-store";
import { nodeDefinitions, type NodeDefinitionKey } from "../nodes";
import { generateFuzzValues } from "../utils/fuzz";
import type { FieldDef } from "@node-playground/types";

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
  const [viewMode, setViewMode] = useState<"schema" | "table">("schema");
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

  // Check if this node is connected from a specific branch
  const incomingEdge = stepKey ? customEdges.find(edge => edge.target === stepKey) : undefined;
  const isConnectedFromSpecificBranch = !!(incomingEdge?.sourceHandle);
  const connectedBranch = incomingEdge?.sourceHandle;
  
  // Detect if this is branching node output (IF/SWITCH)
  const isBranchingNode = isObject(data) && !Array.isArray(data);
  const branches: string[] = [];
  
  if (isBranchingNode && !isConnectedFromSpecificBranch) {
    // Only show branch selector if NOT connected from specific branch
    const keys = Object.keys(data);
    // IF node: TRUE/FALSE
    if (keys.includes('TRUE') || keys.includes('FALSE')) {
      branches.push(...keys.filter(k => k === 'TRUE' || k === 'FALSE').sort().reverse()); // TRUE first
    }
    // SWITCH node: case_0, case_1, default, etc
    else if (keys.some(k => k.startsWith('case_') || k === 'default')) {
      branches.push(...keys.sort());
    }
  }

  // Set default branch
  if (branches.length > 0 && !selectedBranch) {
    setSelectedBranch(branches[0]);
  }

  // Get data to display
  let displayData: unknown;
  if (isConnectedFromSpecificBranch && connectedBranch && isBranchingNode) {
    // Show only the connected branch data
    displayData = (data as Record<string, unknown>)[connectedBranch];
  } else if (branches.length > 0 && selectedBranch) {
    // Show selected branch data (with dropdown)
    displayData = (data as Record<string, unknown>)[selectedBranch];
  } else {
    // Show original data
    displayData = data;
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Branch Selector for IF/SWITCH nodes - only show if not connected from specific branch */}
      {isConnectedFromSpecificBranch && connectedBranch && (
        <div className="border-b-2 border-green-200 bg-green-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-green-900">
              🎯 Connected from branch:
            </span>
            <span className="rounded-lg bg-green-200 px-3 py-1 text-sm font-bold text-green-800">
              {connectedBranch === 'TRUE' && '✅ '}
              {connectedBranch === 'FALSE' && '❌ '}
              {connectedBranch}
            </span>
          </div>
        </div>
      )}
      
      {branches.length > 0 && !isConnectedFromSpecificBranch && (
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
  const itemsPerPage = 10;

  // Determine what to display as table rows
  // Branch selection is handled by parent, so data here is already the selected branch
  let arrayData: unknown[] = [];
  
  if (Array.isArray(data)) {
    arrayData = data;
  } else if (isObject(data)) {
    // Regular object → show as single row with top-level keys as columns
    arrayData = [data];
  } else if (data !== null && data !== undefined) {
    // Primitive value → wrap in object
    arrayData = [{ value: data }];
  } else {
    arrayData = [];
  }

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

  if (arrayData.length === 0) {
    return (
      <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 text-center">
        <div className="mb-2 text-2xl">📭</div>
        <strong>No data to display</strong>
        <p className="mt-1 text-xs">The output is empty.</p>
      </div>
    );
  }

  // Get columns from first item of arrayData (not paginatedData)
  const columns = useMemo(() => {
    if (arrayData.length === 0) return [];
    const firstItem = arrayData[0];
    if (isObject(firstItem)) {
      return Object.keys(firstItem);
    }
    return ['value'];
  }, [arrayData]);

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

  return (
    <div className="space-y-3">
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
      </div>

      {/* Info */}
      <div className="text-xs text-emerald-700">
        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} items
        {searchTerm && ` (filtered from ${arrayData.length} total)`}
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-lg border-2 border-emerald-200">
        <table className="w-full text-xs">
          <thead className="bg-emerald-100">
            <tr>
              <th className="border-b-2 border-emerald-300 px-3 py-2 text-left font-bold text-emerald-900">
                #
              </th>
              {columns.map(col => (
                <th key={col} className="border-b-2 border-emerald-300 px-3 py-2 text-left font-bold text-emerald-900">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {paginatedData.map((item, idx) => (
              <tr key={idx} className="hover:bg-emerald-50">
                <td className="border-b border-emerald-200 px-3 py-2 text-gray-600">
                  {startIndex + idx + 1}
                </td>
                {columns.map(col => {
                  const value = isObject(item) ? (item as Record<string, unknown>)[col] : item;
                  return (
                    <td key={col} className="border-b border-emerald-200 px-3 py-2">
                      {typeof value === 'object' ? (
                        <code className="rounded bg-gray-100 px-1 text-[10px]">
                          {JSON.stringify(value)}
                        </code>
                      ) : (
                        String(value ?? '')
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
    </div>
  );
}

export function ConfigPanel(): JSX.Element {
  const [activeTab, setActiveTab] = useState<"config" | "result">("config");
  const selectedStepKey = useFlowStore((state) => state.selectedStepKey);
  const steps = useFlowStore((state) => state.steps);
  const updateConfig = useFlowStore((state) => state.updateConfig);
  const runStep = useFlowStore((state) => state.runStep);
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

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white">
      {/* Node Info Header */}
      <div className="border-b-2 border-indigo-100 bg-gradient-to-r from-white to-indigo-50 px-4 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-indigo-900">{step.name}</h3>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-500">
              {definition.schema.type}
            </p>
          </div>
          <span className="rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-bold text-white">
            {step.key}
          </span>
        </div>
      </div>

      {/* Tabs - Only show if has result */}
      {hasResult && (
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
        </nav>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "config" ? (
          <SchemaForm
            schema={definition.schema}
            initialValues={step.config}
            onChange={(values) => updateConfig(step.key, values)}
            onRun={() => handleRun()}
            isRunning={runState?.status === "running"}
            onFuzz={fuzzHandler}
            stepOutputs={filteredStepOutputs}
          />
        ) : (
          <ResultView data={stepOutputs[step.key]} stepKey={step.key} />
        )}
      </div>
    </div>
  );
}
