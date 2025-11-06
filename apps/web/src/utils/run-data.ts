import type { RunRecord, INodeExecutionData, INodeExecutionOutput } from "@node-playground/types";
import type { StepInstance, CustomEdge } from "../state/flow-store";

/**
 * Get which branch of a source node was used to provide data to a target node
 * Priority: Item lineage > Source tracking > Graph edges
 */
export function getBranchConnection(
  sourceNodeKey: string,
  targetNodeKey: string,
  targetRunRecord: RunRecord | undefined,
  sourceRunRecord: RunRecord | undefined,
  edges: CustomEdge[],
  steps: StepInstance[]
): {
  branch?: string; // "TRUE", "FALSE", "case_0", etc.
  outputIndex?: number; // 0, 1, 2, etc.
  isMixed: boolean; // Multiple branches used
  itemCount?: number; // Number of items from this branch
} {
  // Priority 1: Trace item lineage (most accurate - item-level tracking)
  if (targetRunRecord?.executionData && sourceRunRecord?.executionData) {
    const targetItems = targetRunRecord.executionData.output[0] || []; // Get items from target's main output
    
    const tracedBranches = traceBranchesFromItems(targetItems, sourceRunRecord);
    
    if (tracedBranches.size > 1) {
      return { isMixed: true, itemCount: targetItems.length };
    }
    
    if (tracedBranches.size === 1) {
      const branch = Array.from(tracedBranches)[0];
      const outputIndex = sourceRunRecord.executionData.outputLabels?.indexOf(branch) ?? 0;
      return { 
        branch, 
        outputIndex, 
        isMixed: false,
        itemCount: targetItems.length 
      };
    }
  }
  
  // Priority 1.5: Check graph edges directly (most reliable for UI)
  const directEdges = edges.filter(
    (e) => e.source === sourceNodeKey && e.target === targetNodeKey
  );
  
  if (directEdges.length > 0) {
    const uniqueHandles = new Set(
      directEdges
        .map((e) => e.sourceHandle)
        .filter((h): h is string => h !== undefined)
    );

    if (uniqueHandles.size > 1) {
      return { isMixed: true };
    }

    const firstEdge = directEdges[0];
    if (firstEdge.sourceHandle) {
      const sourceStep = steps.find((s) => s.key === sourceNodeKey);
      let branch = firstEdge.sourceHandle;
      let outputIndex: number | undefined;

      // Normalize based on node type
      if (sourceStep?.schemaKey === "if") {
        branch = branch.toUpperCase();
        outputIndex = branch === "TRUE" ? 0 : 1;
      } else if (sourceStep?.schemaKey === "switch") {
        if (branch.startsWith("case_")) {
          outputIndex = parseInt(branch.substring(5), 10);
        }
      }

      return { branch, outputIndex, isMixed: false };
    }
  }
  
  // Priority 2: Check run record source tracking (node-level)
  if (targetRunRecord?.source && targetRunRecord.source.length > 0) {
    const sourcesFromNode = targetRunRecord.source.filter(
      (s) => s.previousNode === sourceNodeKey
    );

    if (sourcesFromNode.length === 0) {
      return { isMixed: false };
    }

    // Check if multiple different outputs from same source
    const uniqueKeys = new Set(
      sourcesFromNode
        .map((s) => s.previousNodeOutputKey)
        .filter((k): k is string => k !== undefined)
    );

    if (uniqueKeys.size > 1) {
      return { isMixed: true };
    }

    // Single branch
    const firstSource = sourcesFromNode[0];
    return {
      branch: firstSource.previousNodeOutputKey,
      outputIndex: firstSource.previousNodeOutput,
      isMixed: false,
    };
  }

  // Priority 2: Fallback to graph edges (when no run data)
  const connectingEdges = edges.filter(
    (e) => e.source === sourceNodeKey && e.target === targetNodeKey
  );

  if (connectingEdges.length === 0) {
    return { isMixed: false };
  }

  // Check for multiple different source handles
  const uniqueHandles = new Set(
    connectingEdges
      .map((e) => e.sourceHandle)
      .filter((h): h is string => h !== undefined)
  );

  if (uniqueHandles.size > 1) {
    return { isMixed: true };
  }

  // Single edge connection
  const firstEdge = connectingEdges[0];
  if (firstEdge.sourceHandle) {
    const sourceStep = steps.find((s) => s.key === sourceNodeKey);
    let branch = firstEdge.sourceHandle;
    let outputIndex: number | undefined;

    // Normalize based on node type
    if (sourceStep?.schemaKey === "if") {
      branch = firstEdge.sourceHandle.toUpperCase();
      outputIndex = branch === "TRUE" ? 0 : 1;
    } else if (sourceStep?.schemaKey === "switch") {
      if (branch.startsWith("case_")) {
        outputIndex = parseInt(branch.substring(5), 10);
      }
    }

    return { branch, outputIndex, isMixed: false };
  }

  // No source handle (normal connection)
  return { outputIndex: 0, isMixed: false };
}

/**
 * Check if a node is a branching node (IF/SWITCH)
 */
export function isBranchingNode(step: StepInstance | undefined): boolean {
  return step?.schemaKey === "if" || step?.schemaKey === "switch";
}

/**
 * Get available branches from node output data
 */
export function getAvailableBranches(
  output: unknown
): { branches: string[]; isBranching: boolean } {
  if (!output || typeof output !== "object" || Array.isArray(output)) {
    return { branches: [], isBranching: false };
  }

  const keys = Object.keys(output);

  // IF node: TRUE/FALSE
  if (keys.includes("TRUE") || keys.includes("FALSE")) {
    return {
      branches: keys.filter((k) => k === "TRUE" || k === "FALSE").sort().reverse(),
      isBranching: true,
    };
  }

  // SWITCH node: case_0, case_1, default, etc
  if (keys.some((k) => k.startsWith("case_") || k === "default")) {
    return {
      branches: keys.sort(),
      isBranching: true,
    };
  }

  return { branches: [], isBranching: false };
}

/**
 * Convert raw output to execution data format with item lineage
 * For branching nodes (IF/SWITCH): output is {TRUE: [...], FALSE: [...]}
 * For normal nodes: output is [...] or {value: [...]}
 * @param inputData - Optional input executionData to preserve pairedItem chain
 * @param sourceOutputIndex - Which output branch (0=TRUE, 1=FALSE) the input came from
 */
export function convertToExecutionData(
  output: unknown,
  nodeType: string,
  inputData?: INodeExecutionOutput,
  sourceOutputIndex?: number
): INodeExecutionOutput {
  // Handle branching nodes (IF/SWITCH)
  if (nodeType === "if") {
    const outputObj = output as Record<string, unknown[]>;
    const trueItems = (outputObj.TRUE || []) as unknown[];
    const falseItems = (outputObj.FALSE || []) as unknown[];
    
    return {
      output: [
        // Output 0: TRUE branch - pairedItem.input should be 0 (output index)
        trueItems.map((item, idx) => ({
          json: typeof item === "object" && item !== null ? item as Record<string, unknown> : { value: item },
          pairedItem: { item: idx, input: 0 }, // input=0 means from output[0] (TRUE)
        })),
        // Output 1: FALSE branch - pairedItem.input should be 1 (output index)
        falseItems.map((item, idx) => ({
          json: typeof item === "object" && item !== null ? item as Record<string, unknown> : { value: item },
          pairedItem: { item: idx, input: 1 }, // input=1 means from output[1] (FALSE)
        })),
      ],
      outputLabels: ["TRUE", "FALSE"],
    };
  }
  
  if (nodeType === "switch") {
    const outputObj = output as Record<string, unknown[]>;
    const keys = Object.keys(outputObj).sort();
    
    return {
      output: keys.map((key, keyIndex) => {
        const items = (outputObj[key] || []) as unknown[];
        return items.map((item, idx) => ({
          json: typeof item === "object" && item !== null ? item as Record<string, unknown> : { value: item },
          pairedItem: { item: idx, input: keyIndex }, // input = output array index
        }));
      }),
      outputLabels: keys,
    };
  }
  
  // Handle normal nodes
  let items: unknown[] = [];
  
  if (Array.isArray(output)) {
    items = output;
  } else if (output && typeof output === "object") {
    // Try to extract array from common patterns
    const obj = output as Record<string, unknown>;
    if (obj.value && Array.isArray(obj.value)) {
      items = obj.value;
    } else if (obj.items && Array.isArray(obj.items)) {
      items = obj.items;
    } else {
      // Treat whole object as single item
      items = [output];
    }
  } else {
    // Primitive value
    items = [output];
  }
  
  // Preserve pairedItem from input if available (for nodes like SET that transform data)
  // This maintains the lineage chain: IF[TRUE] -> SET -> next node
  // Use sourceOutputIndex to get correct branch items (0=TRUE, 1=FALSE, etc.)
  const outputIdx = sourceOutputIndex ?? 0;
  const inputItems = inputData?.output[outputIdx];
  
  return {
    output: [
      items.map((item, idx) => {
        // If we have input data with pairedItem, preserve it
        const sourcePairedItem = inputItems?.[idx]?.pairedItem;
        
        return {
          json: typeof item === "object" && item !== null ? item as Record<string, unknown> : { value: item },
          pairedItem: sourcePairedItem || { item: idx, input: 0 },
        };
      }),
    ],
  };
}

/**
 * Get items from a specific output branch with lineage preserved
 */
export function getItemsFromBranch(
  executionData: INodeExecutionOutput | undefined,
  branchIndex: number
): INodeExecutionData[] {
  if (!executionData || !executionData.output[branchIndex]) {
    return [];
  }
  return executionData.output[branchIndex];
}

/**
 * Trace which branch(es) items came from by analyzing pairedItem lineage
 * Note: This relies on runtime to properly set pairedItem.input to indicate which OUTPUT the item came from
 * For branching nodes: input should be the output index (0=TRUE, 1=FALSE for IF)
 */
export function traceBranchesFromItems(
  items: INodeExecutionData[],
  sourceNode: RunRecord | undefined
): Set<string> {
  const branches = new Set<string>();
  
  if (!sourceNode?.executionData) {
    return branches;
  }
  
  for (const item of items) {
    if (!item.pairedItem) {
      continue;
    }
    
    const paired = Array.isArray(item.pairedItem) ? item.pairedItem : [item.pairedItem];
    
    for (const pair of paired) {
      // For branching nodes, pair.input should indicate which OUTPUT index (branch) the item came from
      // For IF: input=0 means TRUE branch, input=1 means FALSE branch
      const outputIdx = pair.input ?? 0;
      
      if (outputIdx < sourceNode.executionData.output.length) {
        const branchLabel = sourceNode.executionData.outputLabels?.[outputIdx];
        if (branchLabel) {
          branches.add(branchLabel);
        }
      }
    }
  }
  
  return branches;
}
