import type { NodeRuntimeArgs, NodeRuntimeResult } from "../types";
import { smartUnwrap } from "../utils";

/**
 * AGGREGATE Node Runtime
 * 
 * Performs aggregation operations on arrays:
 * - sum, count, avg, min, max
 * - groupBy with aggregation per group
 */
export async function runAggregateNode(args: NodeRuntimeArgs): Promise<NodeRuntimeResult> {
  const { resolvedConfig, previousOutput } = args;
  
  let items = resolvedConfig.items as unknown;
  const operation = (resolvedConfig.operation as string) || "sum";
  const field = resolvedConfig.field as string;
  const groupByField = resolvedConfig.groupByField as string;
  const groupOperation = (resolvedConfig.groupOperation as string) || "count";
  const groupOperationField = resolvedConfig.groupOperationField as string;
  
  // Auto-use previous output if items not provided
  if (items == null || items === "") {
    items = smartUnwrap(previousOutput, args.previousNodeType);
    console.log("[AGGREGATE] 🎯 Using previous output as items");
  }
  
  // Validate array
  if (!Array.isArray(items)) {
    throw new Error(
      `AGGREGATE requires an array input. Got: ${typeof items}. ` +
      `Use {{steps.xxx}} to reference an array.`
    );
  }
  
  if (items.length === 0) {
    console.log("[AGGREGATE] ⚠️ Empty array provided");
    return {
      output: {
        result: 0,
        count: 0,
        groups: [],
      },
    };
  }
  
  console.log(`[AGGREGATE] Processing ${items.length} items with operation: ${operation}`);
  
  if (operation === "groupBy") {
    return handleGroupBy(items, groupByField, groupOperation, groupOperationField);
  }
  
  return handleSimpleAggregation(items, operation, field);
}

/**
 * Handle simple aggregations: sum, count, avg, min, max
 */
function handleSimpleAggregation(
  items: unknown[],
  operation: string,
  field?: string
): NodeRuntimeResult {
  if (operation === "count") {
    console.log(`[AGGREGATE] Count: ${items.length}`);
    return {
      output: {
        result: items.length,
        count: items.length,
      },
    };
  }
  
  // For other operations, need field
  if (!field) {
    throw new Error(`AGGREGATE ${operation} requires a field name. Specify 'Field to Aggregate'.`);
  }
  
  // Extract numeric values from field
  const values: number[] = [];
  for (const item of items) {
    if (typeof item === "object" && item !== null && !Array.isArray(item)) {
      const obj = item as Record<string, unknown>;
      const value = obj[field];
      
      if (typeof value === "number") {
        values.push(value);
      } else if (typeof value === "string") {
        const num = parseFloat(value);
        if (!isNaN(num)) {
          values.push(num);
        }
      }
    }
  }
  
  if (values.length === 0) {
    throw new Error(
      `AGGREGATE: No numeric values found in field "${field}". ` +
      `Check that field exists and contains numbers.`
    );
  }
  
  console.log(`[AGGREGATE] Extracted ${values.length} numeric values from field "${field}"`);
  
  let result: number;
  
  switch (operation) {
    case "sum":
      result = values.reduce((acc, val) => acc + val, 0);
      break;
    case "avg":
      result = values.reduce((acc, val) => acc + val, 0) / values.length;
      break;
    case "min":
      result = Math.min(...values);
      break;
    case "max":
      result = Math.max(...values);
      break;
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
  
  console.log(`[AGGREGATE] ${operation.toUpperCase()}: ${result}`);
  
  return {
    output: {
      result,
      count: values.length,
      operation,
      field,
    },
  };
}

/**
 * Handle groupBy with aggregation per group
 */
function handleGroupBy(
  items: unknown[],
  groupByField: string,
  groupOperation: string,
  groupOperationField?: string
): NodeRuntimeResult {
  if (!groupByField) {
    throw new Error("AGGREGATE groupBy requires 'Group By Field'.");
  }
  
  console.log(`[AGGREGATE] Grouping by field: ${groupByField}`);
  
  // Group items
  const groups = new Map<string, unknown[]>();
  
  for (const item of items) {
    if (typeof item === "object" && item !== null && !Array.isArray(item)) {
      const obj = item as Record<string, unknown>;
      const groupKey = String(obj[groupByField] ?? "null");
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(item);
    }
  }
  
  console.log(`[AGGREGATE] Created ${groups.size} groups`);
  
  // Perform operation on each group
  const results: Array<{
    group: string;
    count: number;
    result?: number;
    items: unknown[];
  }> = [];
  
  for (const [groupKey, groupItems] of groups.entries()) {
    const groupResult: {
      group: string;
      count: number;
      result?: number;
      items: unknown[];
    } = {
      group: groupKey,
      count: groupItems.length,
      items: groupItems,
    };
    
    if (groupOperation !== "count") {
      // Need field for sum/avg/min/max
      if (!groupOperationField) {
        throw new Error(
          `AGGREGATE groupBy with ${groupOperation} requires 'Group Operation Field'.`
        );
      }
      
      // Extract values
      const values: number[] = [];
      for (const item of groupItems) {
        const obj = item as Record<string, unknown>;
        const value = obj[groupOperationField];
        
        if (typeof value === "number") {
          values.push(value);
        } else if (typeof value === "string") {
          const num = parseFloat(value);
          if (!isNaN(num)) {
            values.push(num);
          }
        }
      }
      
      if (values.length > 0) {
        switch (groupOperation) {
          case "sum":
            groupResult.result = values.reduce((acc, val) => acc + val, 0);
            break;
          case "avg":
            groupResult.result = values.reduce((acc, val) => acc + val, 0) / values.length;
            break;
          case "min":
            groupResult.result = Math.min(...values);
            break;
          case "max":
            groupResult.result = Math.max(...values);
            break;
        }
      }
    }
    
    results.push(groupResult);
  }
  
  console.log(`[AGGREGATE] Grouped results:`, results.map(r => `${r.group}: ${r.result ?? r.count}`));
  
  return {
    output: {
      groups: results,
      totalGroups: results.length,
      totalItems: items.length,
    },
  };
}
