import type { NodeRuntimeArgs, NodeRuntimeResult } from "../types";
import { smartUnwrap } from "../utils";

/**
 * CODE Node Runtime
 * 
 * Executes custom JavaScript code.
 * Input data is available as 'input' variable.
 * Code must return a value.
 */
export async function runCodeNode(args: NodeRuntimeArgs): Promise<NodeRuntimeResult> {
  const { resolvedConfig, previousOutput } = args;
  
  const code = resolvedConfig.code as string;
  let inputData = resolvedConfig.inputData as unknown;
  
  if (!code || code.trim() === "") {
    throw new Error("CODE node requires JavaScript code. Please enter code in the editor.");
  }
  
  // Auto-use previous output if inputData not provided
  if (inputData == null || inputData === "") {
    inputData = smartUnwrap(previousOutput, args.previousNodeType);
    console.log("[CODE] 🎯 Using previous output as input");
  }
  
  console.log("[CODE] Executing custom JavaScript code...");
  console.log("[CODE] Input type:", Array.isArray(inputData) ? "array" : typeof inputData);
  
  try {
    // Create function from code
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
    const func = new Function("input", code);
    
    // Execute code
    const result = func(inputData);
    
    console.log("[CODE] ✅ Code executed successfully");
    console.log("[CODE] Result type:", Array.isArray(result) ? "array" : typeof result);
    
    return {
      output: {
        result,
        inputType: Array.isArray(inputData) ? "array" : typeof inputData,
        outputType: Array.isArray(result) ? "array" : typeof result,
      },
    };
  } catch (error) {
    console.error("[CODE] ❌ Code execution error:", error);
    throw new Error(
      `CODE execution failed: ${error instanceof Error ? error.message : String(error)}. ` +
      `Check your JavaScript syntax and logic.`
    );
  }
}
