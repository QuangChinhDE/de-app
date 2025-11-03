import type { NodeDefinition } from "../types";
import { SORT_SCHEMA } from "./schema";
import { runSortNode } from "./runtime";

export const sortNode: NodeDefinition = {
  key: "sort",
  schema: SORT_SCHEMA,
  createInitialConfig: () => ({
    items: "",
    field: "",
    direction: "asc",
    dataType: "auto",
  }),
  run: runSortNode,
};
