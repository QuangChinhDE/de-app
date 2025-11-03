import type { FieldDef, NodeSchema } from "@node-playground/types";

const SORT_FIELDS: FieldDef[] = [
  {
    key: "items",
    label: "Items to Sort",
    type: "string",
    widget: "textarea",
    placeholder: "{{steps.xxx}} - Must be an array",
    help: "Array to sort. Leave empty to use previous output.",
    group: "inputs",
  },
  {
    key: "field",
    label: "Sort By Field",
    type: "string",
    required: true,
    placeholder: "age",
    help: "Field name to sort by (e.g., 'age', 'price', 'date')",
    group: "inputs",
  },
  {
    key: "direction",
    label: "Sort Direction",
    type: "enum",
    enum: ["asc", "desc"],
    default: "asc",
    help: "asc: ascending (1→9, A→Z) | desc: descending (9→1, Z→A)",
    group: "inputs",
  },
  {
    key: "dataType",
    label: "Data Type",
    type: "enum",
    enum: ["auto", "number", "string", "date"],
    default: "auto",
    help: "How to interpret field values for sorting",
    group: "inputs",
  },
];

export const SORT_SCHEMA: NodeSchema = {
  key: "sort",
  name: "Sort",
  type: "utility",
  inputs: SORT_FIELDS,
  outputs: [
    { key: "items", type: "array" },
    { key: "count", type: "number" },
  ],
};
