import type { NodeDefinition } from "../types";
import { WAIT_SCHEMA } from "./schema";
import { runWaitNode } from "./runtime";
import { WaitForm } from "./WaitForm";

export const waitNode: NodeDefinition = {
  key: "wait",
  schema: {
    ...WAIT_SCHEMA,
    formComponent: WaitForm,
  },
  createInitialConfig: () => ({
    duration: 1,
    unit: "seconds",
  }),
  run: runWaitNode,
};
