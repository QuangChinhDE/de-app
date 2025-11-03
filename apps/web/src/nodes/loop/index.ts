import type { NodeDefinition } from "../types";
import { LOOP_SCHEMA } from "./schema";
import { runLoopNode } from "./runtime";

export const loopNode: NodeDefinition = {
  key: "loop",
  schema: LOOP_SCHEMA,
  createInitialConfig: () => ({
    items: "",
    batchSize: 1,
    pauseBetweenBatches: 0,
    continueOnError: false,
  }),
  run: runLoopNode,
};
