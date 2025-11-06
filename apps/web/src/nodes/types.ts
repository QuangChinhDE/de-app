import type { NodeSchema, HttpRunResult } from "@node-playground/types";

export type NodeDefinitionKey = "manual" | "http" | "if" | "switch" | "filter" | "set" | "split" | "merge" | "loop" | "wait" | "aggregate" | "code" | "sort" | "limit";

export interface NodeDefinition {
  key: NodeDefinitionKey;
  schema: NodeSchema;
  createInitialConfig: () => Record<string, unknown>;
  run: (args: NodeRuntimeArgs) => Promise<NodeRuntimeResult>;
}

export interface NodeRuntimeArgs {
  config: Record<string, unknown>;
  resolvedConfig: Record<string, unknown>;
  previousOutput?: unknown;
  previousNodeType?: NodeDefinitionKey;
  currentNodeKey?: string;
  allStepOutputs?: Record<string, unknown>;
  inputsByHandle?: Record<string, unknown>; // For nodes with multiple input handles (e.g., MERGE)
}

export interface NodeRuntimeResult {
  // Single output (for most nodes: HTTP, SET, CODE, etc.)
  output?: unknown;
  
  // Multiple outputs (for branching nodes: IF, SWITCH)
  outputs?: Array<{
    label: string;  // 'TRUE', 'FALSE', 'case_0', 'default', etc.
    data: unknown;
  }>;
  
  status?: number;
  durationMs?: number;
  requestPreview?: HttpRunResult["requestPreview"];
  response?: HttpRunResult;
}
