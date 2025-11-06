import type { NodeRuntimeArgs, NodeRuntimeResult } from "../types";
import { smartUnwrap, getFieldValue } from "../utils";
import { log } from "../../utils/logger";

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
  const context = { nodeKey: args.currentNodeKey, nodeType: 'split', mode };
  
  let previousData: unknown = args.resolvedConfig.__previousOutput || null;
  previousData = smartUnwrap(previousData, args.previousNodeType);

  // Debug: Log received data
  log.debug(`SPLIT received data`, { ...context, previousData, previousDataType: typeof previousData });

  // Mode: Manual field selection
  if (mode === "field" && fieldPath) {
    // Extract field name from token (e.g., "{{steps.http.items}}" → "items")
    const cleanPath = fieldPath
      .replace(/^\{\{steps\.[^.]+\./, "") // Remove {{steps.nodeName.
      .replace(/\}\}$/, "") // Remove }}
      .trim();
    
    log.debug(`Extracting field`, { ...context, fieldPath, cleanPath });
    const fieldValue = getFieldValue(previousData, cleanPath);
    log.debug(`Field value extracted`, { ...context, cleanPath, fieldValue, isArray: Array.isArray(fieldValue) });
    
    if (Array.isArray(fieldValue)) {
      log.dataFlow(`Split field extracted`, { ...context, fieldPath: cleanPath, itemCount: fieldValue.length });
      return { output: fieldValue };
    }
    
    log.warn(`Field is not an array`, { ...context, fieldPath: cleanPath, fieldType: typeof fieldValue });
    return { output: fieldValue };
  }

  // Mode: Auto-detect array
  // Case 1: Input is already array
  if (Array.isArray(previousData)) {
    log.dataFlow(`Input is already an array`, { ...context, itemCount: previousData.length });
    return { output: previousData };
  }

  // Case 2: Input is object - find array field
  if (previousData && typeof previousData === "object") {
    const dataObj = previousData as Record<string, unknown>;
    const arrayFields = Object.entries(dataObj).filter(([_, value]) => Array.isArray(value));
    
    if (arrayFields.length === 0) {
      log.warn('No array fields found in object', context);
      return { output: previousData };
    }
    
    if (arrayFields.length === 1) {
      const [fieldName, arrayValue] = arrayFields[0];
      log.dataFlow(`Auto-detected single array field`, { ...context, fieldName, itemCount: (arrayValue as unknown[]).length });
      return { output: arrayValue };
    }
    
    // Multiple arrays found - use first one
    const [firstFieldName, firstArrayValue] = arrayFields[0];
    log.info(`Multiple array fields found, using first one`, { ...context, fieldName: firstFieldName, totalArrayFields: arrayFields.length });
    return { output: firstArrayValue };
  }

  // Not an array or object
  log.warn('Input is not array or object', { ...context, inputType: typeof previousData });
  return { output: previousData };
}


