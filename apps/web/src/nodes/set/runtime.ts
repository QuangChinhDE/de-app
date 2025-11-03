import type { NodeRuntimeArgs, NodeRuntimeResult } from "../types";
import type { FieldSet } from "./schema";

// Token resolution utilities
const TOKEN_REGEX = /\{\{\s*steps\.([\w-]+)([^}]*)\}\}/g;

function resolveTokenInContext(template: string, stepOutputs: Record<string, unknown>, currentItem?: unknown): unknown {
  const matches = Array.from(template.matchAll(TOKEN_REGEX));
  if (matches.length === 0) {
    return template;
  }

  const isPureToken = matches.length === 1 && matches[0][0].trim() === template.trim();

  let resolvedString = template;
  for (const match of matches) {
    const [fullMatch, stepKey, pathPart] = match;
    
    // If path starts with current item reference (like steps.manual1.id where manual1 output is array)
    // and we have currentItem, use currentItem as base
    const stepOutput = stepOutputs[`steps.${stepKey}`];
    
    let value: unknown;
    if (Array.isArray(stepOutput) && currentItem && typeof currentItem === "object") {
      // When iterating over array items, resolve field from current item context
      value = getPathValue(currentItem, pathPart);
    } else {
      // Normal resolution from step output
      value = getPathValue(stepOutput, pathPart);
    }
    
    const normalized = typeof value === "undefined" ? "" : value;

    if (isPureToken) {
      return normalized;
    }

    resolvedString = resolvedString.replace(fullMatch, String(normalized));
  }

  return resolvedString;
}

function getPathValue(target: unknown, pathPart: string): unknown {
  if (!pathPart) {
    return target;
  }

  const trimmed = pathPart.replace(/^\./, "");
  const segments = trimmed
    .split(/\.|\[(\d+)\]/)
    .filter(Boolean)
    .map((seg) => seg.replace(/^['"]|['"]$/g, ""));

  let cursor: unknown = target;
  for (const segment of segments) {
    if (cursor === null || typeof cursor !== "object") {
      return undefined;
    }
    
    const index = Number(segment);
    if (!Number.isNaN(index) && Array.isArray(cursor)) {
      cursor = cursor[index];
    } else {
      cursor = (cursor as Record<string, unknown>)[segment];
    }
  }

  return cursor;
}

export async function runSetNode(args: NodeRuntimeArgs): Promise<NodeRuntimeResult> {
  const includeOtherFields = Boolean(args.config.includeOtherFields ?? true);
  const rawFields = (args.config.fields as FieldSet[]) ?? [];
  const previousData = args.resolvedConfig.__previousOutput || null;

  // Build step outputs context for token resolution
  const stepOutputs = args.resolvedConfig.__stepOutputs as Record<string, unknown> || {};

  // If previous data is array, process each item with its own context
  if (Array.isArray(previousData)) {
    const transformed = previousData.map((item, index) => {

      return setFieldsOnItem(item, rawFields, includeOtherFields, stepOutputs);
    });

    return { output: transformed };
  }

  // If previous data is object, process it
  if (previousData && typeof previousData === "object") {
    const transformed = setFieldsOnItem(previousData, rawFields, includeOtherFields, stepOutputs);

    return { output: transformed };
  }

  // No previous data, create new object with set fields
  const newObject = setFieldsOnItem({}, rawFields, includeOtherFields, stepOutputs);

  return { output: newObject };
}

function setFieldsOnItem(
  item: unknown,
  fields: FieldSet[],
  includeOtherFields: boolean,
  stepOutputs: Record<string, unknown>
): Record<string, unknown> {
  // Start with existing data (if includeOtherFields=true) or empty object
  const result: Record<string, unknown> = includeOtherFields
    ? (item && typeof item === "object" ? { ...(item as Record<string, unknown>) } : {})
    : {};

  // Set each field with type conversion
  fields.forEach((field) => {
    if (!field.key) {
      console.warn("[SET] Skipping field with no key:", field);
      return;
    }

    // Resolve tokens in the context of current item
    // This allows {{steps.manual1.id}} to resolve to different values for each array item
    let value: unknown = field.value;
    if (typeof field.value === "string") {
      value = resolveTokenInContext(field.value, stepOutputs, item);
    }
    
    // Convert to specified type if provided
    if (field.type) {
      value = convertToType(value, field.type);

    }
    
    result[field.key] = value;

  });

  return result;
}

function convertToType(value: unknown, targetType: string): unknown {
  if (value === null || value === undefined) {
    return null;
  }

  switch (targetType.toLowerCase()) {
    case "string":
      // Always convert to string, even if it's already a number/boolean/etc
      if (value === "") return "";
      return String(value);
    
    case "number":
      // If already a number, return as is
      if (typeof value === "number") return value;
      const strValue = String(value);
      if (strValue === "") return null;
      const num = Number(strValue);
      return isNaN(num) ? 0 : num;
    
    case "boolean":
      // If already boolean, return as is
      if (typeof value === "boolean") return value;
      const strValue2 = String(value).toLowerCase();
      return strValue2 === "true" || strValue2 === "1" || strValue2 === "yes";
    
    case "array":
      // If already array, return as is
      if (Array.isArray(value)) return value;
      // Try to parse JSON array
      const strValue3 = String(value);
      try {
        const parsed = JSON.parse(strValue3);
        return Array.isArray(parsed) ? parsed : [value];
      } catch {
        return [value];
      }
    
    case "object":
      // If already object (and not array), return as is
      if (value && typeof value === "object" && !Array.isArray(value)) return value;
      // Try to parse JSON object
      const strValue4 = String(value);
      try {
        const parsed = JSON.parse(strValue4);
        return typeof parsed === "object" && !Array.isArray(parsed) ? parsed : { value };
      } catch {
        return { value };
      }
    
    default:
      return value;
  }
}
