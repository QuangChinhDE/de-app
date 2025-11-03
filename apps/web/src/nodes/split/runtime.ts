import type { NodeRuntimeArgs, NodeRuntimeResult } from "../types";
import { smartUnwrap, getFieldValue } from "../utils";

/**
 * SPLIT Node - Simple array splitter (like n8n's "Split Out")
 * 
 * Modes:
 * 1. "auto" - Automatically detect and split arrays:
 *    - If input is array → return as-is (already split)
 *    - If input is object with ONE array field → extract and return that array
 *    - If input is object with MULTIPLE array fields → extract first array
 * 
 * 2. "field" - Manually specify which field to extract
 *    - Use token like "{{steps.http.items}}" or just "items"
 *    - Extract that specific field's array value
 */
export async function runSplitNode(args: NodeRuntimeArgs): Promise<NodeRuntimeResult> {
  const mode = (args.config.mode as string) ?? "auto";
  const fieldPath = (args.config.fieldPath as string) ?? "";
  
  let previousData: unknown = args.resolvedConfig.__previousOutput || null;
  previousData = smartUnwrap(previousData, args.previousNodeType);



  // Mode: Manual field selection
  if (mode === "field" && fieldPath) {
    // Extract field name from token (e.g., "{{steps.http.items}}" → "items")
    const cleanPath = fieldPath
      .replace(/^\{\{steps\.[^.]+\./, "") // Remove {{steps.nodeName.
      .replace(/\}\}$/, "") // Remove }}
      .trim();
    
    const fieldValue = getFieldValue(previousData, cleanPath);
    
    if (Array.isArray(fieldValue)) {

      return { output: fieldValue };
    }
    
    console.warn(`[SPLIT] Field "${cleanPath}" is not an array:`, fieldValue);
    return { output: fieldValue };
  }

  // Mode: Auto-detect array
  // Case 1: Input is already array
  if (Array.isArray(previousData)) {

    return { output: previousData };
  }

  // Case 2: Input is object - find array field
  if (previousData && typeof previousData === "object") {
    const dataObj = previousData as Record<string, unknown>;
    const arrayFields = Object.entries(dataObj).filter(([_, value]) => Array.isArray(value));
    
    if (arrayFields.length === 0) {
      console.warn("[SPLIT] No array fields found in object");
      return { output: previousData };
    }
    
    if (arrayFields.length === 1) {
      const [fieldName, arrayValue] = arrayFields[0];

      return { output: arrayValue };
    }
    
    // Multiple arrays found - use first one
    const [firstFieldName, firstArrayValue] = arrayFields[0];

    return { output: firstArrayValue };
  }

  // Not an array or object
  console.warn("[SPLIT] Input is not array or object:", previousData);
  return { output: previousData };
}


