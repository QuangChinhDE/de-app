import type { NodeDefinition, NodeDefinitionKey } from "./types";
import { manualNode } from "./manual";
import { httpNode } from "./http";
import { ifNode } from "./if";
import { filterNode } from "./filter";
import { switchNode } from "./switch";
import { setNode } from "./set";
import { splitNode } from "./split";
import { mergeNode } from "./merge";
import { loopNode } from "./loop";
import { waitNode } from "./wait";
import { aggregateNode } from "./aggregate";
import { codeNode } from "./code";
import { sortNode } from "./sort";
import { limitNode } from "./limit";

const nodeDefinitionsArray: NodeDefinition[] = [
  manualNode,
  httpNode,
  ifNode,
  filterNode,
  switchNode,
  setNode,
  splitNode,
  mergeNode,
  loopNode,
  waitNode,
  aggregateNode,
  codeNode,
  sortNode,
  limitNode,
];

export const nodeDefinitions = nodeDefinitionsArray.reduce<Record<NodeDefinitionKey, NodeDefinition>>(
  (acc, node) => {
    acc[node.key] = node;
    return acc;
  },
  {} as Record<NodeDefinitionKey, NodeDefinition>
);

export const nodeSchemas = nodeDefinitionsArray.map((node) => node.schema);

// Re-export types
export type { NodeDefinition, NodeDefinitionKey, NodeRuntimeArgs, NodeRuntimeResult } from "./types";
