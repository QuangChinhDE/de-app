import type { NodeDefinition } from "../types";
import { MERGE_SCHEMA } from "./schema";
import { runMergeNode } from "./runtime";

export const mergeNode: NodeDefinition = {
  key: "merge",
  schema: MERGE_SCHEMA,
  createInitialConfig: () => ({
    mode: "append",
    input1: "",
    input2: "",
    input3: "",
    input4: "",
    joinKey1: "id",
    joinKey2: "id",
    joinType: "inner",
    mergeStrategy: "last-wins",
    removeDuplicates: false,
    flattenJoined: true,
  }),
  run: runMergeNode,
};
