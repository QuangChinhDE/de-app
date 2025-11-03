import type { FieldDef, NodeSchema } from "@node-playground/types";

const LIMIT_FIELDS: FieldDef[] = [
  {
    key: "items",
    label: "Items to Limit",
    type: "string",
    widget: "textarea",
    placeholder: "{{steps.xxx}} - Must be an array",
    help: "Array to limit/slice. Leave empty to use previous output.",
    group: "inputs",
  },
  {
    key: "skip",
    label: "Skip (Offset)",
    type: "number",
    default: 0,
    min: 0,
    placeholder: "0",
    help: "Number of items to skip from beginning (0 = start from first item)",
    group: "inputs",
  },
  {
    key: "limit",
    label: "Limit (Take)",
    type: "number",
    default: 10,
    min: 1,
    placeholder: "10",
    help: "Maximum number of items to return",
    group: "inputs",
  },
];

export const LIMIT_SCHEMA: NodeSchema = {
  key: "limit",
  name: "Limit",
  type: "utility",
  inputs: LIMIT_FIELDS,
  outputs: [
    { key: "items", type: "array" },
    { key: "count", type: "number" },
    { key: "totalCount", type: "number" },
    { key: "hasMore", type: "boolean" },
  ],
};
