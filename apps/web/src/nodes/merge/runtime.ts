import type { NodeRuntimeArgs, NodeRuntimeResult } from "../types";
import { smartUnwrap } from "../utils";

/**
 * MERGE Node Runtime
 * 
 * Combines data from multiple sources:
 * - append: Concatenate arrays
 * - merge: Merge object properties
 * - join: SQL-like join on key field
 */
export async function runMergeNode(args: NodeRuntimeArgs): Promise<NodeRuntimeResult> {
  const { resolvedConfig, inputsByHandle } = args;
  
  const mode = resolvedConfig.mode as string || "append";
  const inputCount = resolvedConfig.inputCount as number || 2;
  const removeDuplicates = resolvedConfig.removeDuplicates as boolean || false;
  
  console.log(`[MERGE] Mode: ${mode}, Expected inputs: ${inputCount}`);
  
  // Collect data from each input handle
  const inputs: unknown[] = [];
  
  for (let i = 0; i < inputCount; i++) {
    const handleId = `input_${i}`;
    const inputData = inputsByHandle?.[handleId];
    
    if (inputData !== undefined && inputData !== null) {
      const unwrapped = smartUnwrap(inputData, "unknown");
      inputs.push(unwrapped);
      console.log(`[MERGE] Input ${i + 1} (${handleId}): connected`);
    } else {
      console.warn(`[MERGE] Input ${i + 1} (${handleId}): not connected`);
    }
  }
  
  if (inputs.length < 2) {
    throw new Error(
      `MERGE requires at least 2 connected inputs. Connected: ${inputs.length}/${inputCount}.\n\n` +
      `Connect nodes to the input handles at the top of this MERGE node.`
    );
  }
  
  console.log(`[MERGE] Processing ${inputs.length} inputs with mode: ${mode}`);
  
  switch (mode) {
    case "append":
      return handleAppendMode(inputs, removeDuplicates);
    case "merge":
      const mergeStrategy = resolvedConfig.mergeStrategy as string || "last-wins";
      return handleMergeMode(inputs, mergeStrategy);
    case "join":
      const joinKey1 = resolvedConfig.joinKey1 as string || "id";
      const joinKey2 = resolvedConfig.joinKey2 as string || "id";
      const joinType = resolvedConfig.joinType as string || "inner";
      const flattenJoined = resolvedConfig.flattenJoined as boolean ?? true;
      return handleJoinMode(inputs, joinKey1, joinKey2, joinType, flattenJoined);
    default:
      throw new Error(`Unknown merge mode: ${mode}`);
  }
}

/**
 * APPEND Mode: Concatenate arrays
 */
function handleAppendMode(inputs: unknown[], removeDuplicates: boolean) {
  const arrays: unknown[][] = [];
  
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    
    if (!Array.isArray(input)) {
      throw new Error(
        `APPEND mode requires all sources to be arrays. Source ${i + 1} is ${typeof input}.\n` +
        `Tip: Use SPLIT node to extract arrays from objects first.`
      );
    }
    
    arrays.push(input);
  }
  
  // Concatenate all arrays
  let result = arrays.flat();
  
  console.log(`[MERGE:APPEND] Concatenated ${arrays.length} arrays: ${result.length} total items`);
  
  // Remove duplicates if requested
  if (removeDuplicates) {
    const seen = new Set<string>();
    result = result.filter((item) => {
      const key = JSON.stringify(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    console.log(`[MERGE:APPEND] After removing duplicates: ${result.length} items`);
  }
  
  return { output: result };
}

/**
 * MERGE Mode: Combine object properties with conflict strategy
 */
function handleMergeMode(inputs: unknown[], strategy: string) {
  const objects: Record<string, unknown>[] = [];
  
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      throw new Error(
        `MERGE mode requires all sources to be objects. Source ${i + 1} is ${Array.isArray(input) ? "array" : typeof input}.\n` +
        `Tip: Use APPEND mode for arrays.`
      );
    }
    
    objects.push(input as Record<string, unknown>);
  }
  
  console.log(`[MERGE:MERGE] Merging ${objects.length} objects with strategy: ${strategy}`);
  
  const result: Record<string, unknown> = {};
  
  for (const obj of objects) {
    for (const [key, value] of Object.entries(obj)) {
      if (strategy === "first-wins" && result[key] !== undefined) {
        // Keep first value, skip subsequent
        continue;
      } else if (strategy === "combine-array") {
        // Combine values into array
        if (result[key] === undefined) {
          result[key] = [value];
        } else if (Array.isArray(result[key])) {
          (result[key] as unknown[]).push(value);
        } else {
          result[key] = [result[key], value];
        }
      } else {
        // Default: last-wins
        result[key] = value;
      }
    }
  }
  
  const uniqueKeys = Object.keys(result).length;
  console.log(`[MERGE:MERGE] Result has ${uniqueKeys} unique keys`);
  
  return { output: result };
}

/**
 * JOIN Mode: SQL-like join on key field
 */
function handleJoinMode(
  inputs: unknown[],
  joinKey1: string,
  joinKey2: string,
  joinType: string,
  flattenJoined: boolean
) {
  if (inputs.length < 2) {
    throw new Error(`JOIN mode requires exactly 2 inputs. Connected: ${inputs.length}`);
  }
  
  const [input1, input2] = inputs.slice(0, 2); // Use only first 2 inputs for join
  
  if (!Array.isArray(input1) || !Array.isArray(input2)) {
    throw new Error(
      `JOIN mode requires both inputs to be arrays. Got: ${Array.isArray(input1) ? "array" : typeof input1}, ${Array.isArray(input2) ? "array" : typeof input2}`
    );
  }
  
  console.log(`[MERGE:JOIN] ${joinType.toUpperCase()} JOIN on ${joinKey1} = ${joinKey2}`);
  console.log(`[MERGE:JOIN] Left: ${input1.length} items, Right: ${input2.length} items`);
  
  // Build index for input2 for faster lookup
  const rightIndex = new Map<unknown, unknown[]>();
  for (const item of input2) {
    if (typeof item === "object" && item !== null && !Array.isArray(item)) {
      const obj = item as Record<string, unknown>;
      const keyValue = obj[joinKey2];
      
      if (!rightIndex.has(keyValue)) {
        rightIndex.set(keyValue, []);
      }
      rightIndex.get(keyValue)!.push(item);
    }
  }
  
  const result: unknown[] = [];
  const matchedRightKeys = new Set<unknown>();
  
  // Process left side
  for (const leftItem of input1) {
    if (typeof leftItem !== "object" || leftItem === null || Array.isArray(leftItem)) {
      console.warn(`[MERGE:JOIN] Skipping non-object item in Input 1`);
      continue;
    }
    
    const leftObj = leftItem as Record<string, unknown>;
    const leftKeyValue = leftObj[joinKey1];
    const rightItems = rightIndex.get(leftKeyValue) || [];
    
    if (rightItems.length > 0) {
      // Match found - create joined record for each match
      for (const rightItem of rightItems) {
        matchedRightKeys.add(leftKeyValue);
        
        if (flattenJoined) {
          // Flatten: merge all properties
          const rightObj = rightItem as Record<string, unknown>;
          result.push({ ...leftObj, ...rightObj });
        } else {
          // Nested: keep separate
          result.push({
            left: leftObj,
            right: rightItem,
          });
        }
      }
    } else if (joinType === "left" || joinType === "outer") {
      // Left/Outer join: include unmatched left items
      if (flattenJoined) {
        result.push(leftObj);
      } else {
        result.push({
          left: leftObj,
          right: null,
        });
      }
    }
  }
  
  // For outer join, add unmatched right items
  if (joinType === "outer") {
    for (const rightItem of input2) {
      if (typeof rightItem !== "object" || rightItem === null || Array.isArray(rightItem)) continue;
      
      const rightObj = rightItem as Record<string, unknown>;
      const rightKeyValue = rightObj[joinKey2];
      
      if (!matchedRightKeys.has(rightKeyValue)) {
        if (flattenJoined) {
          result.push(rightObj);
        } else {
          result.push({
            left: null,
            right: rightObj,
          });
        }
      }
    }
  }
  
  console.log(`[MERGE:JOIN] Result: ${result.length} items after ${joinType} join`);
  
  return { output: result };
}
