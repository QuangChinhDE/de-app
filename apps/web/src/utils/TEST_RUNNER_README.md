# 🧪 Workflow Test Runner

Automated testing system for Node Playground workflows.

## 📋 Overview

This test runner allows you to:
- ✅ Execute workflows programmatically
- ✅ Test with JSON data files
- ✅ Validate outputs automatically
- ✅ Get detailed execution reports
- ✅ Run performance benchmarks

## 🚀 Quick Start

### 1. Run Existing Tests

```bash
# Run order processing tests
npm run test:orders

# Or use tsx directly
npx tsx apps/web/src/utils/run-order-test.ts
```

### 2. Create Your Own Test

```typescript
import { WorkflowTestRunner, type TestWorkflow } from './test-runner';
import type { NodeDefinitionKey } from '../nodes';

const myTest: TestWorkflow = {
  name: 'My Test Workflow',
  description: 'Test description',
  steps: [
    {
      key: 'manual1',
      type: 'manual' as NodeDefinitionKey,
      name: 'Load Data',
      config: {
        mode: 'json',
        jsonInput: JSON.stringify({ users: [{ id: 1, name: 'Alice' }] })
      }
    },
    {
      key: 'split1',
      type: 'split' as NodeDefinitionKey,
      name: 'Split Users',
      config: {
        mode: 'field',
        fieldPath: 'users'
      }
    }
  ]
};

const runner = new WorkflowTestRunner();
const result = await runner.executeWorkflow(myTest);
runner.printReport(result);
```

## 📊 Test Report Example

```
============================================================
📊 TEST REPORT
============================================================

🎯 Result: ✅ PASSED
⏱️  Duration: 45.23ms
📦 Steps Executed: 3

📋 Step Details:
  1. ✅ Load Orders (12.45ms)
  2. ✅ Extract Orders (15.67ms)
  3. ✅ Add Status Label (17.11ms)

📤 Final Output:
[
  {
    "orderId": "ORD-001",
    "statusLabel": "pending",
    "itemCount": 2,
    "isHighValue": true
  }
]

============================================================
```

## 🎯 Test Features

### Available Nodes for Testing

| Node | Status | Notes |
|------|--------|-------|
| MANUAL | ✅ Working | Load test data |
| SPLIT | ✅ Working | Split arrays |
| SET | ✅ Working | Transform data |
| MERGE | ✅ Working | Combine data |
| LOOP | ✅ Working | Batch processing |
| IF | ✅ Working | Conditional branching |
| SWITCH | ✅ Working | Multi-branch routing |
| HTTP | ⚠️ Needs mock | External API calls |

### Test Data Files

- `test-orders-data.json` - E-commerce orders
- `test.json` - Workflow jobs data
- Add your own JSON files!

## 📝 Test Workflow Structure

```typescript
interface TestWorkflow {
  name: string;              // Test name
  description?: string;      // Test description
  steps: TestStep[];         // Workflow steps
  expectedOutputs?: Record<string, unknown>;  // Optional validation
}

interface TestStep {
  key: string;               // Unique step key
  type: NodeDefinitionKey;   // Node type (manual, split, etc.)
  name: string;              // Human-readable name
  config: Record<string, unknown>;  // Node configuration
}
```

## 🔍 Advanced Usage

### 1. Validate Expected Outputs

```typescript
const test: TestWorkflow = {
  name: 'Validate Outputs',
  steps: [...],
  expectedOutputs: {
    'split1': [{ id: 1 }, { id: 2 }],  // Expected output for split1 step
    'set1': [{ id: 1, name: 'Alice' }] // Expected output for set1 step
  }
};
```

### 2. Access Step Outputs

```typescript
const runner = new WorkflowTestRunner();
const result = await runner.executeWorkflow(test);

// Get all outputs
const outputs = runner.getOutputs();
console.log('split1 output:', outputs['split1']);

// Get execution log
const log = runner.getExecutionLog();
```

### 3. Chain Multiple Tests

```typescript
async function runTestSuite() {
  const runner = new WorkflowTestRunner();
  
  // Test 1
  const result1 = await runner.executeWorkflow(test1);
  runner.reset();  // Reset state between tests
  
  // Test 2
  const result2 = await runner.executeWorkflow(test2);
  runner.reset();
  
  // Aggregate results
  return [result1, result2];
}
```

## 🎓 Example Tests

### Test 1: Simple Data Split

```typescript
const test = {
  name: 'Split Array',
  steps: [
    {
      key: 'manual1',
      type: 'manual',
      name: 'Load Data',
      config: {
        mode: 'json',
        jsonInput: JSON.stringify({
          items: [1, 2, 3, 4, 5]
        })
      }
    },
    {
      key: 'split1',
      type: 'split',
      name: 'Extract Items',
      config: {
        mode: 'field',
        fieldPath: 'items'
      }
    }
  ],
  expectedOutputs: {
    'split1': [1, 2, 3, 4, 5]
  }
};
```

### Test 2: Data Transformation

```typescript
const test = {
  name: 'Transform Data',
  steps: [
    {
      key: 'manual1',
      type: 'manual',
      name: 'Load Users',
      config: {
        mode: 'json',
        jsonInput: JSON.stringify([
          { name: 'Alice', age: 25 },
          { name: 'Bob', age: 30 }
        ])
      }
    },
    {
      key: 'set1',
      type: 'set',
      name: 'Add Full Name',
      config: {
        fields: [
          {
            key: 'fullName',
            value: '{{$item.name}}',
            type: 'expression'
          }
        ],
        includeOtherFields: true
      }
    }
  ]
};
```

### Test 3: Conditional Branching

```typescript
const test = {
  name: 'Filter by Condition',
  steps: [
    {
      key: 'manual1',
      type: 'manual',
      name: 'Load Orders',
      config: {
        mode: 'json',
        jsonInput: JSON.stringify([
          { id: 1, amount: 100, status: 'active' },
          { id: 2, amount: 500, status: 'pending' }
        ])
      }
    },
    {
      key: 'if1',
      type: 'if',
      name: 'Check Amount',
      config: {
        conditions: [
          {
            field: 'amount',
            operator: 'gt',
            value: 200
          }
        ]
      }
    }
  ]
};
```

## 📈 Performance Testing

```typescript
const runner = new WorkflowTestRunner();

// Run multiple times for benchmark
const iterations = 100;
const durations: number[] = [];

for (let i = 0; i < iterations; i++) {
  const result = await runner.executeWorkflow(test);
  durations.push(result.duration);
  runner.reset();
}

// Calculate stats
const avg = durations.reduce((a, b) => a + b) / iterations;
const min = Math.min(...durations);
const max = Math.max(...durations);

console.log(`Performance (${iterations} iterations):`);
console.log(`  Average: ${avg.toFixed(2)}ms`);
console.log(`  Min: ${min.toFixed(2)}ms`);
console.log(`  Max: ${max.toFixed(2)}ms`);
```

## ⚙️ Configuration

### Add Test Script to package.json

```json
{
  "scripts": {
    "test:orders": "tsx apps/web/src/utils/run-order-test.ts",
    "test:custom": "tsx apps/web/src/utils/run-custom-test.ts"
  }
}
```

## 🐛 Debugging

### Enable Verbose Logging

The test runner uses the logger system:

```typescript
import { logger, LogLevel } from './logger';

// Show all debug logs
logger.setLevel(LogLevel.DEBUG);

// Run test
const result = await runner.executeWorkflow(test);
```

### Inspect Execution Log

```typescript
const runner = new WorkflowTestRunner();
const result = await runner.executeWorkflow(test);

// Get detailed log
const log = runner.getExecutionLog();
log.forEach(entry => {
  console.log(`${entry.timestamp} - ${entry.stepKey}: ${entry.status}`);
  if (entry.output) console.log('  Output:', entry.output);
  if (entry.error) console.log('  Error:', entry.error);
});
```

## 🎯 Best Practices

1. **Reset Between Tests**
   ```typescript
   runner.reset(); // Always reset state between tests
   ```

2. **Use Descriptive Names**
   ```typescript
   name: 'Filter High-Value Orders > $1000'  // ✅ Clear
   name: 'Test 1'                            // ❌ Vague
   ```

3. **Validate Critical Outputs**
   ```typescript
   expectedOutputs: {
     'finalStep': expectedData  // Validate key outputs
   }
   ```

4. **Handle Errors Gracefully**
   ```typescript
   if (!result.success) {
     console.error('Test failed:', result.errors);
     // Handle failure...
   }
   ```

## 📚 Related Files

- `test-runner.ts` - Test runner implementation
- `run-order-test.ts` - Order processing tests
- `logger.ts` - Logging system
- `../state/execution/` - Execution engine
- `../nodes/` - Node definitions

## 🤝 Contributing

To add new test workflows:

1. Create test file in `apps/web/src/utils/`
2. Define workflow steps
3. Add test script to package.json
4. Document in this README

## ❓ FAQ

**Q: Can I test HTTP nodes?**
A: Yes, but you'll need to mock external APIs or use test endpoints.

**Q: How do I test branching (IF/SWITCH)?**
A: Test runner supports branch outputs automatically.

**Q: Can I use real data files?**
A: Yes! Just load with `fs.readFileSync()` and parse JSON.

**Q: How to test LOOP node?**
A: Loop executor is supported - just configure batch size in config.

---

**Happy Testing!** 🎉

For questions or issues, check the main DEVELOPMENT_GUIDE.md.
