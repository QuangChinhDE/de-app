import { useState, useMemo, useEffect } from "react";
import { useDrag, type DragSourceMonitor } from "react-dnd";

const ITEM_TYPE = "DATA_FIELD";

interface DataFieldsPanelProps {
  outputs: Record<string, unknown>;
  selectedStepKey?: string;
  connectedBranches?: Record<string, string>; // stepKey -> branchName mapping
}

type ViewMode = "schema" | "table";

export function DataFieldsPanel({ outputs, selectedStepKey, connectedBranches }: DataFieldsPanelProps): JSX.Element {
  const nodeKeys = Object.keys(outputs);
  const [selectedNode, setSelectedNode] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("schema");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastRunStepKey, setLastRunStepKey] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const itemsPerPage = 10;

  // Auto-select node when user runs a node (selectedStepKey changes)
  useEffect(() => {
    if (selectedStepKey && nodeKeys.includes(selectedStepKey) && selectedStepKey !== lastRunStepKey) {
      setSelectedNode(selectedStepKey);
      setLastRunStepKey(selectedStepKey); // Track this run
    }
  }, [selectedStepKey, nodeKeys, lastRunStepKey]);

  // Auto-select first node when outputs change or selectedNode becomes invalid
  useEffect(() => {
    if (nodeKeys.length > 0 && (!selectedNode || !nodeKeys.includes(selectedNode))) {
      setSelectedNode(nodeKeys[0]);
    }
  }, [nodeKeys, selectedNode]);

  const rawData = selectedNode ? outputs[selectedNode] : undefined;
  
  // Check if this node has connected branch restriction
  const connectedBranch = connectedBranches?.[selectedNode];
  console.log(`[DATAFIELDSPANEL] 🔍 Branch detection:`, { 
    selectedNode, 
    connectedBranches, 
    connectedBranch,
    hasRawData: !!rawData
  });
  
  // Detect if this is branching node output (IF/SWITCH)
  const branches: string[] = [];
  if (rawData && isObject(rawData) && !Array.isArray(rawData) && !connectedBranch) {
    // Only show branch selector if NOT restricted to specific branch
    const keys = Object.keys(rawData);
    // IF node: TRUE/FALSE
    if (keys.includes('TRUE') || keys.includes('FALSE')) {
      branches.push(...keys.filter(k => k === 'TRUE' || k === 'FALSE').sort().reverse()); // TRUE first
    }
    // SWITCH node: case_0, case_1, default, etc
    else if (keys.some(k => k.startsWith('case_') || k === 'default')) {
      branches.push(...keys.sort());
    }
  }

  // Auto-select first branch or connected branch
  useEffect(() => {
    if (connectedBranch) {
      setSelectedBranch(connectedBranch);
    } else if (branches.length > 0 && !selectedBranch) {
      setSelectedBranch(branches[0]);
    }
  }, [branches.length, selectedBranch, connectedBranch]);

  // Get data to display (branch data or original data)
  let selectedData: unknown;
  if (connectedBranch && rawData && isObject(rawData) && !Array.isArray(rawData)) {
    // Show only connected branch data
    selectedData = (rawData as Record<string, unknown>)[connectedBranch];
  } else if (branches.length > 0 && selectedBranch) {
    // Show selected branch data (with dropdown)
    selectedData = (rawData as Record<string, unknown>)[selectedBranch];
  } else {
    // Show original data
    selectedData = rawData;
  }

  return (
    <div className="relative h-full flex flex-col overflow-hidden bg-gradient-to-br from-white to-blue-50">
      {Object.entries(outputs).length === 0 && (
        <div className="flex h-full items-center justify-center px-4 py-4">
          <div className="rounded-lg border-2 border-dashed border-blue-300 bg-white p-8 text-center shadow-sm">
            <div className="mb-3 text-4xl">🗂️</div>
            <p className="mb-2 text-sm font-semibold text-blue-800">
              No Data Available
            </p>
            <p className="text-xs text-blue-600">
              Run a node to capture outputs.<br />
              Then <strong>drag fields</strong> into config forms. 👈
            </p>
          </div>
        </div>
      )}
      {Object.entries(outputs).length > 0 && (
        <>
          {/* Branch Status/Selector for IF/SWITCH nodes */}
          {connectedBranch && (
            <div className="border-b-2 border-green-200 bg-green-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-green-900">
                  🎯 Connected branch:
                </span>
                <span className="rounded-lg bg-green-200 px-3 py-1 text-sm font-bold text-green-800">
                  {connectedBranch === 'TRUE' && '✅ '}
                  {connectedBranch === 'FALSE' && '❌ '}
                  {connectedBranch}
                </span>
              </div>
            </div>
          )}
          
          {branches.length > 0 && !connectedBranch && (
            <div className="border-b-2 border-amber-200 bg-amber-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-amber-900">
                  🔀 Branch:
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => {
                    setSelectedBranch(e.target.value);
                    setCurrentPage(1); // Reset pagination
                  }}
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
          <div className="flex gap-2 px-4 py-3 border-b border-blue-200 bg-white">
            <button
              type="button"
              onClick={() => setViewMode("schema")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                viewMode === "schema"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
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
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              📊 TABLE
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {viewMode === "schema" && (
              <SchemaView data={selectedData} stepKey={selectedNode} />
            )}
            {viewMode === "table" && (
              <TableView
                data={selectedData}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Schema View - shows structure with only first item from arrays (flattened)
interface SchemaViewProps {
  data: unknown;
  stepKey: string;
}

function SchemaView({ data, stepKey }: SchemaViewProps): JSX.Element {
  const schemaData = useMemo(() => {
    if (!data) return null;
    return extractSchema(data);
  }, [data]);

  if (!schemaData) {
    return (
      <div className="text-center text-sm text-gray-500 py-8">
        No data structure available
      </div>
    );
  }

  // If schema is an object, show its fields directly (not wrapped in another level)
  const isRootObject = isObject(schemaData);

  return (
    <div>
      <div className="mb-3 rounded-lg border-2 border-indigo-300 bg-gradient-to-r from-indigo-50 to-purple-50 p-3 text-xs text-indigo-900">
        <strong className="text-sm">⚡ SCHEMA Mode</strong>
        <p className="mt-1">
          Shows <strong>one representative object</strong> from arrays. 
          Drag fields to reference <strong>all items</strong> in logic nodes (IF/Switch).
        </p>
      </div>
      
      {isRootObject ? (
        <ul className="space-y-2">
          {Object.entries(schemaData as Record<string, unknown>).map(([key, value]) => (
            <li key={key}>
              <DataFieldBranch 
                label={key} 
                value={value} 
                stepKey={stepKey} 
                path={[key]} 
                depth={0}
                autoExpandAll={true}
              />
            </li>
          ))}
        </ul>
      ) : (
        <DataFieldBranch label={stepKey} value={schemaData} stepKey={stepKey} path={[]} depth={0} autoExpandAll={true} />
      )}
    </div>
  );
}

// Table View - shows data in table format with pagination
interface TableViewProps {
  data: unknown;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

function TableView({ data, currentPage, itemsPerPage, onPageChange }: TableViewProps): JSX.Element {
  // Branch selection is now handled by parent component
  // Data here is already the selected branch data
  
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

  if (arrayData.length === 0) {
    return (
      <div className="text-center text-sm text-gray-500 py-8">
        Empty array - no rows to display
      </div>
    );
  }

  // Extract columns from first item
  const firstItem = arrayData[0];
  const columns = isObject(firstItem) ? Object.keys(firstItem) : [];

  if (columns.length === 0) {
    return (
      <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>⚠️ Cannot display table</strong>
        <p className="mt-2 text-xs">
          Array items are not objects. Use SCHEMA mode instead.
        </p>
      </div>
    );
  }

  // Pagination
  const totalPages = Math.ceil(arrayData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, arrayData.length);
  const pageData = arrayData.slice(startIndex, endIndex);

  return (
    <div>
      <div className="mb-3 rounded-lg border-2 border-indigo-300 bg-gradient-to-r from-indigo-50 to-purple-50 p-3 text-xs text-indigo-900">
        <strong className="text-sm">📊 TABLE Mode</strong>
        <p className="mt-1">
          Showing {startIndex + 1}-{endIndex} of {arrayData.length} rows
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border-2 border-blue-200 bg-white shadow-md">
        <table className="w-full text-xs">
          <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <tr>
              <th className="px-3 py-2 text-left font-bold border-r border-blue-400">#</th>
              {columns.map((col) => (
                <th key={col} className="px-3 py-2 text-left font-bold border-r border-blue-400 last:border-r-0">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((item, idx) => {
              const globalIdx = startIndex + idx;
              return (
                <tr key={globalIdx} className="border-b border-blue-100 hover:bg-blue-50 transition-colors">
                  <td className="px-3 py-2 font-mono text-gray-500 border-r border-blue-100">
                    {globalIdx}
                  </td>
                  {columns.map((col) => {
                    const value = isObject(item) ? (item as Record<string, unknown>)[col] : undefined;
                    return (
                      <td key={col} className="px-3 py-2 border-r border-blue-100 last:border-r-0">
                        {formatTableValue(value)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between rounded-lg border-2 border-blue-200 bg-white px-4 py-3 shadow-sm">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="rounded-lg bg-blue-500 px-4 py-2 text-xs font-bold text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            ← Prev
          </button>
          <span className="text-sm font-semibold text-blue-900">
            Page {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg bg-blue-500 px-4 py-2 text-xs font-bold text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

// Helper: Extract schema from data (flatten arrays to show first item structure directly)
function extractSchema(data: unknown): unknown {
  if (Array.isArray(data)) {
    if (data.length === 0) return {};
    // If array of objects, return the first object's structure directly (flattened)
    const firstItem = data[0];
    if (isObject(firstItem)) {
      return extractSchema(firstItem);
    }
    // If array of primitives, return the first value
    return firstItem;
  }
  if (isObject(data)) {
    const schema: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      schema[key] = extractSchema(value);
    }
    return schema;
  }
  return data;
}

// Helper: Format value for table display
function formatTableValue(value: unknown): JSX.Element | string {
  if (value === null || value === undefined) {
    return <span className="text-gray-400 italic">null</span>;
  }
  if (typeof value === "string") {
    return value.length > 50 ? `${value.slice(0, 50)}...` : value;
  }
  if (typeof value === "number") {
    return <span className="font-semibold text-blue-600">{value}</span>;
  }
  if (typeof value === "boolean") {
    return <span className="font-semibold text-purple-600">{String(value)}</span>;
  }
  if (Array.isArray(value)) {
    return (
      <code className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] text-indigo-800">
        [{value.length} items]
      </code>
    );
  }
  if (isObject(value)) {
    const keys = Object.keys(value);
    return (
      <code className="rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700">
        {'{'}{keys.length} fields{'}'}
      </code>
    );
  }
  return String(value);
}

interface DataFieldBranchProps {
  label: string;
  value: unknown;
  stepKey: string;
  path: string[];
  depth: number;
  autoExpandAll?: boolean; // For SCHEMA mode: expand all nested objects
}

function DataFieldBranch({ label, value, stepKey, path, depth, autoExpandAll = false }: DataFieldBranchProps): JSX.Element {
  // In SCHEMA mode (autoExpandAll=true), expand all levels up to depth 3
  // In TABLE mode, only expand depth < 1
  const [open, setOpen] = useState(autoExpandAll ? depth < 3 : depth < 1);
  // Path is already built by parent, don't add label again
  const currentPath = path;
  const isLeaf = !isObject(value) && !Array.isArray(value);
  const tokenPath = currentPath.length ? `${currentPath.join(".")}` : "";
  const token = tokenPath ? `{{steps.${stepKey}.${tokenPath}}}` : `{{steps.${stepKey}}}`;

  const [{ isDragging }, dragRef] = useDrag<DataFieldDragItem, void, { isDragging: boolean }>(
    () => ({
      type: ITEM_TYPE,
      item: { token, stepKey, path: currentPath, value },
      canDrag: isLeaf,
      collect: (monitor: DragSourceMonitor<DataFieldDragItem>) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [token, stepKey, currentPath, value, isLeaf]
  );

  if (isLeaf) {
    return (
      <div
        ref={dragRef}
        className={`group relative flex cursor-grab items-center justify-between rounded-lg border-2 border-dashed bg-gradient-to-r px-4 py-3 text-xs shadow-md transition-all active:cursor-grabbing ${
          isDragging 
            ? "dragging-field scale-110 border-indigo-500 from-indigo-200 to-indigo-100 opacity-70 shadow-2xl" 
            : "z-50 border-blue-300 from-white to-blue-50 hover:border-indigo-400 hover:from-indigo-50 hover:to-blue-100 hover:shadow-xl"
        }`}
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">🏷️</span>
          <span className="font-bold text-blue-900 group-hover:text-indigo-700">{label}</span>
        </span>
        <span className="ml-3 truncate rounded bg-white px-2 py-1 text-xs font-mono text-blue-600 shadow-sm">
          {previewValue(value)}
        </span>
        {!isDragging && (
          <div className="absolute -right-1 -top-1 z-10 rounded-full bg-indigo-500 px-2 py-0.5 text-[9px] font-bold text-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity animate-pulse">
            � KÉO SANG
          </div>
        )}
      </div>
    );
  }

  // Create drag ref for object/array - make entire header draggable like leaf fields
  const [{ isDraggingHeader }, dragHeaderRef] = useDrag<DataFieldDragItem, void, { isDraggingHeader: boolean }>(
    () => ({
      type: ITEM_TYPE,
      item: { token, stepKey, path: currentPath, value },
      canDrag: true, // Objects/arrays can be dragged
      collect: (monitor: DragSourceMonitor<DataFieldDragItem>) => ({
        isDraggingHeader: monitor.isDragging(),
      }),
    }),
    [token, stepKey, currentPath, value]
  );

  return (
    <div className="rounded-lg border-2 border-blue-200 bg-white shadow-md">
      <div
        ref={dragHeaderRef}
        className={`group relative cursor-grab transition-all active:cursor-grabbing ${
          isDraggingHeader 
            ? "scale-110 bg-indigo-100 opacity-70" 
            : "hover:bg-blue-50"
        }`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation(); // Prevent drag when clicking expand button
            setOpen((prev: boolean) => !prev);
          }}
          className="flex w-full items-center justify-between px-4 py-3 text-left text-xs font-bold text-blue-800 transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white shadow-sm">
              {open ? "−" : "+"}
            </span>
            <span className="text-lg">📦</span>
            {label}
          </span>
          <span className="text-[10px] uppercase text-ink-400">{Array.isArray(value) ? "array" : "object"}</span>
        </button>
        {!isDraggingHeader && (
          <div className="absolute -right-1 -top-1 z-10 rounded-full bg-indigo-500 px-2 py-0.5 text-[9px] font-bold text-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity animate-pulse">
            🎯 KÉO SANG
          </div>
        )}
      </div>
      {open && (
        <div className="border-t border-ink-100 bg-ink-50 px-3 py-2 text-xs text-ink-600">
          {Array.isArray(value) ? (
            <ul className="space-y-1 pl-2">
              {value.map((item, index) => (
                <li key={index}>
                  <DataFieldBranch
                    label={`${index}`}
                    value={item}
                    stepKey={stepKey}
                    path={[...currentPath, `${index}`]}
                    depth={depth + 1}
                    autoExpandAll={autoExpandAll}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-1 pl-2">
              {Object.entries(value as Record<string, unknown>).map(([key, nested]) => (
                <li key={key}>
                  <DataFieldBranch
                    label={key}
                    value={nested}
                    stepKey={stepKey}
                    path={[...currentPath, key]}
                    depth={depth + 1}
                    autoExpandAll={autoExpandAll}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function previewValue(value: unknown): string {
  if (typeof value === "string") {
    return value.length > 32 ? `${value.slice(0, 32)}…` : value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value === null || typeof value === "undefined") {
    return "null";
  }
  return "value";
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function createTokenForPath(stepKey: string, path: string[]): string {
  return `{{steps.${stepKey}.${path.join(".")}}}`;
}

export type DataFieldDragItem = {
  token: string;
  stepKey: string;
  path: string[];
  value: unknown;
};

export const DATA_FIELD_ITEM_TYPE = ITEM_TYPE;
