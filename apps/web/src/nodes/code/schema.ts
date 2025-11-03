import type { FieldDef, NodeSchema } from "@node-playground/types";

const CODE_FIELDS: FieldDef[] = [
  {
    key: "code",
    label: "JavaScript Code",
    type: "string",
    widget: "code",
    required: true,
    placeholder: "// Access input via 'input' variable\n// Return result\nreturn input.map(item => item.name);",
    help: "Write JavaScript code. Access input data via 'input' variable. Must return a value.",
    group: "inputs",
  },
  {
    key: "inputData",
    label: "Input Data (Optional)",
    type: "string",
    widget: "textarea",
    placeholder: "{{steps.xxx}} or leave empty to use previous output",
    help: "Data to pass to code. Available as 'input' variable. Auto-uses previous output if empty.",
    group: "inputs",
  },
];

export const CODE_SCHEMA: NodeSchema = {
  key: "code",
  name: "Code",
  type: "utility",
  inputs: CODE_FIELDS,
  outputs: [
    { key: "result", type: "object" },
  ],
};
