import type { FieldDef, NodeSchema } from "@node-playground/types";

export const FILTER_FIELDS: FieldDef[] = [
  {
    key: "conditions",
    label: "Filter Conditions",
    type: "array",
    help: "List of conditions. Each has: field (token), fieldType (string/number/etc), operator, value",
    group: "inputs",
  },
  {
    key: "logic",
    label: "Logic Operator",
    type: "enum",
    enum: ["AND", "OR"],
    default: "AND",
    help: "AND: all conditions must pass | OR: at least one condition must pass",
    group: "inputs",
  },
  {
    key: "mode",
    label: "Filter Mode",
    type: "enum",
    enum: ["include", "exclude"],
    default: "include",
    help: "Include: keep matching items | Exclude: remove matching items",
    group: "inputs",
  },
];

export const FILTER_SCHEMA: NodeSchema = {
  key: "filter",
  name: "Filter",
  type: "utility",
  inputs: FILTER_FIELDS,
  outputs: [
    { key: "filtered", type: "array", label: "Filtered Items" },
    { key: "removed", type: "array", label: "Removed Items" },
    { key: "summary", type: "object", label: "Summary Stats" },
  ],
};
