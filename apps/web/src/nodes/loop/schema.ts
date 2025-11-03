import type { FieldDef, NodeSchema } from "@node-playground/types";

const LOOP_FIELDS: FieldDef[] = [
  {
    key: "items",
    label: "Items to Loop Over",
    type: "string",
    widget: "textarea",
    required: true,
    placeholder: "{{steps.xxx}} - Must be an array",
    help: "Array to iterate over. Each item will be processed individually.",
    group: "inputs",
  },
  {
    key: "batchSize",
    label: "Batch Size",
    type: "number",
    default: 1,
    min: 1,
    max: 100,
    placeholder: "1",
    help: "Number of items to process in each batch (1 = one at a time)",
    group: "inputs",
  },
  {
    key: "pauseBetweenBatches",
    label: "Pause Between Batches (ms)",
    type: "number",
    default: 0,
    min: 0,
    placeholder: "0",
    help: "Delay in milliseconds between batches (useful for rate limiting)",
    group: "inputs",
  },
  {
    key: "continueOnError",
    label: "Continue on Error",
    type: "boolean",
    default: false,
    help: "If true, continue processing remaining items even if one fails",
    group: "inputs",
  },
];

export const LOOP_SCHEMA: NodeSchema = {
  key: "loop",
  name: "Loop Over Items",
  type: "utility",
  inputs: LOOP_FIELDS,
  outputs: [
    { key: "items", type: "array", label: "Processed Items" },
    { key: "successCount", type: "number", label: "Success Count" },
    { key: "errorCount", type: "number", label: "Error Count" },
    { key: "totalCount", type: "number", label: "Total Count" },
  ],
};
