import { BaseExecutor } from "./base-executor";
import type { ExecutionContext, ExecutionResult } from "./types";

export class SingleOutputExecutor extends BaseExecutor {
  canHandle(nodeType: string): boolean {
    return ["manual", "http", "set", "split", "merge", "code"].includes(nodeType);
  }

  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    const runtimeResult = await this.runNode(context);
    return this.createSingleOutputResult(runtimeResult, context.step.key);
  }
}
