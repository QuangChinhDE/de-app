import { BaseExecutor } from "./base-executor";
import type { ExecutionContext, ExecutionResult } from "./types";
import { resolveTokens } from "../../utils/expression";

export class LoopExecutor extends BaseExecutor {
  canHandle(nodeType: string): boolean {
    return nodeType === "loop";
  }

  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    const loopResult = await this.runNode(context);

    const items = Array.isArray(loopResult.output?.items) ? loopResult.output.items : [];

    if (!items.length) {
      return this.createSingleOutputResult(loopResult, context.step.key);
    }

    // Find downstream edge (first one)
    const downstreamEdge = context.allEdges.find((e) => e.source === context.step.key);
    if (!downstreamEdge) {
      return this.createSingleOutputResult(loopResult, context.step.key);
    }

    const downstreamStep = context.allSteps.find((s) => s.key === downstreamEdge.target);
    if (!downstreamStep) {
      return this.createSingleOutputResult(loopResult, context.step.key);
    }

    // Load node definitions dynamically to avoid circular imports
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodeDefinitions = require("../../nodes").nodeDefinitions;
    const downstreamDef = nodeDefinitions[downstreamStep.schemaKey];

    const batchSize = (context.resolvedConfig.batchSize as number) || 1;
    const pauseBetweenBatches = (context.resolvedConfig.pauseBetweenBatches as number) || 0;
    const continueOnError = (context.resolvedConfig.continueOnError as boolean) || false;

    const processedItems: unknown[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchIndex = Math.floor(i / batchSize);

      for (let j = 0; j < batch.length; j++) {
        const currentItem = batch[j];
        const itemIndex = i + j;

        try {
          const loopTokenContext = {
            ...context.tokenContext,
            $item: currentItem,
            $index: itemIndex,
            $total: items.length,
            $batchIndex: batchIndex,
          } as Record<string, unknown>;

          const downstreamResolved = resolveTokens(downstreamStep.config, loopTokenContext);

          const downstreamResult = await downstreamDef.run({
            config: downstreamStep.config,
            resolvedConfig: downstreamResolved,
            previousOutput: currentItem,
            previousNodeType: context.step.schemaKey,
            currentNodeKey: downstreamStep.key,
            allStepOutputs: loopTokenContext,
          });

          const itemOutput = downstreamResult.outputs ? downstreamResult.outputs[0]?.data : downstreamResult.output;
          processedItems.push(itemOutput);
          successCount++;
        } catch (err) {
          errorCount++;
          if (!continueOnError) throw err;
          processedItems.push(null);
        }
      }

      if (pauseBetweenBatches > 0 && i + batchSize < items.length) {
        await new Promise((r) => setTimeout(r, pauseBetweenBatches));
      }
    }

    loopResult.output = {
      items: processedItems,
      successCount,
      errorCount,
      totalCount: items.length,
      batches: Math.ceil(items.length / batchSize),
    };

    return {
      runtimeResult: loopResult,
      outputsToStore: { [context.step.key]: loopResult.output },
      isBranchingNode: false,
      executedDownstream: true,
    };
  }
}
