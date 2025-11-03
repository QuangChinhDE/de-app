import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import classNames from "classnames";
import { useFlowStore } from "../state/flow-store";
import { nodeDefinitions, type NodeDefinitionKey } from "../nodes";
import { getNodeColorClasses, getCategoryFromNodeType } from "../constants/node-colors";

export interface WorkflowNodeData extends Record<string, unknown> {
  stepKey: string;
  name: string;
  schemaKey: NodeDefinitionKey;
}

export type WorkflowNodeType = Node<WorkflowNodeData, "workflow">;

function getNodeIcon(schemaKey: NodeDefinitionKey): string {
  switch (schemaKey) {
    case "manual":
      return "▶️";
    case "http":
      return "🌐";
    case "if":
      return "❓";
    case "switch":
      return "🔀";
    case "filter":
      return "🔍";
    case "set":
      return "📝";
    case "split":
      return "✂️";
    default:
      return "⚙️";
  }
}

export const WorkflowNode = memo(({ data, selected }: NodeProps<WorkflowNodeType>) => {
  const runStates = useFlowStore((state) => state.stepRunStates);
  const steps = useFlowStore((state) => state.steps);
  const removeStep = useFlowStore((state) => state.removeStep);
  const runStep = useFlowStore((state) => state.runStep);

  const nodeData = data as WorkflowNodeData;
  const runState = runStates[nodeData.stepKey];
  const status = runState?.status ?? "idle";
  const definition = nodeDefinitions[nodeData.schemaKey];
  const icon = getNodeIcon(nodeData.schemaKey);
  
  // Get current step config for SWITCH node cases and MERGE input count
  const currentStep = steps.find((s) => s.key === nodeData.stepKey);
  const switchCases = nodeData.schemaKey === "switch" && currentStep 
    ? (currentStep.config.cases as unknown[] || [])
    : [];
  const mergeInputCount = nodeData.schemaKey === "merge" && currentStep
    ? (currentStep.config.inputCount as number || 2)
    : 2;

  const handleRun = (e: React.MouseEvent) => {
    e.stopPropagation();
    void runStep(nodeData.stepKey);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeStep(nodeData.stepKey);
  };

  // Get color based on category (centralized color system)
  const category = getCategoryFromNodeType(definition?.schema.type);
  const colorClasses = getNodeColorClasses(category);

  return (
    <div
      className={classNames(
        "workflow-node relative rounded-xl border-2 shadow-lg transition-all hover:shadow-xl",
        colorClasses,
        {
          "ring-4 ring-indigo-300 scale-105": selected,
          "hover:scale-102": !selected,
        }
      )}
      style={{ width: "240px" }}
    >
      {/* Input handles - multiple for MERGE node */}
      {nodeData.schemaKey === "merge" ? (
        <>
          {Array.from({ length: mergeInputCount }, (_, index) => {
            const totalHandles = mergeInputCount;
            const position = ((index + 1) / (totalHandles + 1)) * 100;
            const colors = ["!bg-blue-500", "!bg-purple-500", "!bg-pink-500", "!bg-orange-500", "!bg-teal-500"];
            const handleColor = colors[index % colors.length];
            
            return (
              <div key={index}>
                <Handle 
                  type="target" 
                  position={Position.Top} 
                  id={`input_${index}`}
                  style={{ left: `${position}%`, top: -6 }}
                  className={`!w-3 !h-3 ${handleColor} !border-2 !border-white`}
                />
                <div 
                  className="absolute top-[-20px] text-[10px] font-bold"
                  style={{ left: `calc(${position}% - 8px)`, pointerEvents: "none" }}
                >
                  {index + 1}
                </div>
              </div>
            );
          })}
        </>
      ) : nodeData.schemaKey !== "manual" ? (
        <Handle 
          type="target" 
          position={Position.Top}
          className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-white"
          style={{ top: -6 }}
        />
      ) : null}

      {/* Node Header - n8n style with icon circle */}
      <div className="px-3 py-3 flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-xl">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-600">
            {definition?.schema.type ?? "node"}
          </p>
          <p className="text-sm font-bold text-gray-800 truncate">{nodeData.name}</p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="flex-shrink-0 w-6 h-6 rounded-full bg-white/50 hover:bg-red-100 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors"
          title="Delete node"
        >
          ✕
        </button>
      </div>

      {/* Status Bar */}
      <div className="px-3 pb-2 flex items-center gap-2">
        <div
          className={classNames("h-2 w-2 rounded-full", {
            "bg-gray-300": status === "idle",
            "animate-pulse bg-blue-500": status === "running",
            "bg-green-500": status === "success",
            "bg-red-500": status === "error",
          })}
        />
        <span className="text-xs font-medium text-gray-600">
          {status === "idle" && "Not executed"}
          {status === "running" && "Executing..."}
          {status === "success" && "✓ Success"}
          {status === "error" && "✕ Failed"}
        </span>
      </div>

      {runState?.lastRun && (
        <p className="mb-2 text-[11px] text-ink-400">
          {runState.lastRun.durationMs ? `${runState.lastRun.durationMs.toFixed(0)}ms` : ""}
        </p>
      )}

      {/* Action Buttons - n8n style */}
      <div className="px-3 pb-3 flex gap-2">
        <button
          type="button"
          onClick={handleRun}
          disabled={status === "running"}
          className={classNames(
            "flex-1 rounded-lg px-3 py-2 text-xs font-bold transition-all shadow-sm",
            {
              "bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-300": status !== "running",
              "cursor-not-allowed bg-gray-200 text-gray-500 border border-gray-300": status === "running",
            }
          )}
        >
          {status === "running" ? "⏳ Running..." : "▶ Execute"}
        </button>
      </div>

      {/* Conditional Handles for IF node - n8n style at bottom */}
      {nodeData.schemaKey === "if" ? (
        <>
          <Handle 
            type="source" 
            position={Position.Bottom} 
            id="TRUE"
            style={{ left: "35%" }}
            className="!w-3 !h-3 !bg-green-500 !border-2 !border-white"
          />
          <div 
            className="absolute bottom-[-20px] left-[calc(35%-20px)] text-[10px] font-bold text-green-700"
            style={{ pointerEvents: "none" }}
          >
            TRUE
          </div>
          
          <Handle 
            type="source" 
            position={Position.Bottom} 
            id="FALSE"
            style={{ left: "65%" }}
            className="!w-3 !h-3 !bg-red-500 !border-2 !border-white"
          />
          <div 
            className="absolute bottom-[-20px] left-[calc(65%-25px)] text-[10px] font-bold text-red-700"
            style={{ pointerEvents: "none" }}
          >
            FALSE
          </div>
        </>
      ) : nodeData.schemaKey === "switch" && switchCases.length > 0 ? (
        <>
          {/* Dynamic handles for each case - n8n style at bottom */}
          {switchCases.map((caseValue, index) => {
            const totalHandles = switchCases.length + 1; // +1 for default
            const position = ((index + 1) / (totalHandles + 1)) * 100;
            const caseStr = String(caseValue ?? "");
            const colors = ["!bg-blue-500", "!bg-purple-500", "!bg-pink-500", "!bg-orange-500", "!bg-teal-500"];
            const handleColor = colors[index % colors.length];
            
            return (
              <div key={index}>
                <Handle 
                  type="source" 
                  position={Position.Bottom} 
                  id={`case_${index}`}
                  style={{ left: `${position}%` }}
                  className={`!w-3 !h-3 ${handleColor} !border-2 !border-white`}
                />
                <div 
                  className="absolute bottom-[-20px] text-[10px] font-bold"
                  style={{ left: `calc(${position}% - 15px)`, pointerEvents: "none" }}
                >
                  {caseStr}
                </div>
              </div>
            );
          })}
          
          {/* Default handle */}
          <Handle 
            type="source" 
            position={Position.Bottom} 
            id="default"
            style={{ left: `${((switchCases.length + 1) / (switchCases.length + 2)) * 100}%` }}
            className="!w-3 !h-3 !bg-gray-500 !border-2 !border-white"
          />
          <div 
            className="absolute bottom-[-20px] text-[10px] font-bold text-gray-700"
            style={{ 
              left: `calc(${((switchCases.length + 1) / (switchCases.length + 2)) * 100}% - 15px)`, 
              pointerEvents: "none" 
            }}
          >
            default
          </div>
        </>
      ) : (
        <Handle 
          type="source" 
          position={Position.Bottom} 
          className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-white"
          style={{ bottom: -6 }}
        />
      )}
    </div>
  );
});

WorkflowNode.displayName = "WorkflowNode";