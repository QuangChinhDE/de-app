import type { NodeDefinition } from "../types";
import { WAIT_SCHEMA } from "./schema";
import { runWaitNode } from "./runtime";

export const waitNode: NodeDefinition = {
  key: "wait",
  schema: WAIT_SCHEMA,
  createInitialConfig: () => ({
    duration: 1,
    unit: "seconds",
  }),
  run: runWaitNode,
};
