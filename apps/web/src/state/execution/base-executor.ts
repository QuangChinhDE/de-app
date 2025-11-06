import type { ExecutionContext, ExecutionResult } from "./types";

export abstract class BaseExecutor {
  abstract canHandle(nodeType: string): boolean;
  abstract execute(context: ExecutionContext): Promise<ExecutionResult>;

  protected async runNode(context: ExecutionContext) {
    const { step, definition, resolvedConfig, previousOutput, previousNodeType, tokenContext } = context;

    return await definition.run({
      config: step.config,
      resolvedConfig,
      previousOutput,
      previousNodeType,
      currentNodeKey: step.key,
      allStepOutputs: tokenContext,
    });
  }

  protected createSingleOutputResult(runtimeResult: any, stepKey: string): ExecutionResult {
    return {
      runtimeResult,
      outputsToStore: {
        [stepKey]: runtimeResult.output,
      },
      isBranchingNode: false,
    };
  }
}
