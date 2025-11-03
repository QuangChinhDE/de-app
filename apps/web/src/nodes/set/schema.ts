import { z } from "zod";
import type { FieldDef } from "@node-playground/types";

// Simple field definition like n8n SET node
// Using "key", "value", "type" to match KeyValueEditor with type
export const FieldSetSchema = z.object({
  key: z.string(),
  value: z.string(), // Can be token like {{steps.manual1.name}} or static value
  type: z.string().optional(), // string, number, boolean, array, object
});

export type FieldSet = z.infer<typeof FieldSetSchema>;

export const SetNodeConfigSchema = z.object({
  includeOtherFields: z.boolean().default(true),
  fields: z.array(FieldSetSchema).default([]),
});

export type SetNodeConfig = z.infer<typeof SetNodeConfigSchema>;

export const SET_FIELDS: FieldDef[] = [
  {
    key: "fields",
    label: "Fields to Set",
    type: "array",
    widget: "keyValueWithType",
    default: [],
    help: "Set field values. Drag fields from DATA panel or use static values.",
  },
  {
    key: "includeOtherFields",
    label: "Include Other Input Fields",
    type: "boolean",
    default: true,
    help: "If enabled, keeps all fields from input and adds/updates the fields you set. If disabled, output will only contain the fields you set.",
  },
];
