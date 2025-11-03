import type { NodeDefinition } from "../types";
import { AGGREGATE_SCHEMA } from "./schema";
import { runAggregateNode } from "./runtime";

export const aggregateNode: NodeDefinition = {
  key: "aggregate",
  schema: AGGREGATE_SCHEMA,
  createInitialConfig: () => ({
    items: "",
    operation: "sum",
    field: "",
    groupByField: "",
    groupOperation: "count",
    groupOperationField: "",
  }),
  run: runAggregateNode,
};
