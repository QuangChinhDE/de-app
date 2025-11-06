import type { NodeRuntimeArgs, NodeRuntimeResult } from "../types";
import { smartUnwrap } from "../utils";
import { log } from "../../utils/logger";

/**
 * MERGE Node Runtime
 * 
 * Combines data from multiple sources:
 * - append: Concatenate arrays
 * - merge: Merge object properties
 * - join: SQL-like join on key field
 */
export async function runMergeNode(args: NodeRuntimeArgs): Promise<NodeRuntimeResult> {
  const { resolvedConfig, inputsByHandle, currentNodeKey } = args;
  
  const mode = resolvedConfig.mode as string || "append";
  const inputCount = resolvedConfig.inputCount as number || 2;
  const removeDuplicates = resolvedConfig.removeDuplicates as boolean || false;
  
  const context = { nodeKey: currentNodeKey, nodeType: 'merge', mode };
  
  // Collect data from each input handle
  const inputs: unknown[] = [];
  
  for (let i = 0; i < inputCount; i++) {
    const handleId = `input_${i}`;
    const inputData = inputsByHandle?.[handleId];
    
    if (inputData !== undefined && inputData !== null) {
      const unwrapped = smartUnwrap(inputData, "unknown");
      inputs.push(unwrapped);

    } else {
      log.warn(`Input ${i + 1} not connected`, { ...context, handleId });
    }
  }
  
  if (inputs.length < 2) {
    throw new Error(
      `MERGE requires at least 2 connected inputs. Connected: ${inputs.length}/${inputCount}.\n\n` +
      `Connect nodes to the input handles at the top of this MERGE node.`
    );
  }
  

  
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
      return joinArrays(inputs, joinKey1, joinKey2, joinType, flattenJoined, currentNodeKey);
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
  

  
  // Remove duplicates if requested
  if (removeDuplicates) {
    const seen = new Set<string>();
    result = result.filter((item) => {
      const key = JSON.stringify(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

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

  
  return { output: result };
}

/**
 * JOIN Mode: SQL-like join on key field
 */
function joinArrays(
  inputs: unknown[],
  joinKey1: string,
  joinKey2: string,
  joinType: string,
  flattenJoined: boolean,
  nodeKey?: string
) {
  if (inputs.length < 2) {
    throw new Error(`JOIN mode requires exactly 2 inputs. Connected: ${inputs.length}`);
  }
  
  const context = { nodeKey, nodeType: 'merge', operation: 'join' };
  const [input1, input2] = inputs.slice(0, 2); // Use only first 2 inputs for join
  
  if (!Array.isArray(input1) || !Array.isArray(input2)) {
    throw new Error(
      `JOIN mode requires both inputs to be arrays. Got: ${Array.isArray(input1) ? "array" : typeof input1}, ${Array.isArray(input2) ? "array" : typeof input2}`
    );
  }
  

  
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
      log.warn('Skipping non-object item in JOIN operation', { ...context, input: 1 });
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
  

  
  return { output: result };
}
