import type { NodeDefinition } from "../types";
import { FILTER_SCHEMA } from "./schema";
import { runFilterNode } from "./runtime";
import { FilterForm } from "./FilterForm";

export const filterNode: NodeDefinition = {
  key: "filter",
  schema: {
    ...FILTER_SCHEMA,
    formComponent: FilterForm,
  },
  createInitialConfig: () => ({
    conditions: [
      {
        field: "",
        fieldType: "",
        operator: "",
        value: "",
      },
    ],
    logic: "AND",
    mode: "include",
  }),
  run: runFilterNode,
};
