import type { NodeDefinition } from "../types";
import { LIMIT_SCHEMA } from "./schema";
import { runLimitNode } from "./runtime";
import { LimitForm } from "./LimitForm";

export const limitNode: NodeDefinition = {
  key: "limit",
  schema: {
    ...LIMIT_SCHEMA,
    formComponent: LimitForm,
  },
  createInitialConfig: () => ({
    items: "",
    skip: 0,
    limit: 10,
  }),
  run: runLimitNode,
};
