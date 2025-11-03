import type { NodeDefinition } from "../types";
import { LOOP_SCHEMA } from "./schema";
import { runLoopNode } from "./runtime";
import { LoopForm } from "./LoopForm";

export const loopNode: NodeDefinition = {
  key: "loop",
  schema: {
    ...LOOP_SCHEMA,
    formComponent: LoopForm,
  },
  createInitialConfig: () => ({
    items: "",
    batchSize: 1,
    pauseBetweenBatches: 0,
    continueOnError: false,
  }),
  run: runLoopNode,
};
