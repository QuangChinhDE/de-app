import type { NodeRuntimeArgs, NodeRuntimeResult } from "../types";
import { smartUnwrap } from "../utils";

/**
 * SORT Node Runtime
 * 
 * Sorts an array by specified field.
 * Supports number, string, and date sorting.
 */
export async function runSortNode(args: NodeRuntimeArgs): Promise<NodeRuntimeResult> {
  const { resolvedConfig, previousOutput } = args;
  
  let items = resolvedConfig.items as unknown;
  const field = resolvedConfig.field as string;
  const direction = (resolvedConfig.direction as string) || "asc";
  const dataType = (resolvedConfig.dataType as string) || "auto";
  
  if (!field) {
    throw new Error("SORT requires 'Sort By Field'. Specify which field to sort by.");
  }
  
  // Auto-use previous output if items not provided
  if (items == null || items === "") {
    items = smartUnwrap(previousOutput, args.previousNodeType);

  }
  
  // Validate array
  if (!Array.isArray(items)) {
    throw new Error(
      `SORT requires an array input. Got: ${typeof items}. ` +
      `Use {{steps.xxx}} to reference an array.`
    );
  }
  
  if (items.length === 0) {

    return {
      output: {
        items: [],
        count: 0,
      },
    };
  }
  

  
  // Create a copy to avoid mutating original
  const sortedItems = [...items];
  
  // Sort
  sortedItems.sort((a, b) => {
    // Extract values
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    
    let aVal = aObj[field];
    let bVal = bObj[field];
    
    // Handle undefined/null
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return direction === "asc" ? 1 : -1;
    if (bVal == null) return direction === "asc" ? -1 : 1;
    
    // Determine comparison type
    let compareResult = 0;
    
    if (dataType === "auto") {
      // Auto-detect type
      if (typeof aVal === "number" && typeof bVal === "number") {
        compareResult = aVal - bVal;
      } else if (typeof aVal === "string" && typeof bVal === "string") {
        // Try parsing as date first
        const aDate = new Date(aVal);
        const bDate = new Date(bVal);
        
        if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
          // Valid dates
          compareResult = aDate.getTime() - bDate.getTime();
        } else {
          // String comparison
          compareResult = aVal.localeCompare(bVal);
        }
      } else {
        // Convert to string and compare
        compareResult = String(aVal).localeCompare(String(bVal));
      }
    } else if (dataType === "number") {
      const aNum = typeof aVal === "number" ? aVal : parseFloat(String(aVal));
      const bNum = typeof bVal === "number" ? bVal : parseFloat(String(bVal));
      compareResult = aNum - bNum;
    } else if (dataType === "string") {
      compareResult = String(aVal).localeCompare(String(bVal));
    } else if (dataType === "date") {
      const aDate = new Date(String(aVal));
      const bDate = new Date(String(bVal));
      compareResult = aDate.getTime() - bDate.getTime();
    }
    
    // Apply direction
    return direction === "asc" ? compareResult : -compareResult;
  });
  

  
  return {
    output: {
      items: sortedItems,
      count: sortedItems.length,
      sortedBy: field,
      direction,
    },
  };
}
