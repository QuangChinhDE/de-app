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
  output: unknown;
  status?: number;
  durationMs?: number;
  requestPreview?: HttpRunResult["requestPreview"];
  response?: HttpRunResult;
}
