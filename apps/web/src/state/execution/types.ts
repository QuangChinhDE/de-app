export interface ExecutionContext {
  step: any;
  definition: any;
  resolvedConfig: Record<string, unknown>;
  previousOutput?: unknown;
  previousNodeType?: string;
  tokenContext: Record<string, unknown>;
  allSteps: any[];
  allEdges: any[];
  stepOutputs: Record<string, unknown>;
}

export interface ExecutionResult {
  runtimeResult: any;
  outputsToStore: Record<string, unknown>;
  branchLabels?: string[];
  isBranchingNode: boolean;
  executedDownstream?: boolean;
}

export interface NodeExecutor {
  canHandle(nodeType: string): boolean;
  execute(context: ExecutionContext): Promise<ExecutionResult>;
}
