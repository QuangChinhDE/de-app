import type { NodeDefinition } from "../types";
import { IF_SCHEMA } from "./schema";
import { runIfNode } from "./runtime";

export const ifNode: NodeDefinition = {
  key: "if",
  schema: IF_SCHEMA,
  createInitialConfig: () => ({
    mode: "simple",
    leftValue: "",
    operator: "==",
    rightValue: "",
    logic: "AND",
    conditions: [],
  }),
  run: runIfNode,
};
