import { z } from "zod";
import type { NodeSchema } from "@node-playground/types";

// Config schema for SPLIT node - Simple array splitter (like n8n)
export const SplitNodeConfigSchema = z.object({
  mode: z.enum(["auto", "field"]).default("auto"),
  fieldPath: z.string().optional(),
});

export type SplitNodeConfig = z.infer<typeof SplitNodeConfigSchema>;

// Schema fields definition
export const SPLIT_FIELDS: NodeSchema["inputs"] = [
  {
    key: "mode",
    type: "enum",
    label: "Mode",
    enum: ["auto", "field"],
    default: "auto",
    help: "auto: Auto-detect array | field: Specify field path",
    group: "inputs",
  },
  {
    key: "fieldPath",
    type: "string",
    label: "Field Path (for 'field' mode)",
    placeholder: "e.g., items or {{steps.http.data.items}}",
    help: "Drag token from Result Panel or type field name",
    group: "inputs",
  },
];

export const SPLIT_SCHEMA: NodeSchema = {
  key: "split",
  name: "Split Out",
  type: "utility",
  inputs: SPLIT_FIELDS,
  outputs: [
    {
      key: "items",
      type: "array",
    },
  ],
};
