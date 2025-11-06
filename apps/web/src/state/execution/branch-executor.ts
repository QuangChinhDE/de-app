import { BaseExecutor } from "./base-executor";
import type { ExecutionContext, ExecutionResult } from "./types";

export class BranchExecutor extends BaseExecutor {
  canHandle(nodeType: string): boolean {
    return ["if", "switch"].includes(nodeType);
  }

  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    const runtimeResult = await this.runNode(context);

    // Backwards compatibility: support legacy { output: { TRUE: [], FALSE: [] } }
    if (!runtimeResult.outputs && runtimeResult.output && typeof runtimeResult.output === 'object') {
      const legacy = runtimeResult.output as Record<string, unknown>;
      const outputs = Object.keys(legacy).map((k) => ({ label: k, data: legacy[k] }));
      runtimeResult.outputs = outputs;
    }

    if (!runtimeResult.outputs || !Array.isArray(runtimeResult.outputs)) {
      throw new Error(`Branching node ${context.step.key} must return { outputs: [{label, data}] }`);
    }

    const outputsToStore: Record<string, unknown> = {};
    const branchLabels: string[] = [];

    runtimeResult.outputs.forEach((branch: any) => {
      const label = String(branch.label);
      branchLabels.push(label);
      outputsToStore[`${context.step.key}-${label}`] = branch.data;
    });

    return {
      runtimeResult,
      outputsToStore,
      branchLabels,
      isBranchingNode: true,
    };
  }
}
