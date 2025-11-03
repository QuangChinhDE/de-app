import type { FieldDef, NodeSchema } from "@node-playground/types";

export const SWITCH_FIELDS: FieldDef[] = [
  {
    key: "mode",
    label: "Mode",
    type: "enum",
    enum: ["single", "filter"],
    required: true,
    help: "Single: match one value | Filter: split array by field value",
  },
  {
    key: "value",
    label: "Value / Array",
    type: "string",
    required: true,
    placeholder: "{{steps.setVariable1}} or {{steps.http1.status}}",
    help: "Single mode: value to match | Filter mode: array to split",
  },
  {
    key: "filterPath",
    label: "Filter Path",
    type: "string",
    required: false,
    placeholder: "status",
    help: "Filter mode only: object property to check (e.g., 'status', 'type')",
  },
  {
    key: "cases",
    label: "Cases",
    type: "array",
    required: true,
    help: "List of case values. Each case will create an output handle.",
  },
  {
    key: "defaultCase",
    label: "Default Case",
    type: "string",
    required: false,
    placeholder: "default",
    help: "Label for the default case when no match is found",
  },
];

export const SWITCH_SCHEMA: NodeSchema = {
  key: "switch",
  name: "Switch",
  type: "utility",
  inputs: SWITCH_FIELDS,
  outputs: [], // Will be dynamic based on cases
};
