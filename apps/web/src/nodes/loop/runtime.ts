import type { NodeRuntimeArgs, NodeRuntimeResult } from "../types";
import { smartUnwrap } from "../utils";

/**
 * LOOP Node Runtime
 * 
 * Iterates over an array and processes each item individually.
 * This is a "split" operation - it breaks an array into individual items.
 * 
 * Note: In a real workflow engine, this would trigger downstream nodes
 * for each item. In this implementation, we just split the array and
 * return metadata about the loop.
 */
export async function runLoopNode(args: NodeRuntimeArgs): Promise<NodeRuntimeResult> {
  const { resolvedConfig, previousOutput } = args;
  
  let items = resolvedConfig.items as unknown;
  const batchSize = (resolvedConfig.batchSize as number) || 1;
  const pauseBetweenBatches = (resolvedConfig.pauseBetweenBatches as number) || 0;
  const continueOnError = (resolvedConfig.continueOnError as boolean) || false;
  
  console.log(`[LOOP] Starting loop with batch size: ${batchSize}`);
  
  // If items not provided, try previous output
  if (items == null || items === "") {
    items = smartUnwrap(previousOutput, args.previousNodeType);
    console.log("[LOOP] 🎯 Using previous output as items");
  }
  
  // Validate items is an array
  if (!Array.isArray(items)) {
    throw new Error(
      `LOOP requires an array input. Got: ${typeof items}. ` +
      `Use {{steps.xxx}} to reference an array from a previous node, or use SPLIT node first.`
    );
  }
  
  if (items.length === 0) {
    console.log("[LOOP] ⚠️ Empty array provided, nothing to loop over");
    return {
      output: {
        items: [],
        successCount: 0,
        errorCount: 0,
        totalCount: 0,
        batches: [],
      },
    };
  }
  
  console.log(`[LOOP] Processing ${items.length} items in batches of ${batchSize}`);
  
  // Split into batches
  const batches: unknown[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  
  console.log(`[LOOP] Created ${batches.length} batches`);
  
  // Process each batch with delay
  const processedItems: unknown[] = [];
  let successCount = 0;
  let errorCount = 0;
  
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    
    console.log(`[LOOP] Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} items)`);
    
    // In a real implementation, this would execute downstream nodes for each item
    // For now, we just track the items and simulate processing
    for (const item of batch) {
      try {
        // Simulate item processing
        processedItems.push(item);
        successCount++;
      } catch (error) {
        errorCount++;
        
        if (!continueOnError) {
          throw new Error(
            `LOOP failed at item ${successCount + errorCount}/${items.length}: ${error}`
          );
        }
        
        console.warn(`[LOOP] Error processing item ${successCount + errorCount}, continuing...`);
      }
    }
    
    // Pause between batches (except after last batch)
    if (pauseBetweenBatches > 0 && batchIndex < batches.length - 1) {
      console.log(`[LOOP] Pausing ${pauseBetweenBatches}ms before next batch...`);
      await new Promise((resolve) => setTimeout(resolve, pauseBetweenBatches));
    }
  }
  
  console.log(
    `[LOOP] ✅ Completed: ${successCount} success, ${errorCount} errors, ${items.length} total`
  );
  
  return {
    output: {
      items: processedItems,
      successCount,
      errorCount,
      totalCount: items.length,
      batches: batches.map((batch, index) => ({
        batchIndex: index + 1,
        itemCount: batch.length,
        items: batch,
      })),
    },
  };
}
