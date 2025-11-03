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
export type NodeSchema = {
  key: string;
  name: string;
  type: "trigger" | "action" | "utility";
  inputs: FieldDef[];
  outputs: FieldDef[];
  sample?: unknown;
};

export type RunRecord = {
  stepKey: string;
  resolvedInput: unknown;
  output?: unknown;
  error?: { code: string; message: string };
  status?: number;
  durationMs?: number;
  at: string;
};

export type FlowConfig = {
  steps: Array<{ key: string; type: string; config: Record<string, unknown> }>;
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
