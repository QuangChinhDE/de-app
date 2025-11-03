import type { NodeDefinition } from "../types";
import { SWITCH_SCHEMA } from "./schema";
import { runSwitchNode } from "./runtime";
import { SwitchForm } from "./SwitchForm";

export const switchNode: NodeDefinition = {
  key: "switch",
  schema: {
    ...SWITCH_SCHEMA,
    formComponent: SwitchForm,
  },
  createInitialConfig: () => ({
    mode: "filter",
    value: "",
    filterPath: "status",
    cases: [""],
    defaultCase: "other",
  }),
  run: runSwitchNode,
};
