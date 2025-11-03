import type { FieldDef, NodeSchema } from "@node-playground/types";

const AGGREGATE_FIELDS: FieldDef[] = [
  {
    key: "items",
    label: "Items to Aggregate",
    type: "string",
    widget: "textarea",
    placeholder: "{{steps.xxx}} - Must be an array",
    help: "Array to aggregate. Leave empty to use previous output.",
    group: "inputs",
  },
  {
    key: "operation",
    label: "Operation",
    type: "enum",
    enum: ["sum", "count", "avg", "min", "max", "groupBy"],
    required: true,
    default: "sum",
    help: "Aggregation operation to perform",
    group: "inputs",
  },
  {
    key: "field",
    label: "Field to Aggregate",
    type: "string",
    placeholder: "amount",
    help: "Field name for sum/avg/min/max (e.g., 'price', 'quantity')",
    group: "inputs",
  },
  {
    key: "groupByField",
    label: "Group By Field",
    type: "string",
    placeholder: "category",
    help: "Field to group by (only for groupBy operation)",
    group: "inputs",
  },
  {
    key: "groupOperation",
    label: "Group Operation",
    type: "enum",
    enum: ["sum", "count", "avg", "min", "max"],
    default: "count",
    help: "Operation to perform on each group",
    group: "inputs",
  },
  {
    key: "groupOperationField",
    label: "Group Operation Field",
    type: "string",
    placeholder: "amount",
    help: "Field for group operation (for sum/avg/min/max per group)",
    group: "inputs",
  },
];

export const AGGREGATE_SCHEMA: NodeSchema = {
  key: "aggregate",
  name: "Aggregate",
  type: "utility",
  inputs: AGGREGATE_FIELDS,
  outputs: [
    { key: "result", type: "number" },
    { key: "groups", type: "array" },
    { key: "count", type: "number" },
  ],
};
