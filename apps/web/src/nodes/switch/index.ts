import type { NodeDefinition } from "../types";
import { SWITCH_SCHEMA } from "./schema";
import { runSwitchNode } from "./runtime";

export const switchNode: NodeDefinition = {
  key: "switch",
  schema: SWITCH_SCHEMA,
  createInitialConfig: () => ({
    mode: "filter",
    value: "",
    filterPath: "status",
    cases: ["active", "inactive", "pending"],
    defaultCase: "other",
  }),
  run: runSwitchNode,
};
