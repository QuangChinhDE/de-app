import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  NodeTypes,
  BackgroundVariant,
  useReactFlow,
  EdgeTypes,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useFlowStore } from "../state/flow-store";
import { WorkflowNode } from "./WorkflowNode";
import { getLayoutedElements } from "../utils/layout";

const nodeTypes: NodeTypes = {
  workflow: WorkflowNode,
};

// Custom Edge with Delete Button
function DeletableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const customEdges = useFlowStore((state) => state.customEdges);
  const steps = useFlowStore((state) => state.steps);
  const updateEdges = useFlowStore((state) => state.updateEdges);
  const removeEdge = useFlowStore((state) => state.removeEdge);
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    
    // If customEdges is empty (using auto-generated edges), 
    // first migrate all current edges to customEdges
    if (customEdges.length === 0 && steps.length > 1) {
      const allEdges: typeof customEdges = [];
      for (let i = 0; i < steps.length - 1; i++) {
        const edgeId = `e${steps[i].key}-${steps[i + 1].key}`;
        if (edgeId !== id) { // Don't include the one being deleted
          allEdges.push({
            id: edgeId,
            source: steps[i].key,
            target: steps[i + 1].key,
          });
        }
      }
      updateEdges(allEdges);
    } else {
      // Already using customEdges, just remove this one
      removeEdge(id);
    }
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: "all",
          }}
          className="nodrag nopan edge-button-wrapper"
        >
          <button
            type="button"
            onClick={onEdgeClick}
            className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white transition-all hover:scale-110"
            title="Delete connection"
          >
            ✕
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

const edgeTypes: EdgeTypes = {
  deletable: DeletableEdge,
};

export function FlowCanvas(): JSX.Element {
  const steps = useFlowStore((state) => state.steps);
  const customEdges = useFlowStore((state) => state.customEdges);
  const selectStep = useFlowStore((state) => state.selectStep);
  const selectedStepKey = useFlowStore((state) => state.selectedStepKey);
  const setShowConfigPanel = useFlowStore((state) => state.setShowConfigPanel);
  const showConfigPanel = useFlowStore((state) => state.showConfigPanel);
  const showResultPanel = useFlowStore((state) => state.showResultPanel);
  const layoutTrigger = useFlowStore((state) => state.layoutTrigger);
  const layoutDirection = useFlowStore((state) => state.layoutDirection);
  const triggerAutoLayout = useFlowStore((state) => state.triggerAutoLayout);
  const updateEdges = useFlowStore((state) => state.updateEdges);
  const nodePositions = useFlowStore((state) => state.nodePositions);
  const saveNodePositions = useFlowStore((state) => state.saveNodePositions);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges] = useEdgesState<Edge>([]);
  const { fitView } = useReactFlow();

  // Effect 1: Re-layout only when steps or layoutTrigger changes (not when edges change)
  useEffect(() => {
    const flowNodes: Node[] = steps.map((step, index) => ({
      id: step.key,
      type: "workflow",
      // Smart positioning: place new nodes to the right of existing ones
      position: { 
        x: 100 + index * 300, // Increase spacing to 300px for better visibility
        y: 100 + Math.floor(index / 4) * 200 // Row wrap every 4 nodes
      },
      data: {
        stepKey: step.key,
        name: step.name,
        schemaKey: step.schemaKey,
      },
      selected: step.key === selectedStepKey,
    }));

    // Use custom edges if available, otherwise auto-generate from step order
    let flowEdges: Edge[];
    if (customEdges.length > 0) {
      // Use custom user-defined edges with delete button
      flowEdges = customEdges.map((ce) => ({
        id: ce.id,
        source: ce.source,
        target: ce.target,
        sourceHandle: ce.sourceHandle,
        targetHandle: ce.targetHandle,
        type: "deletable",
        animated: false,
        focusable: true,
        style: { 
          stroke: "#6366f1", 
          strokeWidth: 2 
        },
        markerEnd: {
          type: "arrowclosed",
          color: "#6366f1",
          width: 20,
          height: 20,
        },
      }));
    } else {
      // Auto-generate edges based on step order (default pipeline)
      flowEdges = [];
      for (let i = 0; i < steps.length - 1; i++) {
        flowEdges.push({
          id: `e${steps[i].key}-${steps[i + 1].key}`,
          source: steps[i].key,
          target: steps[i + 1].key,
          type: "deletable",
          animated: false,
          focusable: true,
          style: { 
            stroke: "#6366f1", 
            strokeWidth: 2 
          },
          markerEnd: {
            type: "arrowclosed",
            color: "#6366f1",
            width: 20,
            height: 20,
          },
        });
      }
    }

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      flowNodes,
      flowEdges,
      layoutDirection
    );

    // Apply cached positions if available (preserve user layout)
    const finalNodes = layoutedNodes.map((node) => {
      const cached = nodePositions[node.id];
      return cached ? { ...node, position: cached } : node;
    });

    setNodes(finalNodes);
    setEdges(layoutedEdges);

    // Save new positions to cache
    const newPositions: Record<string, { x: number; y: number }> = {};
    finalNodes.forEach((node) => {
      newPositions[node.id] = node.position;
    });
    saveNodePositions(newPositions);

    // Fit view when nodes change
    setTimeout(() => {
      fitView({ 
        padding: 0.2, 
        duration: 300,
        maxZoom: 1.2,
      });
    }, 50);
  }, [steps, selectedStepKey, setNodes, setEdges, fitView, layoutTrigger, layoutDirection]);

  // Effect 2: Update edges only when customEdges changes (preserve node positions)
  useEffect(() => {
    let flowEdges: Edge[];
    if (customEdges.length > 0) {
      // Use custom user-defined edges with delete button
      flowEdges = customEdges.map((ce) => ({
        id: ce.id,
        source: ce.source,
        target: ce.target,
        sourceHandle: ce.sourceHandle,
        targetHandle: ce.targetHandle,
        type: "deletable",
        animated: false,
        focusable: true,
        style: { 
          stroke: "#6366f1", 
          strokeWidth: 2 
        },
        markerEnd: {
          type: "arrowclosed",
          color: "#6366f1",
          width: 20,
          height: 20,
        },
      }));
    } else {
      // Auto-generate edges based on step order (default pipeline)
      flowEdges = [];
      for (let i = 0; i < steps.length - 1; i++) {
        flowEdges.push({
          id: `e${steps[i].key}-${steps[i + 1].key}`,
          source: steps[i].key,
          target: steps[i + 1].key,
          type: "deletable",
          animated: false,
          focusable: true,
          style: { 
            stroke: "#6366f1", 
            strokeWidth: 2 
          },
          markerEnd: {
            type: "arrowclosed",
            color: "#6366f1",
            width: 20,
            height: 20,
          },
        });
      }
    }
    
    setEdges(flowEdges);
  }, [customEdges, steps, setEdges]);

  // Re-fit view when layout changes (panels open/close)
  useEffect(() => {
    // Wait for DOM to update, then fit view
    const timer = setTimeout(() => {
      fitView({ 
        padding: 0.2, 
        duration: 300,
        maxZoom: 1.2,
      });
    }, 50);
    return () => clearTimeout(timer);
  }, [showConfigPanel, showResultPanel, fitView]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;
      
      // Create unique edge ID that includes handles to prevent conflicts
      const edgeId = `e${params.source}${params.sourceHandle ? `-${params.sourceHandle}` : ''}-${params.target}${params.targetHandle ? `-${params.targetHandle}` : ''}`;
      
      const newEdge = {
        id: edgeId,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle ?? undefined,
        targetHandle: params.targetHandle ?? undefined,
      };
      
      console.log("[FLOWCANVAS] ✅ Created edge with unique ID:", newEdge);
      console.log(`[FLOWCANVAS] 🔍 Edge sourceHandle preservation check:`, {
        paramsSourceHandle: params.sourceHandle,
        newEdgeSourceHandle: newEdge.sourceHandle,
        hasSourceHandle: !!newEdge.sourceHandle
      });
      
      // CRITICAL DEBUG: Log current edges before modification
      console.log(`[FLOWCANVAS] 📋 BEFORE - Current edges from ${params.source}:`, 
        customEdges.filter(e => e.source === params.source).map(e => ({
          id: e.id,
          target: e.target,
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle
        }))
      );
      
      // Remove any existing edge with same ID to prevent duplicates
      const filteredEdges = customEdges.filter(edge => edge.id !== edgeId);
      console.log(`[FLOWCANVAS] 🗑️ Removed ${customEdges.length - filteredEdges.length} duplicate edges with ID: ${edgeId}`);
      
      const updatedEdges = [...filteredEdges, newEdge];
      
      // CRITICAL DEBUG: Log edges after modification
      console.log(`[FLOWCANVAS] 📋 AFTER - Updated edges from ${params.source}:`, 
        updatedEdges.filter(e => e.source === params.source).map(e => ({
          id: e.id,
          target: e.target,
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle
        }))
      );
      
      console.log(`[FLOWCANVAS] 🗂️ Total edges after adding: ${updatedEdges.length}`);
      updatedEdges.forEach(edge => {
        if (edge.source === params.source) {
          console.log(`[FLOWCANVAS] 📍 Edge from ${edge.source}: ${edge.sourceHandle || 'default'} → ${edge.target}`);
        }
      });
      
      // Check if source is a branching node (IF/SWITCH) with multiple children
      const sourceStep = steps.find((s) => s.key === params.source);
      const isBranchingNode = sourceStep && (sourceStep.schemaKey === "if" || sourceStep.schemaKey === "switch");
      
      // Save edges - no auto-layout, let user control positions manually
      updateEdges(updatedEdges);
      
      // Normal edge addition without re-layout
      updateEdges(updatedEdges);
    },
    [customEdges, updateEdges, steps, triggerAutoLayout]
  );
  
  const onEdgesChange = useCallback(
    (changes: any[]) => {
      // Handle edge deletion
      const deletions = changes.filter((c) => c.type === "remove");
      if (deletions.length > 0) {
        const remainingEdges = customEdges.filter(
          (e) => !deletions.some((d) => d.id === e.id)
        );
        updateEdges(remainingEdges);
      }
    },
    [customEdges, updateEdges]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      selectStep(node.id);
    },
    [selectStep]
  );

  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      selectStep(node.id);
      setShowConfigPanel(true);
    },
    [selectStep, setShowConfigPanel]
  );

  return (
    <div className="h-full w-full bg-ink-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.2}
        maxZoom={2}
        attributionPosition="bottom-left"
        edgesReconnectable={true}
        deleteKeyCode="Delete"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#d1d5db" />
        <Controls showInteractive={false} />
        <MiniMap
          nodeStrokeWidth={3}
          pannable
          zoomable
          className="bg-white/80"
        />
        
        {/* Auto Layout Button */}
        <div className="absolute top-4 left-4 z-10">
          <button
            type="button"
            onClick={triggerAutoLayout}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-2xl shadow-lg border-2 border-indigo-300 hover:bg-indigo-50 hover:border-indigo-500 hover:scale-110 transition-all"
            title="Auto Layout - Click to arrange all nodes intelligently"
          >
            🎨
          </button>
        </div>
      </ReactFlow>
    </div>
  );
}
