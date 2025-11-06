export type FieldPrimitiveType =
  | "string"
  | "number"
  | "boolean"
  | "datetime"
  | "enum"
  | "object"
  | "array"
  | "file"
  | "url"
  | "email";

export type FieldDef = {
  key: string;
  label?: string;
  type: FieldPrimitiveType;
  required?: boolean;
  enum?: string[];
  min?: number;
  max?: number;
  pattern?: string;
  help?: string;
  placeholder?: string;
  default?: unknown;
  widget?:
    | "text"
    | "textarea"
    | "keyValue"
    | "keyValueWithType"
    | "json-editor"
    | "toggle"
    | "code"
    | "chips";
  children?: FieldDef[];
  group?: "inputs" | "auth" | "advanced" | "validation";
};

/**
 * Node Categories (used for color coding and organization):
 * - "trigger": Workflow starters (Manual, Webhook, Schedule, etc.) - AMBER colors
 * - "action": External app integrations (HTTP, Database, APIs, etc.) - BLUE colors  
 * - "utility": Data transformation/logic (IF, SWITCH, FILTER, SET, SPLIT, etc.) - PURPLE colors
 */
/**
 * NodeFormProps - Interface for custom node form components
 * Used by node-specific forms to ensure consistent API
 */
export interface NodeFormProps<TConfig = Record<string, unknown>> {
  schema: NodeSchema;
  value: TConfig;
  onChange: (value: TConfig) => void;
  onRun: (value: TConfig) => void;
  isRunning?: boolean;
  onFuzz?: (current: TConfig) => TConfig;
  stepOutputs?: Record<string, unknown>;
}

export type NodeSchema = {
  key: string;
  name: string;
  type: "trigger" | "action" | "utility";
  inputs: FieldDef[];
  outputs: FieldDef[];
  sample?: unknown;
  /**
   * Optional custom form component for this node
   * If not provided, BaseNodeForm will be used as fallback
   */
  formComponent?: React.ComponentType<NodeFormProps<any>>;
};

/**
 * Advanced options available for all nodes
 * These are post-processing operations applied after node execution
 */
export interface AdvancedOptions {
  wait?: {
    enabled: boolean;
    duration: number; // milliseconds
  };
  sort?: {
    enabled: boolean;
    field: string;
    order: 'asc' | 'desc';
  };
  limit?: {
    enabled: boolean;
    skip: number;
    take: number;
  };
}

// Item-level lineage tracking (like n8n's pairedItem)
export interface INodeExecutionData {
  json: Record<string, unknown>;
  pairedItem?: {
    item: number; // Index of input item
    input: number; // Input index (0, 1, 2 for MERGE inputs)
  } | {
    item: number;
    input: number;
  }[];
}

// Node execution output with item lineage
export interface INodeExecutionOutput {
  // For branching nodes (IF/SWITCH): multiple output arrays
  // output[0] = TRUE branch items, output[1] = FALSE branch items
  // For normal nodes: single output array at output[0]
  output: INodeExecutionData[][];
  
  // Branch metadata for UI
  outputLabels?: string[]; // ["TRUE", "FALSE"] for IF, ["case_0", "case_1", "default"] for SWITCH
}

export type RunRecord = {
  stepKey: string;
  resolvedInput: unknown;
  
  // New: Item-level execution data with lineage
  executionData?: INodeExecutionOutput;
  
  // Old: Raw output (kept for backward compatibility)
  output?: unknown;
  
  error?: { code: string; message: string };
  status?: number;
  durationMs?: number;
  at: string;
  
  // Node-level source tracking (for quick lookups)
  source?: {
    previousNode: string;
    previousNodeOutput?: number; // For IF: 0=TRUE, 1=FALSE. For normal: 0
    previousNodeOutputKey?: string; // For IF: "TRUE"/"FALSE", for SWITCH: "case_0"/"default"
  }[];
};

export type FlowConfig = {
  steps: Array<{ key: string; type: string; name?: string; config: Record<string, unknown> }>;
  edges?: Array<{
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
  }>;
  mappings: Record<string, unknown>;
};

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type HttpAuthType = "none" | "bearer" | "basic";

export interface HttpNodeConfig {
  method: HttpMethod;
  url: string;
  queryParams?: Array<{ key: string; value: string }>;
  headers?: Array<{ key: string; value: string; sensitive?: boolean }>;
  bodyMode?: "json" | "form" | "multipart" | "raw";
  jsonBody?: string;
  rawBody?: string;
  formBody?: Array<{ key: string; value: string }>;
  multipartBody?: Array<{ key: string; value: string; type: "text" | "file" }>;
  authType?: HttpAuthType;
  authBearerToken?: string;
  authBasicUsername?: string;
  authBasicPassword?: string;
  timeoutMs?: number;
  retryCount?: number;
  retryBackoff?: "linear" | "exponential";
  followRedirects?: boolean;
}

export interface HttpRunResultMetadata {
  status: number;
  statusText: string;
  durationMs: number;
  size: number;
}

export interface HttpRunResult {
  metadata: HttpRunResultMetadata;
  requestPreview: {
    curl: string;
    headers: Record<string, string>;
    body?: unknown;
  };
  responseBody: unknown;
  responseHeaders: Record<string, string>;
  rawBody: string;
}

export interface SampleCatalogEntry {
  stepKey: string;
  schemaKey: string;
  label: string;
  createdAt: string;
  data: unknown;
  metadata: {
    durationMs?: number;
    status?: number;
  };
}
