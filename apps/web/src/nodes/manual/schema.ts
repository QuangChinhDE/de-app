import type { FieldDef, NodeSchema } from "@node-playground/types";

export const MANUAL_FIELDS: FieldDef[] = [
  {
    key: "mode",
    label: "Input Mode",
    type: "enum",
    enum: ["json", "form"],
    required: true,
    help: "JSON: Enter raw JSON | Form: Define fields with name, type, and value",
  },
  {
    key: "jsonPayload",
    label: "JSON Payload",
    type: "string",
    widget: "json-editor",
    required: false,
    placeholder: '{\n  "key": "value"\n}',
    help: "JSON mode: Enter test data in JSON format",
  },
  {
    key: "formFields",
    label: "Form Fields",
    type: "array",
    required: false,
    help: "Form mode: Define fields with name, type, and value",
  },
];

export const MANUAL_SCHEMA: NodeSchema = {
  key: "manual",
  name: "Manual Trigger",
  type: "trigger",
  inputs: MANUAL_FIELDS,
  outputs: [],
};
