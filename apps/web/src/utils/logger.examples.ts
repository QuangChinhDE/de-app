/**
 * Logger Usage Examples
 * Copy these examples when implementing logging in new nodes
 */

import { log } from '../utils/logger';

// ===================================
// Example 1: Node Execution Logging
// ===================================
export async function myNodeRuntime(args: NodeRuntimeArgs): Promise<NodeRuntimeResult> {
  const context = { 
    nodeKey: args.currentNodeKey, 
    nodeType: 'mynode' 
  };
  
  log.execution('Node started', context);
  
  try {
    // ... processing logic ...
    
    log.success('Node completed', { 
      ...context, 
      itemsProcessed: 10 
    });
    
    return { output: result };
  } catch (error) {
    log.error('Node execution failed', error, context);
    throw error;
  }
}

// ===================================
// Example 2: Data Flow Tracking
// ===================================
export function processData(data: unknown) {
  const context = { operation: 'transform' };
  
  log.dataFlow('Input data received', { 
    ...context, 
    dataType: Array.isArray(data) ? 'array' : typeof data 
  });
  
  if (!Array.isArray(data)) {
    log.warn('Expected array, got single item', context);
    data = [data];
  }
  
  log.dataFlow('Data transformed', { 
    ...context, 
    itemCount: data.length 
  });
  
  return data;
}

// ===================================
// Example 3: Conditional Logging
// ===================================
export function validateInput(input: unknown) {
  const context = { operation: 'validation' };
  
  if (input === null || input === undefined) {
    log.warn('Input is null or undefined', { 
      ...context, 
      inputType: typeof input 
    });
    return false;
  }
  
  if (!Array.isArray(input) && typeof input !== 'object') {
    log.error('Invalid input type', new Error('Expected array or object'), {
      ...context,
      receivedType: typeof input
    });
    return false;
  }
  
  log.debug('Input validated successfully', context);
  return true;
}

// ===================================
// Example 4: Batching Operations
// ===================================
export async function processBatches(items: unknown[]) {
  const batchSize = 10;
  const batches = Math.ceil(items.length / batchSize);
  const context = { operation: 'batch-processing' };
  
  log.info(`Processing ${items.length} items in ${batches} batches`, {
    ...context,
    batchSize,
    totalBatches: batches
  });
  
  for (let i = 0; i < batches; i++) {
    log.execution(`Processing batch ${i + 1}/${batches}`, {
      ...context,
      batchIndex: i + 1
    });
    
    // ... process batch ...
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  log.success('All batches processed', {
    ...context,
    totalItems: items.length
  });
}

// ===================================
// Example 5: Performance Timing
// ===================================
export async function expensiveOperation() {
  log.time('expensive-operation');
  
  log.debug('Starting expensive calculation');
  
  // ... complex logic ...
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  log.timeEnd('expensive-operation'); // Logs: expensive-operation: 1.00s
  
  return result;
}

// ===================================
// Example 6: Grouped Logging
// ===================================
export function complexWorkflow() {
  log.group('🔄 Complex Workflow Execution');
  
  log.info('Step 1: Validate input');
  log.info('Step 2: Transform data');
  log.info('Step 3: Execute nodes');
  log.success('Workflow completed');
  
  log.groupEnd();
}

// ===================================
// Example 7: Config Update Tracking
// ===================================
export function updateNodeConfig(nodeKey: string, newConfig: Record<string, unknown>) {
  const context = { nodeKey, operation: 'config-update' };
  
  log.debug('Config update requested', {
    ...context,
    configKeys: Object.keys(newConfig).join(', ')
  });
  
  // Deep clone to prevent reference issues
  const clonedConfig = JSON.parse(JSON.stringify(newConfig));
  
  log.debug('Config cloned', {
    ...context,
    clonedKeys: Object.keys(clonedConfig).join(', ')
  });
  
  // ... update logic ...
  
  log.success('Config updated', context);
}

// ===================================
// Example 8: Error Recovery
// ===================================
export async function processWithRetry(item: unknown, maxRetries = 3) {
  const context = { operation: 'retry-process' };
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      log.debug(`Attempt ${attempt}/${maxRetries}`, context);
      
      // ... process item ...
      
      log.success('Item processed successfully', {
        ...context,
        attempts: attempt
      });
      
      return result;
    } catch (error) {
      log.warn(`Attempt ${attempt} failed`, {
        ...context,
        remainingAttempts: maxRetries - attempt,
        error: error instanceof Error ? error.message : String(error)
      });
      
      if (attempt === maxRetries) {
        log.error('All retry attempts exhausted', error, context);
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

// ===================================
// Example 9: Multi-input Processing (MERGE)
// ===================================
export function collectInputs(inputCount: number, inputsByHandle: Record<string, unknown>) {
  const context = { operation: 'collect-inputs' };
  const inputs: unknown[] = [];
  
  log.debug(`Collecting ${inputCount} inputs`, context);
  
  for (let i = 0; i < inputCount; i++) {
    const handleId = `input_${i}`;
    const inputData = inputsByHandle?.[handleId];
    
    if (inputData !== undefined && inputData !== null) {
      inputs.push(inputData);
      log.debug(`Input ${i + 1} connected`, { ...context, handleId });
    } else {
      log.warn(`Input ${i + 1} not connected`, { ...context, handleId });
    }
  }
  
  log.info(`Collected ${inputs.length}/${inputCount} inputs`, context);
  
  return inputs;
}

// ===================================
// Example 10: Conditional Branch Tracking
// ===================================
export function evaluateCondition(condition: string, item: unknown) {
  const context = { operation: 'condition-eval', condition };
  
  log.debug('Evaluating condition', { ...context, itemType: typeof item });
  
  try {
    const result = /* evaluate condition */;
    
    log.dataFlow(`Condition result: ${result ? 'TRUE' : 'FALSE'}`, context);
    
    return result;
  } catch (error) {
    log.error('Condition evaluation failed', error, context);
    return false;
  }
}
