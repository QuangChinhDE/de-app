import { SingleOutputExecutor } from "./single-output-executor";
import { BranchExecutor } from "./branch-executor";
import { LoopExecutor } from "./loop-executor";
import type { ExecutionContext, ExecutionResult } from "./types";

const executors = [new SingleOutputExecutor(), new BranchExecutor(), new LoopExecutor()];

export async function executeWithRegistry(context: ExecutionContext): Promise<ExecutionResult> {
  const exe = executors.find((e) => e.canHandle(context.step.schemaKey));
  if (!exe) throw new Error(`No executor for node type: ${context.step.schemaKey}`);
  return await exe.execute(context);
}
