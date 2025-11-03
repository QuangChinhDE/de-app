/**
 * Shared utility functions for node runtime processing
 */

/**
 * Extract field name/path from token or plain string
 * 
 * Examples:
 *   "name" → "name"
 *   "{{steps.manual1.name}}" → "name"
 *   "{{steps.manual1.user.email}}" → "user.email"
 *   "{{steps.manual1.data[0].id}}" → "data[0].id"
 *   "{{steps.http1.users}}" → "users"
 * 
 * @param value - Token string or plain field name
 * @returns Extracted field path after the node key
 */
export function extractFieldPath(value: string): string {
  // If already plain field name (no token), return as-is
  if (!value || !value.includes("{{")) {
    return value;
  }

  // Extract everything after steps.xxx. until the closing }}
  // Pattern: {{steps.<nodeKey>.<fieldPath>}}
  const match = value.match(/\{\{steps\.[^.]+\.(.+?)\}\}/);
  
  if (match && match[1]) {
    // Return the full field path (e.g., "user.email", "data[0].id")
    return match[1].trim();
  }

  // Fallback: return original value if pattern doesn't match
  return value;
}

/**
 * Extract only the top-level field name from token or plain string
 * Useful for operations that need the root field (like SPLIT node)
 * 
 * Examples:
 *   "name" → "name"
 *   "{{steps.manual1.name}}" → "name"
 *   "{{steps.manual1.user.email}}" → "user" (top-level field)
 *   "{{steps.manual1.data[0].id}}" → "data" (array field)
 * 
 * @param value - Token string or plain field name
 * @returns Top-level field name only
 */
export function extractFieldName(value: string): string {
  // First extract the full path
  const fullPath = extractFieldPath(value);
  
  // Then get only the first segment (before . or [)
  const match = fullPath.match(/^([^.\[]+)/);
  return match ? match[1] : fullPath;
}

/**
 * Get nested field value from object using dot notation path
 * Supports both dot notation and array index notation
 * 
 * Examples:
 *   getFieldValue({ user: { name: "John" } }, "user.name") → "John"
 *   getFieldValue({ items: [{ id: 1 }] }, "items[0].id") → 1
 * 
 * @param obj - Source object
 * @param path - Field path (e.g., "user.name", "items[0].id")
 * @returns Field value or undefined if not found
 */
export function getFieldValue(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== "object") return undefined;
  if (!path) return obj;

  // Split path by dots and array brackets
  const parts = path
    .split(/\.|\[(\d+)\]/)
    .filter(Boolean)
    .map((seg) => seg.replace(/^['"]|['"]$/g, ""));

  let current: any = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    
    // Handle array index
    const index = Number(part);
    if (!Number.isNaN(index) && Array.isArray(current)) {
      current = current[index];
    } else {
      current = current[part];
    }
  }

  return current;
}

/**
 * Smart unwrap data from previous node output
 * Handles common patterns:
 * - Plain array/object → pass through
 * - SWITCH node output → find first non-empty case
 * - IF node output → merge TRUE/FALSE branches
 * - Wrapped output → unwrap to actual data
 * 
 * @param data - Data from previous node
 * @param previousNodeType - Type of previous node (optional)
 * @returns Unwrapped data suitable for processing
 */
export function smartUnwrap(data: unknown, previousNodeType?: string): unknown {
  if (data == null) return null;
  
  // If not object, return as-is
  if (typeof data !== "object") return data;
  
  // If array, return as-is
  if (Array.isArray(data)) return data;
  
  const obj = data as Record<string, unknown>;
  
  // Handle SWITCH node output: {case_0: [...], case_1: [...], default: [...]}
  if (previousNodeType === "switch" || hasSwitchPattern(obj)) {
    return findFirstNonEmptyCase(obj);
  }
  
  // Handle IF node output: {TRUE: [...], FALSE: [...]}
  if (previousNodeType === "if" || hasIfPattern(obj)) {
    return mergeIfBranches(obj);
  }
  
  // Plain object - return as-is
  return data;
}

/**
 * Check if object has SWITCH pattern (case_0, case_1, etc.)
 */
function hasSwitchPattern(obj: Record<string, unknown>): boolean {
  return Object.keys(obj).some(key => key.startsWith("case_") || key === "default");
}

/**
 * Check if object has IF pattern (TRUE, FALSE keys)
 */
function hasIfPattern(obj: Record<string, unknown>): boolean {
  return "TRUE" in obj || "FALSE" in obj;
}

/**
 * Find first non-empty case from SWITCH output
 */
function findFirstNonEmptyCase(obj: Record<string, unknown>): unknown {
  // Try case_0, case_1, etc.
  for (let i = 0; i < 10; i++) {
    const caseKey = `case_${i}`;
    const caseData = obj[caseKey];
    
    if (caseData != null) {
      // If array and has items, return it
      if (Array.isArray(caseData) && caseData.length > 0) {
        return caseData;
      }
      // If non-empty value, return it
      if (caseData !== null && caseData !== undefined) {
        return caseData;
      }
    }
  }
  
  // Try default case
  if (obj.default != null) {
    return obj.default;
  }
  
  // Return entire object if nothing found
  return obj;
}

/**
 * Merge TRUE and FALSE branches from IF output
 */
function mergeIfBranches(obj: Record<string, unknown>): unknown {
  const trueData = obj.TRUE;
  const falseData = obj.FALSE;
  
  // If both are arrays, concatenate
  if (Array.isArray(trueData) && Array.isArray(falseData)) {
    return [...trueData, ...falseData];
  }
  
  // If only one branch has data, return it
  if (trueData != null && (falseData == null || (Array.isArray(falseData) && falseData.length === 0))) {
    return trueData;
  }
  
  if (falseData != null && (trueData == null || (Array.isArray(trueData) && trueData.length === 0))) {
    return falseData;
  }
  
  // Return entire object if can't merge
  return obj;
}
