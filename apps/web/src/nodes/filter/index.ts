import type { NodeDefinition } from "../types";
import { FILTER_SCHEMA } from "./schema";
import { runFilterNode } from "./runtime";

export const filterNode: NodeDefinition = {
  key: "filter",
  schema: FILTER_SCHEMA,
  createInitialConfig: () => ({
    conditions: [
      {
        field: "",
        fieldType: "string",
        operator: "is equal to",
        value: "",
      },
    ],
    logic: "AND",
    mode: "include",
  }),
  run: runFilterNode,
};
