import type { NodeRuntimeArgs, NodeRuntimeResult } from "../types";
import { extractFieldPath, getFieldValue, smartUnwrap } from "../utils";

interface FilterCondition {
  field: string;
  fieldType: string;
  operator: string;
  value: string;
}

/**
 * IF Node - Filters array into TRUE/FALSE branches
 * Same logic as FILTER node but outputs both pass and fail items
 */
export async function runIfNode(args: NodeRuntimeArgs): Promise<NodeRuntimeResult> {
  console.log("[IF Runtime] Starting execution");
  
  // Get conditions array (same as FILTER)
  const conditions = (args.resolvedConfig.conditions as FilterCondition[]) ?? [];
  const logic = String(args.resolvedConfig.logic ?? "AND");
  
  console.log("[IF Runtime] Conditions:", conditions);
  console.log("[IF Runtime] Logic:", logic);
  
  // Get previous data and smart unwrap
  let previousData: unknown = args.resolvedConfig.__previousOutput || {};
  previousData = smartUnwrap(previousData, args.previousNodeType);
  console.log("[IF Runtime] Previous data (after unwrap):", previousData);

  // Use raw config conditions to preserve tokens
  const rawConditions = (args.config.conditions as FilterCondition[]) ?? [];

  if (!Array.isArray(rawConditions) || rawConditions.length === 0) {
    throw new Error("IF node requires at least one condition");
  }

  // If previous data is not an array, try to find an array field
  let arrayToFilter: unknown[] = [];
  
  if (Array.isArray(previousData)) {
    arrayToFilter = previousData;
    console.log("[IF Runtime] Using previous data as array, length:", arrayToFilter.length);
  } else if (previousData && typeof previousData === "object") {
    // Search for first array field
    const values = Object.values(previousData);
    const firstArray = values.find((v) => Array.isArray(v));
    if (firstArray) {
      arrayToFilter = firstArray as unknown[];
      console.log("[IF Runtime] Found array field, length:", arrayToFilter.length);
    }
  }

  if (arrayToFilter.length === 0) {
    console.warn("[IF Runtime] No data to filter");
    return {
      output: {
        TRUE: [],
        FALSE: [],
      },
    };
  }

  // Filter array based on conditions
  const result = filterArray(arrayToFilter, rawConditions, logic);

  console.log("[IF Runtime] TRUE count:", (result.TRUE as any[]).length);
  console.log("[IF Runtime] FALSE count:", (result.FALSE as any[]).length);

  return { output: result };
}

// Copy of FILTER logic but adapted for IF output format
function filterArray(
  data: unknown[],
  conditions: FilterCondition[],
  logic: string
): Record<string, unknown> {

  // Helper to detect actual type of value
  const detectValueType = (value: unknown): string => {
    if (value === null || value === undefined) return "unknown";
    if (Array.isArray(value)) return "array";
    if (typeof value === "boolean") return "boolean";
    if (typeof value === "number") return "number";
    if (typeof value === "string") {
      const dateTest = new Date(value);
      if (!isNaN(dateTest.getTime()) && value.match(/\d{4}-\d{2}-\d{2}/)) {
        return "date";
      }
      return "string";
    }
    if (typeof value === "object") return "object";
    return "string";
  };

  // Helper to convert value by type
  const convertValueByType = (value: string, targetType: string): any => {
    if (!value) return value;
    
    switch (targetType) {
      case "number":
        const num = Number(value);
        return isNaN(num) ? 0 : num;
      case "boolean":
        const lower = String(value).toLowerCase();
        return lower === "true" || lower === "1";
      case "date":
        const date = new Date(value);
        return isNaN(date.getTime()) ? new Date() : date;
      default:
        return String(value);
    }
  };

  // Evaluate single condition
  const evaluateCondition = (item: unknown, condition: FilterCondition): boolean => {
    const fieldPath = extractFieldPath(condition.field);
    const itemValue = getFieldValue(item, fieldPath);
    const rawCompareValue = condition.value;
    const fieldType = condition.fieldType || "string";
    const compareValue = convertValueByType(rawCompareValue, fieldType);
    
    // Auto-detect actual type
    const actualType = detectValueType(itemValue);
    const effectiveFieldType = (actualType !== "unknown" && actualType !== "object") ? actualType : fieldType;

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
        case "endsWith":
        case "ends with":
          return strValue.endsWith(strCompare);
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
        default:
          return false;
      }
    }

    // Number operators
    if (effectiveFieldType === "number") {
      const numValue = Number(itemValue);
      const numCompare = Number(compareValue);
      switch (condition.operator) {
        case "==":
        case "is equal to":
          return numValue === numCompare;
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
        default:
          return false;
      }
    }

    // Boolean operators
    if (effectiveFieldType === "boolean") {
      const boolValue = Boolean(itemValue);
      switch (condition.operator) {
        case "is true":
          return boolValue === true;
        case "is false":
          return boolValue === false;
        default:
          return false;
      }
    }

    // Fallback
    return false;
  };

  // Filter items
  const trueItems: unknown[] = [];
  const falseItems: unknown[] = [];

  data.forEach((item) => {
    let conditionsPass: boolean;

    if (logic === "AND") {
      conditionsPass = conditions.every((condition) => evaluateCondition(item, condition));
    } else {
      conditionsPass = conditions.some((condition) => evaluateCondition(item, condition));
    }

    if (conditionsPass) {
      trueItems.push(item);
    } else {
      falseItems.push(item);
    }
  });

  return {
    TRUE: trueItems,
    FALSE: falseItems,
  };
}

