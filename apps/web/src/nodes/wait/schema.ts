import type { FieldDef, NodeSchema } from "@node-playground/types";

const WAIT_FIELDS: FieldDef[] = [
  {
    key: "duration",
    label: "Duration",
    type: "number",
    required: true,
    default: 1,
    min: 0,
    placeholder: "1",
    help: "How long to wait (e.g., 5 for 5 seconds)",
    group: "inputs",
  },
  {
    key: "unit",
    label: "Time Unit",
    type: "enum",
    enum: ["ms", "seconds", "minutes", "hours"],
    default: "seconds",
    help: "Time unit for duration",
    group: "inputs",
  },
];

export const WAIT_SCHEMA: NodeSchema = {
  key: "wait",
  name: "Wait",
  type: "utility",
  inputs: WAIT_FIELDS,
  outputs: [
    { key: "waited", type: "boolean" },
    { key: "duration", type: "number" },
    { key: "startTime", type: "string" },
    { key: "endTime", type: "string" },
  ],
};
