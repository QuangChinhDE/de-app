import type { NodeRuntimeArgs, NodeRuntimeResult } from "../types";
import { extractFieldPath, getFieldValue, smartUnwrap } from "../utils";

interface FilterCondition {
  field: string;
  fieldType: string;
  operator: string;
  value: string;
}

export async function runFilterNode(args: NodeRuntimeArgs): Promise<NodeRuntimeResult> {
  console.log("[Filter Runtime] Starting execution");
  console.log("[Filter Runtime] Raw config:", args.config);
  console.log("[Filter Runtime] Resolved config:", args.resolvedConfig);
  
  // Get conditions array
  const conditions = (args.resolvedConfig.conditions as FilterCondition[]) ?? [];
  const mode = String(args.resolvedConfig.mode ?? "include");
  const logic = String(args.resolvedConfig.logic ?? "AND");
  
  console.log("[Filter Runtime] Parsed conditions:", conditions);
  console.log("[Filter Runtime] Mode:", mode, "Logic:", logic);
  
  // Get previous data from resolved config and smart unwrap
  let previousData: unknown = args.resolvedConfig.__previousOutput || {};
  previousData = smartUnwrap(previousData, args.previousNodeType);
  console.log("[Filter Runtime] Previous data (after smart unwrap):", previousData);
  console.log("[Filter Runtime] Previous node type:", args.previousNodeType);

  // Use raw config conditions to preserve tokens
  const rawConditions = (args.config.conditions as FilterCondition[]) ?? [];
  console.log("[Filter Runtime] Raw conditions (with tokens):", rawConditions);

  if (!Array.isArray(rawConditions) || rawConditions.length === 0) {
    throw new Error("Filter node requires at least one condition");
  }

  // If previous data is not an array, try to find an array field
  let arrayToFilter: unknown[] = [];
  
  if (Array.isArray(previousData)) {
    arrayToFilter = previousData;
    console.log("[Filter Runtime] Using previous data as array, length:", arrayToFilter.length);
  } else if (previousData && typeof previousData === "object") {
    // Search for first array field
    const values = Object.values(previousData);
    const firstArray = values.find((v) => Array.isArray(v));
    if (firstArray) {
      arrayToFilter = firstArray as unknown[];
      console.log("[Filter Runtime] Found array field in previous data, length:", arrayToFilter.length);
    } else {
      console.log("[Filter Runtime] No array found in previous data, object keys:", Object.keys(previousData));
    }
  } else {
    console.log("[Filter Runtime] Previous data is not object or array, type:", typeof previousData);
  }

  if (arrayToFilter.length === 0) {
    console.warn(
      `[Filter Runtime] No data to filter. ` +
      `Previous node type: ${args.previousNodeType || 'unknown'}. ` +
      `Expected array input, got: ${Array.isArray(previousData) ? 'empty array' : typeof previousData}`
    );
    return {
      output: {
        filtered: [],
        removed: [],
        summary: {
          total: 0,
          filtered: 0,
          removed: 0,
        },
      },
    };
  }

  // Filter array based on conditions
  const result = filterArray(arrayToFilter, rawConditions, mode, logic);

  console.log("[Filter Runtime] Filter result:", result);
  console.log("[Filter Runtime] Filtered count:", (result.filtered as any[]).length);
  console.log("[Filter Runtime] Removed count:", (result.removed as any[]).length);

  // Return filtered array as main output (like Manual node does)
  // This makes it easier to use in subsequent nodes
  return { 
    output: result.filtered
  };
}

function filterArray(
  data: unknown[],
  conditions: FilterCondition[],
  mode: string,
  logic: string
): Record<string, unknown> {

  // Helper to detect actual type of value
  const detectValueType = (value: unknown): string => {
    if (value === null || value === undefined) return "unknown";
    if (Array.isArray(value)) return "array";
    if (typeof value === "boolean") return "boolean";
    if (typeof value === "number") return "number";
    if (typeof value === "string") {
      // Check if it's a date string
      const dateTest = new Date(value);
      if (!isNaN(dateTest.getTime()) && value.match(/\d{4}-\d{2}-\d{2}/)) {
        return "date";
      }
      return "string";
    }
    if (typeof value === "object") return "object";
    return "string";
  };

  // Helper to convert and validate value based on type
  const convertValueByType = (value: string, targetType: string): any => {
    if (!value) return value;
    
    switch (targetType) {
      case "number":
        const num = Number(value);
        if (isNaN(num)) {
          console.warn(`[Filter] Invalid number value: "${value}"`);
          return 0;
        }
        return num;
      
      case "boolean":
        const lower = String(value).toLowerCase();
        return lower === "true" || lower === "1";
      
      case "date":
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          console.warn(`[Filter] Invalid date value: "${value}"`);
          return new Date();
        }
        return date;
      
      default:
        return String(value);
    }
  };

  // Helper function to evaluate a single condition based on field type
  const evaluateCondition = (item: unknown, condition: FilterCondition): boolean => {
    console.log(`[Filter Eval] ===== Evaluating Condition =====`);
    console.log(`[Filter Eval] Raw condition:`, JSON.stringify(condition));
    
    // Extract field path from token using shared utility
    const fieldPath = extractFieldPath(condition.field);

    console.log(`[Filter Eval] Field: "${condition.field}" -> Extracted path: "${fieldPath}"`);

    const itemValue = getFieldValue(item, fieldPath);
    const rawCompareValue = condition.value;
    const fieldType = condition.fieldType || "string";
    
    // Convert compare value to correct type
    const compareValue = convertValueByType(rawCompareValue, fieldType);
    
    console.log(`[Filter Eval] Item value from field "${fieldPath}": ${itemValue} (type: ${typeof itemValue})`);
    console.log(`[Filter Eval] Raw compare value: "${rawCompareValue}" -> Converted: ${compareValue} (type: ${typeof compareValue})`);
    console.log(`[Filter Eval] Field type: ${fieldType}, Operator: "${condition.operator}"`);
    
    // Auto-detect actual type if not specified or if type mismatch
    const actualType = detectValueType(itemValue);
    const effectiveFieldType = (actualType !== "unknown" && actualType !== "object") ? actualType : fieldType;
    
    console.log(`[Filter Eval] Detected actual type: ${actualType}, Using effective type: ${effectiveFieldType}`);

    // String operators
    if (effectiveFieldType === "string") {
      const strValue = String(itemValue ?? "");
      const strCompare = String(compareValue);

      switch (condition.operator) {
        case "==":
        case "is equal to":
          return strValue === strCompare;
        case "!=":
        case "is not equal to":
          return strValue !== strCompare;
        case "contains":
          return strValue.includes(strCompare);
        case "does not contain":
          return !strValue.includes(strCompare);
        case "startsWith":
        case "starts with":
          return strValue.startsWith(strCompare);
        case "does not start with":
          return !strValue.startsWith(strCompare);
        case "endsWith":
        case "ends with":
          return strValue.endsWith(strCompare);
        case "does not end with":
          return !strValue.endsWith(strCompare);
        case "isEmpty":
        case "is empty":
          return strValue === "";
        case "isNotEmpty":
        case "is not empty":
          return strValue !== "";
        case "exists":
          return itemValue !== undefined && itemValue !== null;
        case "does not exist":
          return itemValue === undefined || itemValue === null;
        case "matches regex":
          try {
            return new RegExp(strCompare).test(strValue);
          } catch {
            return false;
          }
        case "does not match regex":
          try {
            return !new RegExp(strCompare).test(strValue);
          } catch {
            return true;
          }
        default:
          return false;
      }
    }

    // Number operators
    if (effectiveFieldType === "number") {
      const numValue = Number(itemValue);
      const numCompare = Number(compareValue); // Ensure number type
      
      console.log(`[Filter Number] numValue: ${numValue} (${typeof numValue}), numCompare: ${numCompare} (${typeof numCompare})`);

      switch (condition.operator) {
        case "==":
        case "is equal to":
          const result = numValue === numCompare;
          console.log(`[Filter Number] ${numValue} === ${numCompare} = ${result}`);
          return result;
        case "!=":
        case "is not equal to":
          return numValue !== numCompare;
        case ">":
        case "is greater than":
          return numValue > numCompare;
        case "<":
        case "is less than":
          return numValue < numCompare;
        case ">=":
        case "is greater than or equal to":
          return numValue >= numCompare;
        case "<=":
        case "is less than or equal to":
          return numValue <= numCompare;
        case "exists":
          return itemValue !== undefined && itemValue !== null;
        case "does not exist":
          return itemValue === undefined || itemValue === null;
        case "is empty":
          return itemValue === undefined || itemValue === null || itemValue === "";
        case "is not empty":
          return itemValue !== undefined && itemValue !== null && itemValue !== "";
        default:
          return false;
      }
    }

    // Boolean operators
    if (effectiveFieldType === "boolean") {
      const boolValue = Boolean(itemValue);
      const boolCompare = compareValue; // Already converted to boolean

      switch (condition.operator) {
        case "is true":
          return boolValue === true;
        case "is false":
          return boolValue === false;
        case "==":
        case "is equal to":
          return boolValue === boolCompare;
        case "!=":
        case "is not equal to":
          return boolValue !== boolCompare;
        case "exists":
          return itemValue !== undefined && itemValue !== null;
        case "does not exist":
          return itemValue === undefined || itemValue === null;
        case "is empty":
          return itemValue === undefined || itemValue === null || itemValue === "";
        case "is not empty":
          return itemValue !== undefined && itemValue !== null && itemValue !== "";
        default:
          return false;
      }
    }

    // Date & Time operators
    if (effectiveFieldType === "date" || effectiveFieldType === "datetime") {
      const dateValue = new Date(itemValue as any);
      const dateCompare = compareValue; // Already converted to Date

      if (isNaN(dateValue.getTime())) {
        console.warn(`[Filter Date] Invalid date value: ${itemValue}`);
        return false;
      }
      
      if (!(dateCompare instanceof Date) || isNaN(dateCompare.getTime())) {
        console.warn(`[Filter Date] Invalid compare date: ${compareValue}`);
        return false;
      }

      switch (condition.operator) {
        case "==":
        case "is equal to":
          return dateValue.getTime() === dateCompare.getTime();
        case "!=":
        case "is not equal to":
          return dateValue.getTime() !== dateCompare.getTime();
        case ">":
        case "is after":
          return dateValue > dateCompare;
        case "<":
        case "is before":
          return dateValue < dateCompare;
        case ">=":
        case "is after or equal to":
          return dateValue >= dateCompare;
        case "<=":
        case "is before or equal to":
          return dateValue <= dateCompare;
        case "exists":
          return itemValue !== undefined && itemValue !== null;
        case "does not exist":
          return itemValue === undefined || itemValue === null;
        case "is empty":
          return itemValue === undefined || itemValue === null || itemValue === "";
        case "is not empty":
          return itemValue !== undefined && itemValue !== null && itemValue !== "";
        default:
          return false;
      }
    }

    // Array operators
    if (fieldType === "array") {
      const arrValue = Array.isArray(itemValue) ? itemValue : [];

      switch (condition.operator) {
        case "contains":
          return arrValue.includes(compareValue);
        case "does not contain":
          return !arrValue.includes(compareValue);
        case "length equal to":
          return arrValue.length === Number(compareValue);
        case "length not equal to":
          return arrValue.length !== Number(compareValue);
        case "length greater than":
          return arrValue.length > Number(compareValue);
        case "length less than":
          return arrValue.length < Number(compareValue);
        case "length greater than or equal to":
          return arrValue.length >= Number(compareValue);
        case "length less than or equal to":
          return arrValue.length <= Number(compareValue);
        case "is empty":
          return arrValue.length === 0;
        case "is not empty":
          return arrValue.length > 0;
        case "exists":
          return itemValue !== undefined && itemValue !== null;
        case "does not exist":
          return itemValue === undefined || itemValue === null;
        default:
          return false;
      }
    }

    // Object operators (fallback)
    switch (condition.operator) {
      case "exists":
        return itemValue !== undefined && itemValue !== null;
      case "does not exist":
        return itemValue === undefined || itemValue === null;
      case "is empty":
        return itemValue === undefined || itemValue === null || itemValue === "" || 
               (typeof itemValue === "object" && Object.keys(itemValue as any).length === 0);
      case "is not empty":
        return itemValue !== undefined && itemValue !== null && itemValue !== "" &&
               !(typeof itemValue === "object" && Object.keys(itemValue as any).length === 0);
      default:
        return false;
    }
  };

  // Filter items based on conditions with AND/OR logic
  const filtered: unknown[] = [];
  const removed: unknown[] = [];
  const typeWarnings: string[] = [];

  // Validate types before filtering (check first item)
  if (data.length > 0) {
    conditions.forEach((condition) => {
      const tokenMatch = condition.field.match(/\{\{steps\.[^.]+\.(.+?)\}\}/);
      const fieldPath = tokenMatch ? tokenMatch[1] : condition.field;
      const sampleValue = getFieldValue(data[0], fieldPath);
      const actualType = detectValueType(sampleValue);
      const expectedType = condition.fieldType;
      
      const universalOps = ["exists", "does not exist", "is empty", "is not empty"];
      if (!universalOps.includes(condition.operator)) {
        if (actualType !== "unknown" && actualType !== expectedType && expectedType !== "object") {
          typeWarnings.push(
            `Field "${fieldPath}": expected type "${expectedType}" but got "${actualType}"`
          );
        }
      }
    });
  }

  console.log("\n[Filter] ========== Starting to filter items ==========");
  console.log("[Filter] Total items to process:", data.length);
  console.log("[Filter] Conditions to apply:", conditions);
  
  data.forEach((item, itemIndex) => {
    console.log(`\n[Filter] ========== Item ${itemIndex} ==========`);
    console.log("[Filter] Item data:", JSON.stringify(item));
    
    // Check if conditions pass based on logic operator
    let conditionsPass: boolean;

    if (logic === "AND") {
      // AND logic: ALL conditions must pass
      conditionsPass = conditions.every((condition, condIndex) => {
        console.log(`\n[Filter AND] Evaluating condition ${condIndex + 1}/${conditions.length}`);
        const result = evaluateCondition(item, condition);
        console.log(`[Filter AND] Condition ${condIndex + 1} result: ${result}`);
        return result;
      });
    } else {
      // OR logic: AT LEAST ONE condition must pass
      conditionsPass = conditions.some((condition, condIndex) => {
        console.log(`\n[Filter OR] Evaluating condition ${condIndex + 1}/${conditions.length}`);
        const result = evaluateCondition(item, condition);
        console.log(`[Filter OR] Condition ${condIndex + 1} result: ${result}`);
        return result;
      });
    }
    
    console.log(`\n[Filter] Item ${itemIndex} FINAL: conditions pass = ${conditionsPass} (logic: ${logic})`);

    if (mode === "include") {
      // Include mode: keep items that match conditions
      if (conditionsPass) {
        filtered.push(item);
      } else {
        removed.push(item);
      }
    } else {
      // Exclude mode: remove items that match conditions
      if (conditionsPass) {
        removed.push(item);
      } else {
        filtered.push(item);
      }
    }
  });

  const result: Record<string, unknown> = {
    filtered,
    removed,
    summary: {
      total: data.length,
      filtered: filtered.length,
      removed: removed.length,
    },
  };

  // Add warnings if type mismatches found
  if (typeWarnings.length > 0) {
    (result.summary as any).warnings = typeWarnings;
  }

  return result;
}
