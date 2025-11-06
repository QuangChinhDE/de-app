import type { NodeRuntimeArgs, NodeRuntimeResult } from "../types";
import { extractFieldPath, getFieldValue } from "../utils";

export async function runSwitchNode(args: NodeRuntimeArgs): Promise<NodeRuntimeResult> {
  const mode = String(args.resolvedConfig.mode ?? "single");
  const value = args.resolvedConfig.value;
  const cases = args.resolvedConfig.cases as unknown[];
  const defaultCase = String(args.resolvedConfig.defaultCase ?? "default");
  
  // Use original token before resolution for field path extraction
  const filterPathOriginal = String(args.config.filterPath ?? "");

  if (!Array.isArray(cases) || cases.length === 0) {
    throw new Error("Switch node requires at least one case");
  }

  // Convert cases to strings for comparison
  const caseStrings = cases.map((c) => String(c ?? ""));

  if (mode === "filter") {
    // Filter mode: split array by field value
    return runFilterMode(value, caseStrings, filterPathOriginal, defaultCase);
  } else {
    // Single mode: match one value
    return runSingleMode(value, caseStrings, defaultCase);
  }
}

function runSingleMode(
  value: unknown,
  caseStrings: string[],
  defaultCase: string
): NodeRuntimeResult {
  const valueStr = String(value ?? "");
  
  // Find matching case
  const matchedIndex = caseStrings.findIndex((c) => c === valueStr);
  const matchedCase = matchedIndex >= 0 ? caseStrings[matchedIndex] : null;

  // Build multiple outputs - one for each case + default
  const outputs: Array<{ label: string; data: unknown }> = [];

  // Add all case outputs
  caseStrings.forEach((caseValue, index) => {
    const caseKey = `case_${index}`;
    const data = caseValue === matchedCase ? { value: valueStr, matchedCase: caseValue } : null;
    outputs.push({ label: caseKey, data });
  });

  // Add default output
  const defaultData = matchedCase === null ? { value: valueStr, matchedCase: defaultCase } : null;
  outputs.push({ label: 'default', data: defaultData });

  return { outputs };
}

function runFilterMode(
  value: unknown,
  caseStrings: string[],
  filterPathToken: string,
  defaultCase: string
): NodeRuntimeResult {
  if (!Array.isArray(value)) {
    throw new Error("Filter mode requires an array input");
  }

  if (!filterPathToken) {
    throw new Error("Filter mode requires a filterPath (e.g., 'status', 'type')");
  }

  // Extract field path from token using shared utility
  const fieldPath = extractFieldPath(filterPathToken);

  // Build multiple outputs - one for each case + default
  const outputs: Array<{ label: string; data: unknown }> = [];

  // Initialize all case outputs as empty arrays
  const caseArrays: Record<string, unknown[]> = {};
  caseStrings.forEach((caseValue, index) => {
    const caseKey = `case_${index}`;
    caseArrays[caseKey] = [];
  });
  caseArrays.default = [];

  // Filter array items into corresponding cases
  value.forEach((item) => {
    if (item && typeof item === "object") {
      const itemValue = String(getFieldValue(item, fieldPath) ?? "");
      const matchedIndex = caseStrings.findIndex((c) => c === itemValue);

      if (matchedIndex >= 0) {
        const caseKey = `case_${matchedIndex}`;
        caseArrays[caseKey].push(item);
      } else {
        caseArrays.default.push(item);
      }
    }
  });

  // Convert to outputs array
  caseStrings.forEach((caseValue, index) => {
    const caseKey = `case_${index}`;
    outputs.push({ label: caseKey, data: caseArrays[caseKey] });
  });
  outputs.push({ label: 'default', data: caseArrays.default });

  return { outputs };
}
