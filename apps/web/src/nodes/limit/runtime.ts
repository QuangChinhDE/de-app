import type { NodeRuntimeArgs, NodeRuntimeResult } from "../types";
import { smartUnwrap } from "../utils";

/**
 * LIMIT Node Runtime
 * 
 * Limits/slices an array (pagination support).
 * Returns subset of items with skip/limit.
 */
export async function runLimitNode(args: NodeRuntimeArgs): Promise<NodeRuntimeResult> {
  const { resolvedConfig, previousOutput } = args;
  
  let items = resolvedConfig.items as unknown;
  const skip = (resolvedConfig.skip as number) || 0;
  const limit = (resolvedConfig.limit as number) || 10;
  
  // Auto-use previous output if items not provided
  if (items == null || items === "") {
    items = smartUnwrap(previousOutput, args.previousNodeType);
    console.log("[LIMIT] 🎯 Using previous output as items");
  }
  
  // Validate array
  if (!Array.isArray(items)) {
    throw new Error(
      `LIMIT requires an array input. Got: ${typeof items}. ` +
      `Use {{steps.xxx}} to reference an array.`
    );
  }
  
  const totalCount = items.length;
  
  if (totalCount === 0) {
    console.log("[LIMIT] ⚠️ Empty array provided");
    return {
      output: {
        items: [],
        count: 0,
        totalCount: 0,
        hasMore: false,
      },
    };
  }
  
  console.log(`[LIMIT] Processing array: skip=${skip}, limit=${limit}, total=${totalCount}`);
  
  // Apply skip and limit
  const startIndex = Math.max(0, skip);
  const endIndex = Math.min(totalCount, startIndex + limit);
  
  const limitedItems = items.slice(startIndex, endIndex);
  const hasMore = endIndex < totalCount;
  
  console.log(
    `[LIMIT] ✅ Returned ${limitedItems.length} items (from index ${startIndex} to ${endIndex - 1})`
  );
  
  if (hasMore) {
    console.log(`[LIMIT] 📌 ${totalCount - endIndex} more items available`);
  }
  
  return {
    output: {
      items: limitedItems,
      count: limitedItems.length,
      totalCount,
      hasMore,
      skip: startIndex,
      limit,
    },
  };
}
