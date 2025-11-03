import type { NodeRuntimeArgs, NodeRuntimeResult } from "../types";

/**
 * WAIT Node Runtime
 * 
 * Pauses workflow execution for specified duration.
 * Useful for rate limiting, polling, or waiting for external processes.
 */
export async function runWaitNode(args: NodeRuntimeArgs): Promise<NodeRuntimeResult> {
  const { resolvedConfig } = args;
  
  const duration = (resolvedConfig.duration as number) || 1;
  const unit = (resolvedConfig.unit as string) || "seconds";
  
  // Convert to milliseconds
  let durationMs = duration;
  switch (unit) {
    case "ms":
      durationMs = duration;
      break;
    case "seconds":
      durationMs = duration * 1000;
      break;
    case "minutes":
      durationMs = duration * 60 * 1000;
      break;
    case "hours":
      durationMs = duration * 60 * 60 * 1000;
      break;
  }
  
  const startTime = new Date().toISOString();
  console.log(`[WAIT] ⏱️ Waiting ${duration} ${unit} (${durationMs}ms)...`);
  
  // Wait
  await new Promise((resolve) => setTimeout(resolve, durationMs));
  
  const endTime = new Date().toISOString();
  console.log(`[WAIT] ✅ Wait completed at ${endTime}`);
  
  return {
    output: {
      waited: true,
      duration: durationMs,
      startTime,
      endTime,
    },
  };
}
