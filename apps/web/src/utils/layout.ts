import dagre from "dagre";
import { Node, Edge, Position } from "@xyflow/react";

const nodeWidth = 220;
const nodeHeight = 120;

/**
 * Enhanced layout algorithm with branch detection
 * Handles IF/SWITCH nodes with multiple outputs intelligently
 */
export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: "TB" | "LR" = "TB"
): { nodes: Node[]; edges: Edge[] } {
  const isHorizontal = direction === "LR";
  
  // Detect branching nodes (IF, SWITCH)
  const branchingNodes = detectBranchingNodes(nodes, edges);
  
  // Build adjacency map for children
  const childrenMap = new Map<string, string[]>();
  edges.forEach((edge) => {
    if (!childrenMap.has(edge.source)) {
      childrenMap.set(edge.source, []);
    }
    childrenMap.get(edge.source)!.push(edge.target);
  });
  
  // Use dagre with enhanced settings
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // Adjust spacing based on direction
  const nodesep = direction === "TB" ? 80 : 120;  // More space between siblings
  const ranksep = direction === "TB" ? 150 : 200; // More space between levels
  
  dagreGraph.setGraph({ 
    rankdir: direction, 
    nodesep, 
    ranksep,
    // Better alignment for branches
    align: direction === "TB" ? "UL" : "UR",
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  // Apply dagre layout first
  let layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: (isHorizontal ? Position.Left : Position.Top) as Position,
      sourcePosition: (isHorizontal ? Position.Right : Position.Bottom) as Position,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  // Post-process: Adjust branching node children to be horizontal
  layoutedNodes = adjustBranchLayout(layoutedNodes, branchingNodes, childrenMap, direction, edges);

  return { nodes: layoutedNodes, edges };
}

/**
 * Detect nodes that create branches (IF, SWITCH)
 */
function detectBranchingNodes(nodes: Node[], edges: Edge[]): Set<string> {
  const branchingNodes = new Set<string>();
  
  // Count children per node
  const childCount = new Map<string, number>();
  edges.forEach((edge) => {
    childCount.set(edge.source, (childCount.get(edge.source) || 0) + 1);
  });
  
  // Nodes with 2+ children are branching nodes
  nodes.forEach((node) => {
    const count = childCount.get(node.id) || 0;
    if (count >= 2) {
      branchingNodes.add(node.id);
    }
  });
  
  return branchingNodes;
}

/**
 * Adjust layout for branching nodes - arrange children horizontally
 */
function adjustBranchLayout(
  nodes: Array<Node & { targetPosition: Position; sourcePosition: Position }>,
  branchingNodes: Set<string>,
  childrenMap: Map<string, string[]>,
  direction: "TB" | "LR",
  edges?: Edge[]
): Array<Node & { targetPosition: Position; sourcePosition: Position }> {
  if (branchingNodes.size === 0) return nodes;
  
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const adjustedNodes = [...nodes];
  
  // For each branching node, arrange its children horizontally
  branchingNodes.forEach((parentId) => {
    const children = childrenMap.get(parentId) || [];
    if (children.length < 2) return;
    
    const parent = nodeMap.get(parentId);
    if (!parent) return;
    
    // Get children node IDs that exist in adjusted nodes
    let childNodeIds = children.filter((childId) => nodeMap.has(childId));
    
    if (childNodeIds.length < 2) return;
    
    // Sort children by sourceHandle to maintain TRUE/FALSE order
    if (edges) {
      childNodeIds = childNodeIds.sort((a, b) => {
        const edgeA = edges.find(e => e.source === parentId && e.target === a);
        const edgeB = edges.find(e => e.source === parentId && e.target === b);
        
        const handleA = edgeA?.sourceHandle || '';
        const handleB = edgeB?.sourceHandle || '';
        
        // TRUE should come before FALSE
        if (handleA === 'TRUE' && handleB === 'FALSE') return -1;
        if (handleA === 'FALSE' && handleB === 'TRUE') return 1;
        
        // For SWITCH cases, sort by case number
        const matchA = handleA.match(/case_(\d+)/);
        const matchB = handleB.match(/case_(\d+)/);
        if (matchA && matchB) {
          return parseInt(matchA[1]) - parseInt(matchB[1]);
        }
        
        // Default: alphabetical
        return handleA.localeCompare(handleB);
      });
    }
    
    // Calculate positions for horizontal arrangement
    if (direction === "TB") {
      // Vertical layout: arrange children horizontally below parent
      const parentY = parent.position.y;
      const childY = parentY + nodeHeight + 150; // Fixed Y position below parent
      
      // Calculate horizontal spacing
      const totalWidth = (childNodeIds.length - 1) * (nodeWidth + 100);
      const startX = parent.position.x - totalWidth / 2;
      
      childNodeIds.forEach((childId, index) => {
        const childInAdjusted = adjustedNodes.find((n) => n.id === childId);
        if (childInAdjusted) {
          childInAdjusted.position = {
            x: startX + index * (nodeWidth + 100),
            y: childY,
          };
        }
      });
    } else {
      // Horizontal layout: arrange children vertically to the right of parent
      const parentX = parent.position.x;
      const childX = parentX + nodeWidth + 200; // Fixed X position to the right
      
      // Calculate vertical spacing
      const totalHeight = (childNodeIds.length - 1) * (nodeHeight + 80);
      const startY = parent.position.y - totalHeight / 2;
      
      childNodeIds.forEach((childId, index) => {
        const childInAdjusted = adjustedNodes.find((n) => n.id === childId);
        if (childInAdjusted) {
          childInAdjusted.position = {
            x: childX,
            y: startY + index * (nodeHeight + 80),
          };
        }
      });
    }
  });
  
  return adjustedNodes;
}
