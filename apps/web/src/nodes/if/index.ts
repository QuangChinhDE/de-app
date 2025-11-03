import type { NodeDefinition } from "../types";
import { IF_SCHEMA } from "./schema";
import { runIfNode } from "./runtime";
import { IfForm } from "./IfForm";

export const ifNode: NodeDefinition = {
  key: "if",
  schema: {
    ...IF_SCHEMA,
    formComponent: IfForm,
  },
  createInitialConfig: () => ({
    conditions: [{ field: "", fieldType: "", operator: "", value: "" }],
    logic: "AND",
  }),
  run: runIfNode,
};
