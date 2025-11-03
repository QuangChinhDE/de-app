import type { FieldDef, NodeSchema } from "@node-playground/types";

// IF node now uses same config style as FILTER node
// Filters array into TRUE (pass) and FALSE (fail) branches
export const IF_FIELDS: FieldDef[] = [
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
];

export const IF_SCHEMA: NodeSchema = {
  key: "if",
  name: "IF",
  type: "utility",
  inputs: IF_FIELDS,
  outputs: [
    { key: "TRUE", type: "array", label: "Items that pass conditions" },
    { key: "FALSE", type: "array", label: "Items that fail conditions" },
  ],
};
