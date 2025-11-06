# 📘 Node Playground - Development Guide

> **Tài liệu hướng dẫn phát triển đầy đủ cho developers tiếp tục maintain và mở rộng hệ thống**

## 📋 Mục Lục

1. [Tổng Quan Kiến Trúc](#tổng-quan-kiến-trúc)
2. [Quy Tắc LUÔN PHẢI TUÂN THỦ](#quy-tắc-luôn-phải-tuân-thủ)
3. [Output Format Standard](#output-format-standard)
4. [Execution Flow Architecture](#execution-flow-architecture)
5. [Hướng Dẫn Tạo Node Mới](#hướng-dẫn-tạo-node-mới)
6. [Testing Guidelines](#testing-guidelines)
7. [Troubleshooting](#troubleshooting)

---

## 🏗️ Tổng Quan Kiến Trúc

### Cấu Trúc Thư Mục

```
node-playground/
├── apps/
│   ├── web/                          # React Frontend
│   │   ├── src/
│   │   │   ├── components/           # UI Components
│   │   │   │   ├── FlowCanvas.tsx    # ReactFlow canvas
│   │   │   │   ├── ConfigPanel.tsx   # Dynamic form loader
│   │   │   │   ├── ResultPanel.tsx   # Execution results
│   │   │   │   └── form-system/      # 🔥 Shared Form Components (Layer 2)
│   │   │   │       ├── TokenizedInput.tsx
│   │   │   │       ├── KeyValueEditor.tsx
│   │   │   │       ├── FilterConditionsEditor.tsx
│   │   │   │       └── CasesEditor.tsx
│   │   │   ├── design-system/        # 🔥 Primitives (Layer 1)
│   │   │   │   └── primitives/
│   │   │   │       ├── Input.tsx, Select.tsx, Textarea.tsx
│   │   │   │       ├── Checkbox.tsx, Button.tsx
│   │   │   │       └── index.ts
│   │   │   ├── nodes/                # 🔥 Node Definitions (Layer 3)
│   │   │   │   ├── index.ts          # Node registry
│   │   │   │   ├── types.ts          # Shared types
│   │   │   │   ├── utils.ts          # Runtime utilities
│   │   │   │   ├── OUTPUT_FORMAT_STANDARD.md
│   │   │   │   ├── manual/, http/, if/, switch/
│   │   │   │   ├── set/, split/, merge/, loop/
│   │   │   │   └── [node-folder]/
│   │   │   │       ├── index.ts      # Export NodeDefinition
│   │   │   │       ├── schema.ts     # Zod schema + types
│   │   │   │       ├── runtime.ts    # Execution logic
│   │   │   │       ├── [Node]Form.tsx # Custom form
│   │   │   │       └── README.md     # Documentation
│   │   │   ├── state/                # 🔥 State Management
│   │   │   │   ├── flow-store.ts     # Zustand store (~900 lines)
│   │   │   │   └── execution/        # 🆕 Execution Layer
│   │   │   │       ├── types.ts
│   │   │   │       ├── base-executor.ts
│   │   │   │       ├── single-output-executor.ts
│   │   │   │       ├── branch-executor.ts
│   │   │   │       ├── loop-executor.ts
│   │   │   │       └── index.ts      # Executor registry
│   │   │   └── utils/
│   │   │       ├── expression.ts     # Token resolution
│   │   │       ├── layout.ts         # Auto-layout
│   │   │       └── run-data.ts       # ExecutionData conversion
│   └── server/                       # Node.js Backend
└── packages/
    └── types/                        # Shared TypeScript types
        └── src/index.ts
```

---

## ⚠️ Quy Tắc LUÔN PHẢI TUÂN THỦ

### 🎯 Rule #1: Output Format Contract

**TUYỆT ĐỐI phải tuân thủ output format chuẩn trong `OUTPUT_FORMAT_STANDARD.md`**

#### Single Output Nodes (Default)
```typescript
interface NodeRuntimeResult {
  output: unknown;        // Array, Object, hoặc primitive
  status?: 'success' | 'error';
  durationMs?: number;
}
```

**Áp dụng cho**: MANUAL, HTTP, SET, SPLIT, MERGE, FILTER, LOOP, SORT, LIMIT, WAIT, CODE, AGGREGATE

**Ví dụ**:
```typescript
// ✅ ĐÚNG
return { 
  output: [{ id: 1, name: 'Alice' }],
  status: 'success',
  durationMs: 150
};

// ❌ SAI - không wrap trong output
return [{ id: 1, name: 'Alice' }];

// ❌ SAI - không dùng data thay vì output
return { data: [{ id: 1 }] };
```

#### Multiple Output Nodes (Branching)
```typescript
interface NodeRuntimeResult {
  outputs: Array<{
    label: string;      // Branch identifier
    data: unknown;      // Data cho branch này
  }>;
  status?: 'success' | 'error';
  durationMs?: number;
}
```

**Áp dụng cho**: IF, SWITCH

**Ví dụ IF Node**:
```typescript
// ✅ ĐÚNG - NEW FORMAT
return {
  outputs: [
    { label: 'TRUE', data: [{ id: 1, age: 25 }] },
    { label: 'FALSE', data: [{ id: 2, age: 35 }] }
  ]
};

// ⚠️ LEGACY FORMAT (vẫn supported bởi BranchExecutor)
return {
  output: {
    TRUE: [{ id: 1, age: 25 }],
    FALSE: [{ id: 2, age: 35 }]
  }
};
```

**Ví dụ SWITCH Node**:
```typescript
// ✅ ĐÚNG
return {
  outputs: [
    { label: 'case_0', data: [{ category: 'A' }] },
    { label: 'case_1', data: [{ category: 'B' }] },
    { label: 'default', data: [{ category: 'C' }] }
  ]
};
```

---

### 🎯 Rule #2: Storage Key Convention

**Branching nodes PHẢI lưu outputs với branch-specific keys**

```typescript
// Single-output node
stepOutputs['manual1'] = [{ id: 1, name: 'Alice' }]
stepOutputs['http1'] = { data: {...}, status: 200 }

// Branching node (IF)
stepOutputs['if1-TRUE'] = [{ id: 1, age: 25 }]
stepOutputs['if1-FALSE'] = [{ id: 2, age: 35 }]

// Branching node (SWITCH)
stepOutputs['switch1-case_0'] = [{ category: 'A' }]
stepOutputs['switch1-case_1'] = [{ category: 'B' }]
stepOutputs['switch1-default'] = [{ category: 'C' }]
```

**KHÔNG BAO GIỜ** lưu output của branching node vào main key (`if1`, `switch1`).

---

### 🎯 Rule #3: Custom Form Requirement

**MỖI NODE PHẢI CÓ CUSTOM FORM RIÊNG - KHÔNG dùng generic/fallback**

```typescript
// ✅ ĐÚNG - Mỗi node có custom form
export const httpNode: NodeDefinition = {
  key: "http",
  schema: httpNodeSchema,
  run: httpRuntime,
  FormComponent: HttpForm,  // Custom form
};

// ❌ SAI - Không có FormComponent
export const myNode: NodeDefinition = {
  key: "mynode",
  schema: myNodeSchema,
  run: myRuntime,
  // Missing FormComponent!
};
```

**Lý do**: Generic forms không đủ linh hoạt cho các node phức tạp (HTTP với 4 body modes, SWITCH với dynamic cases, MERGE với 3 modes, v.v.)

---

### 🎯 Rule #4: 3-Layer Form Architecture

**PHẢI tuân thủ 3-layer architecture khi xây dựng forms**

```
Layer 1: Design System Primitives
  └── Input, Select, Textarea, Checkbox, Button
  └── Pure UI components, không biết gì về business logic

Layer 2: Form System Components (Shared)
  └── TokenizedInput, KeyValueEditor, FilterConditionsEditor, CasesEditor
  └── Reusable form widgets với business logic

Layer 3: Node-Specific Forms
  └── HttpForm, IfForm, SetForm, SwitchForm, etc.
  └── Custom forms tailored cho từng node
```

**Nguyên tắc**:
- ✅ Node forms (Layer 3) PHẢI sử dụng components từ Layer 1 & 2
- ✅ KHÔNG duplicate code - tái sử dụng Layer 2 components
- ✅ Layer 2 components phải generic và reusable
- ❌ KHÔNG hardcode business logic trong Layer 1

---

### 🎯 Rule #5: Token Resolution Rules

**Token format**: `{{steps.<nodeKey>.<fieldPath>}}`

```typescript
// Single-output node
{{steps.manual1.name}}           // ✅ Lấy field "name"
{{steps.http1.data.users[0].id}} // ✅ Nested access

// Branching node - PHẢI include branch label
{{steps.if1-TRUE.name}}          // ✅ Lấy từ TRUE branch
{{steps.if1-FALSE.age}}          // ✅ Lấy từ FALSE branch
{{steps.switch1-case_0.category}} // ✅ Lấy từ case_0

// ❌ SAI - Không dùng branch label
{{steps.if1.name}}               // ❌ if1 key không tồn tại!
```

**Auto-unwrap arrays**: Token resolution tự động unwrap arrays khi loop qua items
```typescript
// Input: [{ name: 'Alice' }, { name: 'Bob' }]
// Token: {{steps.manual1.name}}
// Result khi loop: 'Alice', 'Bob' (per-item context)
```

**Special tokens trong LOOP**:
```typescript
{{$item}}         // Current item
{{$index}}        // Current index (0-based)
{{$total}}        // Total items
{{$batchIndex}}   // Current batch index
```

---

### 🎯 Rule #6: Execution Layer Architecture

**PHẢI sử dụng executor registry thay vì inline execution logic**

#### Executor Registry Pattern

```typescript
// apps/web/src/state/execution/index.ts
const executors = [
  new SingleOutputExecutor(),  // manual, http, set, split, merge
  new BranchExecutor(),        // if, switch
  new LoopExecutor()           // loop
];

export async function executeWithRegistry(context: ExecutionContext): Promise<ExecutionResult> {
  const exe = executors.find(e => e.canHandle(context.step.schemaKey));
  if (!exe) throw new Error(`No executor for node type: ${context.step.schemaKey}`);
  return await exe.execute(context);
}
```

#### Executor Implementation Pattern

```typescript
// base-executor.ts
export abstract class BaseExecutor {
  abstract canHandle(nodeType: string): boolean;
  abstract execute(context: ExecutionContext): Promise<ExecutionResult>;

  protected async runNode(context: ExecutionContext) {
    return await context.definition.run({
      config: context.step.config,
      resolvedConfig: context.resolvedConfig,
      previousOutput: context.previousOutput,
      currentNodeKey: context.step.key,
      allStepOutputs: context.tokenContext,
    });
  }
}

// single-output-executor.ts
export class SingleOutputExecutor extends BaseExecutor {
  canHandle(nodeType: string): boolean {
    return ['manual', 'http', 'set', 'split', 'merge'].includes(nodeType);
  }

  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    const runtimeResult = await this.runNode(context);
    return {
      runtimeResult,
      outputsToStore: { [context.step.key]: runtimeResult.output },
      isBranchingNode: false,
    };
  }
}
```

**Lợi ích**:
- ✅ Separation of concerns - mỗi executor lo 1 loại node
- ✅ Dễ test - mock ExecutionContext, không cần mock store
- ✅ Dễ extend - thêm executor mới cho node type mới
- ✅ Type-safe với TypeScript interfaces

---

### 🎯 Rule #7: Legacy Format Support

**BranchExecutor PHẢI hỗ trợ legacy format để backward compatibility**

```typescript
// branch-executor.ts
async execute(context: ExecutionContext): Promise<ExecutionResult> {
  const runtimeResult = await this.runNode(context);

  // ⭐ Backwards compatibility: convert legacy format
  if (!runtimeResult.outputs && runtimeResult.output && typeof runtimeResult.output === 'object') {
    const legacy = runtimeResult.output as Record<string, unknown>;
    const outputs = Object.keys(legacy).map(k => ({ label: k, data: legacy[k] }));
    runtimeResult.outputs = outputs;
  }

  // Validate outputs array exists
  if (!runtimeResult.outputs || !Array.isArray(runtimeResult.outputs)) {
    throw new Error(`Branching node must return { outputs: [{label, data}] }`);
  }

  // Convert to branch-specific keys
  const outputsToStore: Record<string, unknown> = {};
  runtimeResult.outputs.forEach((branch: any) => {
    outputsToStore[`${context.step.key}-${branch.label}`] = branch.data;
  });

  return { runtimeResult, outputsToStore, isBranchingNode: true };
}
```

**Lý do**: IF node có thể vẫn return legacy format `{ output: { TRUE: [], FALSE: [] } }`. BranchExecutor tự động convert sang new format.

---

### 🎯 Rule #8: Loop Execution Pattern

**LOOP node PHẢI execute downstream node per-item với `$item` context**

```typescript
// loop-executor.ts
async execute(context: ExecutionContext): Promise<ExecutionResult> {
  const loopResult = await this.runNode(context);
  const items = loopResult.output?.items || [];

  // Find downstream node to execute
  const downstreamEdge = context.allEdges.find(e => e.source === context.step.key);
  const downstreamStep = context.allSteps.find(s => s.key === downstreamEdge.target);

  const processedItems: unknown[] = [];

  for (let i = 0; i < items.length; i++) {
    const currentItem = items[i];

    // ⭐ Build loop token context with $item, $index, $total
    const loopTokenContext = {
      ...context.tokenContext,
      $item: currentItem,
      $index: i,
      $total: items.length,
    };

    // Resolve downstream config with loop context
    const downstreamResolved = resolveTokens(downstreamStep.config, loopTokenContext);

    // Execute downstream node with per-item context
    const downstreamResult = await downstreamDef.run({
      config: downstreamStep.config,
      resolvedConfig: downstreamResolved,
      previousOutput: currentItem,
      currentNodeKey: downstreamStep.key,
      allStepOutputs: loopTokenContext,  // Pass $item context
    });

    processedItems.push(downstreamResult.output);
  }

  // Return processed items
  loopResult.output = { items: processedItems, totalCount: items.length };
  return {
    runtimeResult: loopResult,
    outputsToStore: { [context.step.key]: loopResult.output },
    isBranchingNode: false,
    executedDownstream: true,
  };
}
```

**Lưu ý quan trọng**:
- ✅ Loop PHẢI execute downstream node per-item
- ✅ PHẢI pass `$item`, `$index`, `$total` vào token context
- ✅ PHẢI resolve downstream config với loop context
- ✅ PHẢI return processed items trong `loopResult.output.items`

---

### 🎯 Rule #9: Per-Item Processing (Array Context)

**Khi input là array, nodes xử lý TỪNG ITEM một cách độc lập**

```typescript
// SET node runtime
export async function setRuntime(args: NodeRuntimeArgs): Promise<NodeRuntimeResult> {
  const inputData = args.previousOutput || args.resolvedConfig.input;

  // ⭐ If input is array, process each item
  if (Array.isArray(inputData)) {
    const results = inputData.map((item) => {
      // Build per-item context
      const itemContext = { ...args.allStepOutputs, __previousOutput: item };
      
      // Resolve tokens per-item
      const mappings = args.resolvedConfig.mappings as Array<{key: string, value: unknown}>;
      const processedItem: Record<string, unknown> = {};
      
      mappings.forEach(m => {
        processedItem[m.key] = resolveTokens(m.value, itemContext);
      });

      return processedItem;
    });

    return { output: results };
  }

  // Single item processing
  // ...
}
```

**Ví dụ**:
```typescript
// Input: [{ name: 'Alice', age: 25 }, { name: 'Bob', age: 30 }]
// SET node: Add field "greeting" = "Hello {{__previousOutput.name}}"
// Output: [
//   { name: 'Alice', age: 25, greeting: 'Hello Alice' },
//   { name: 'Bob', age: 30, greeting: 'Hello Bob' }
// ]
```

---

### 🎯 Rule #10: React Hook Form + Zod Validation

**TẤT CẢ node forms PHẢI sử dụng React Hook Form + Zod**

```typescript
// schema.ts
import { z } from "zod";

export const myNodeConfigSchema = z.object({
  url: z.string().url("Invalid URL"),
  method: z.enum(["GET", "POST", "PUT", "DELETE"]),
  timeout: z.number().min(0).max(60000),
});

export type MyNodeConfig = z.infer<typeof myNodeConfigSchema>;

// MyNodeForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const MyNodeForm: React.FC<NodeFormProps<MyNodeConfig>> = ({
  value,
  onChange,
  onRun,
  isRunning,
}) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<MyNodeConfig>({
    defaultValues: value,
    resolver: zodResolver(myNodeConfigSchema),
  });

  // Watch changes và sync với parent
  React.useEffect(() => {
    const subscription = watch((formData) => {
      onChange(formData as MyNodeConfig);
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  return (
    <form onSubmit={handleSubmit(() => onRun?.())}>
      <Input
        label="URL"
        {...register("url")}
        error={errors.url?.message}
      />
      <Button type="submit" disabled={isRunning}>
        {isRunning ? "Running..." : "Run"}
      </Button>
    </form>
  );
};
```

**Lý do**:
- ✅ Type-safe validation với Zod schema
- ✅ Automatic form state management
- ✅ Clear error messages
- ✅ Sync form data với store

---

## 📦 Output Format Standard

**Chi tiết đầy đủ xem**: `apps/web/src/nodes/OUTPUT_FORMAT_STANDARD.md`

### Storage Keys Reference

| Node Type | Output Format | Storage Keys |
|-----------|---------------|--------------|
| **MANUAL** | `{ output: [...] }` | `manual1` |
| **HTTP** | `{ output: {...}, status, durationMs }` | `http1` |
| **SET** | `{ output: [...] }` | `set1` |
| **SPLIT** | `{ output: [...] }` | `split1` |
| **FILTER** | `{ output: [...] }` | `filter1` |
| **MERGE** | `{ output: [...] }` | `merge1` |
| **LOOP** | `{ output: { items: [...], totalCount } }` | `loop1` |
| **IF** | `{ outputs: [{label:'TRUE', data}, {label:'FALSE', data}] }` | `if1-TRUE`, `if1-FALSE` |
| **SWITCH** | `{ outputs: [{label:'case_0', data}, ...] }` | `switch1-case_0`, `switch1-case_1`, `switch1-default` |

### Token Access Examples

```typescript
// Single-output nodes
{{steps.manual1}}              // Full output
{{steps.manual1.users}}        // Array field
{{steps.manual1.users[0].name}} // Nested access

// Branching nodes
{{steps.if1-TRUE}}             // TRUE branch output
{{steps.if1-FALSE.age}}        // FALSE branch field
{{steps.switch1-case_0.category}} // SWITCH case output

// Loop node
{{steps.loop1.items}}          // Processed items array
{{steps.loop1.totalCount}}     // Total count
{{$item}}                      // Inside loop: current item
{{$index}}                     // Inside loop: current index
```

---

## 🔄 Execution Flow Architecture

### High-Level Flow

```
1. User clicks RUN button
   ↓
2. flow-store.ts: runStep() được gọi
   ↓
3. Build ExecutionContext:
   - Collect incoming edges
   - Resolve tokens trong config
   - Build tokenContext từ stepOutputs
   ↓
4. Call executeWithRegistry(context)
   ↓
5. Executor Registry:
   - Find appropriate executor (Single/Branch/Loop)
   - Execute node với executor.execute(context)
   ↓
6. Executor returns ExecutionResult:
   - runtimeResult: raw output từ runtime
   - outputsToStore: processed outputs với correct keys
   - isBranchingNode: true/false
   ↓
7. flow-store.ts: Post-processing
   - Flatten output (unwrap { value: [...] } patterns)
   - Apply advanced options (wait, sort, limit)
   - Convert to executionData (item lineage)
   - Build runRecord
   ↓
8. Update store state:
   - stepOutputs: merge outputsToStore
   - stepRunStates: update status, lastRun
   - runTimeline: append runRecord
   ↓
9. UI updates:
   - ResultPanel shows output
   - Node shows success/error state
   - DataFieldsPanel updates với new fields
```

### ExecutionContext Structure

```typescript
interface ExecutionContext {
  step: StepInstance;                    // Current node instance
  definition: NodeDefinition;            // Node definition (schema, run, form)
  resolvedConfig: Record<string, unknown>; // Config with resolved tokens
  previousOutput?: unknown;              // Output from previous node
  previousNodeType?: string;             // Type of previous node
  tokenContext: Record<string, unknown>; // All stepOutputs for token resolution
  allSteps: StepInstance[];              // All steps in workflow
  allEdges: CustomEdge[];                // All edges in workflow
  stepOutputs: Record<string, unknown>;  // Current stepOutputs (same as tokenContext)
}
```

### ExecutionResult Structure

```typescript
interface ExecutionResult {
  runtimeResult: any;                    // Raw result from runtime.ts
  outputsToStore: Record<string, unknown>; // Processed outputs to store
  branchLabels?: string[];               // Branch labels (for IF/SWITCH)
  isBranchingNode: boolean;              // Is this a branching node?
  executedDownstream?: boolean;          // Did loop executor run downstream?
}
```

### Executor Decision Tree

```
executeWithRegistry(context)
  ├─ context.step.schemaKey === 'loop'
  │    └─→ LoopExecutor
  │         ├─ Run LOOP runtime to get items
  │         ├─ Find downstream node
  │         ├─ Execute downstream per-item with $item context
  │         └─ Return processed items
  │
  ├─ context.step.schemaKey in ['if', 'switch']
  │    └─→ BranchExecutor
  │         ├─ Run runtime (IF/SWITCH)
  │         ├─ Check for legacy format and convert
  │         ├─ Validate outputs array exists
  │         └─ Build branch-specific storage keys
  │
  └─ context.step.schemaKey in ['manual', 'http', 'set', ...]
       └─→ SingleOutputExecutor
            ├─ Run runtime
            └─ Store output với main key
```

---

## 🛠️ Hướng Dẫn Tạo Node Mới

### Checklist Tạo Node Mới

- [ ] 1. Tạo thư mục node: `apps/web/src/nodes/my-node/`
- [ ] 2. Tạo `schema.ts` với Zod schema
- [ ] 3. Tạo `runtime.ts` tuân thủ output format
- [ ] 4. Tạo `MyNodeForm.tsx` với React Hook Form
- [ ] 5. Tạo `index.ts` export NodeDefinition
- [ ] 6. Tạo `README.md` với đầy đủ documentation
- [ ] 7. Register node trong `apps/web/src/nodes/index.ts`
- [ ] 8. Add color definition trong `apps/web/src/constants/node-colors.ts`
- [ ] 9. (Optional) Add executor nếu cần logic đặc biệt
- [ ] 10. Test node với sample workflows

### Step-by-Step Guide

#### Step 1: Create Node Folder

```bash
cd apps/web/src/nodes
mkdir my-node
cd my-node
```

#### Step 2: Create `schema.ts`

```typescript
import { z } from "zod";
import type { NodeSchema } from "@node-playground/types";

// Zod schema for runtime validation
export const myNodeConfigSchema = z.object({
  myField: z.string().min(1, "Field is required"),
  myOption: z.enum(["option1", "option2"]).default("option1"),
  myNumber: z.number().min(0).max(100).default(10),
});

// TypeScript type
export type MyNodeConfig = z.infer<typeof myNodeConfigSchema>;

// NodeSchema for UI metadata
export const myNodeSchema: NodeSchema = {
  key: "mynode",
  label: "My Node",
  description: "Description of what this node does",
  category: "utility", // "trigger" | "action" | "utility"
  icon: "🎯",
  version: "1.0.0",
  inputs: ["main"], // Input handles
  outputs: ["main"], // Output handles (or ["TRUE", "FALSE"] for branching)
};
```

#### Step 3: Create `runtime.ts`

```typescript
import type { NodeRuntimeArgs, NodeRuntimeResult } from "../types";
import { myNodeConfigSchema, type MyNodeConfig } from "./schema";

export async function myNodeRuntime(args: NodeRuntimeArgs): Promise<NodeRuntimeResult> {
  const start = performance.now();

  // Validate config
  const config = myNodeConfigSchema.parse(args.resolvedConfig) as MyNodeConfig;

  // Get input data
  const inputData = args.previousOutput || config.input;

  try {
    // ⭐ Your node logic here
    const result = processData(inputData, config);

    // ⭐ Return MUST follow output format
    return {
      output: result,
      status: "success",
      durationMs: performance.now() - start,
    };
  } catch (error) {
    return {
      output: null,
      status: "error",
      durationMs: performance.now() - start,
    };
  }
}

function processData(data: unknown, config: MyNodeConfig): unknown {
  // Your processing logic
  return data;
}
```

**⚠️ LƯU Ý**: 
- Single-output: return `{ output: ... }`
- Branching: return `{ outputs: [{label, data}, ...] }`

#### Step 4: Create `MyNodeForm.tsx`

```typescript
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { NodeFormProps } from "@node-playground/types";
import { Input, Select, Button } from "../../design-system/primitives";
import { TokenizedInput } from "../../components/form-system/TokenizedInput";
import { myNodeConfigSchema, type MyNodeConfig } from "./schema";

export const MyNodeForm: React.FC<NodeFormProps<MyNodeConfig>> = ({
  value,
  onChange,
  onRun,
  isRunning,
  stepOutputs,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<MyNodeConfig>({
    defaultValues: value,
    resolver: zodResolver(myNodeConfigSchema),
  });

  // Sync form changes to parent
  React.useEffect(() => {
    const subscription = watch((formData) => {
      onChange(formData as MyNodeConfig);
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  return (
    <form onSubmit={handleSubmit(() => onRun?.())} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">My Field</label>
        <TokenizedInput
          value={watch("myField") || ""}
          onChange={(v) => setValue("myField", v)}
          placeholder="Enter value or use tokens"
          stepOutputs={stepOutputs}
        />
        {errors.myField && (
          <p className="text-red-500 text-sm mt-1">{errors.myField.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">My Option</label>
        <Select {...register("myOption")}>
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">My Number</label>
        <Input
          type="number"
          {...register("myNumber", { valueAsNumber: true })}
          error={errors.myNumber?.message}
        />
      </div>

      <Button type="submit" disabled={isRunning} className="w-full">
        {isRunning ? "Running..." : "Run"}
      </Button>
    </form>
  );
};
```

#### Step 5: Create `index.ts`

```typescript
import type { NodeDefinition } from "../types";
import { myNodeSchema } from "./schema";
import { myNodeRuntime } from "./runtime";
import { MyNodeForm } from "./MyNodeForm";

export const myNode: NodeDefinition = {
  key: "mynode",
  schema: myNodeSchema,
  run: myNodeRuntime,
  FormComponent: MyNodeForm,
};
```

#### Step 6: Create `README.md`

```markdown
# My Node

## 📋 Chức năng
Mô tả chi tiết chức năng của node.

## 🎨 UI Components
- Form component: MyNodeForm.tsx
- Features: List các tính năng UI

## 🎯 Khi nào sử dụng
- Use case 1
- Use case 2

## ⚙️ Cấu hình
### Field 1
Description và example

### Field 2
Description và example

## 📖 Ví dụ
### Example 1
Input → Config → Output

## 📊 Output Contract
### Output Format
\`\`\`typescript
{ output: ... }
\`\`\`

### Storage Key
\`steps.mynode1\`

### Token Access
\`{{steps.mynode1.fieldName}}\`
```

#### Step 7: Register Node

```typescript
// apps/web/src/nodes/index.ts
import { myNode } from "./my-node";

const nodeDefinitionsArray: NodeDefinition[] = [
  manualNode,
  httpNode,
  // ... existing nodes
  myNode, // ⭐ Add your node
];
```

#### Step 8: Add Color (Optional)

```typescript
// apps/web/src/constants/node-colors.ts
export const nodeColors: Record<string, string> = {
  manual: "#f59e0b", // Trigger: amber
  http: "#3b82f6",   // Action: blue
  mynode: "#8b5cf6", // Utility: purple
  // ...
};
```

#### Step 9: Add Executor (If Needed)

Chỉ cần nếu node có logic execution đặc biệt (như LOOP).

```typescript
// apps/web/src/state/execution/my-node-executor.ts
import { BaseExecutor } from "./base-executor";
import type { ExecutionContext, ExecutionResult } from "./types";

export class MyNodeExecutor extends BaseExecutor {
  canHandle(nodeType: string): boolean {
    return nodeType === "mynode";
  }

  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    // Custom execution logic
    const runtimeResult = await this.runNode(context);
    
    return {
      runtimeResult,
      outputsToStore: { [context.step.key]: runtimeResult.output },
      isBranchingNode: false,
    };
  }
}

// Register in index.ts
const executors = [
  new SingleOutputExecutor(),
  new BranchExecutor(),
  new LoopExecutor(),
  new MyNodeExecutor(), // ⭐ Add your executor
];
```

#### Step 10: Test Node

```typescript
// Test workflow example
1. Add MANUAL node với test data
2. Add MY NODE và config
3. Click RUN
4. Verify output trong ResultPanel
5. Check storage key trong stepOutputs
6. Test token access từ downstream node
```

---

## 🧪 Testing Guidelines

### Unit Testing Pattern

```typescript
// my-node.test.ts
import { describe, it, expect } from "vitest";
import { myNodeRuntime } from "./runtime";

describe("MyNode Runtime", () => {
  it("should process data correctly", async () => {
    const result = await myNodeRuntime({
      config: { myField: "test", myOption: "option1" },
      resolvedConfig: { myField: "test", myOption: "option1" },
      previousOutput: [{ id: 1 }],
      allStepOutputs: {},
    });

    expect(result.output).toBeDefined();
    expect(result.status).toBe("success");
  });

  it("should handle errors gracefully", async () => {
    const result = await myNodeRuntime({
      config: { myField: "" }, // Invalid
      resolvedConfig: { myField: "" },
      previousOutput: null,
      allStepOutputs: {},
    });

    expect(result.status).toBe("error");
  });
});
```

### Integration Testing

```typescript
// Test with executor
import { executeWithRegistry } from "../state/execution";

describe("MyNode Integration", () => {
  it("should execute via registry", async () => {
    const context = {
      step: { key: "mynode1", schemaKey: "mynode", config: {...} },
      definition: myNode,
      resolvedConfig: {...},
      tokenContext: {},
      allSteps: [],
      allEdges: [],
      stepOutputs: {},
    };

    const result = await executeWithRegistry(context);
    expect(result.outputsToStore["mynode1"]).toBeDefined();
  });
});
```

### Manual Testing Checklist

- [ ] Node xuất hiện trong Sidebar
- [ ] Click node → ConfigPanel mở với custom form
- [ ] Form validation hoạt động (nhập sai → error message)
- [ ] Token input hoạt động (nhập `{{steps.manual1.field}}`)
- [ ] Drag-drop fields từ DataFieldsPanel vào form
- [ ] Click RUN → node chạy và có loading state
- [ ] Output hiển thị trong ResultPanel
- [ ] Storage key correct trong stepOutputs
- [ ] Downstream node có thể access output qua token
- [ ] Error handling hoạt động (cố tình gây lỗi)

---

## 🔍 Troubleshooting

### Issue: Node không xuất hiện trong Sidebar

**Check**:
- [ ] Node đã được register trong `nodes/index.ts`?
- [ ] `nodeDefinitionsArray` include node?
- [ ] NodeDefinition export đúng format?

### Issue: Form không hiển thị

**Check**:
- [ ] `FormComponent` được set trong NodeDefinition?
- [ ] Component export đúng (named export)?
- [ ] Import path đúng?

### Issue: Output không được store

**Check**:
- [ ] Runtime return đúng format `{ output: ... }`?
- [ ] Executor return `outputsToStore` với correct key?
- [ ] `isBranchingNode` flag đúng?

### Issue: Token không resolve

**Check**:
- [ ] Storage key format đúng?
  - Single: `steps.nodeKey`
  - Branch: `steps.nodeKey-label`
- [ ] Token syntax đúng `{{steps.key.field}}`?
- [ ] Field path exists trong output?

### Issue: Branching node output sai

**Check**:
- [ ] Runtime return `{ outputs: [{label, data}] }` chứ không phải `{ output: {...} }`?
- [ ] BranchExecutor detect node type đúng (`canHandle` return true)?
- [ ] Branch labels đúng format (uppercase cho IF, `case_N` cho SWITCH)?

### Issue: Loop không execute downstream

**Check**:
- [ ] LoopExecutor có được register trong registry?
- [ ] Downstream edge exists?
- [ ] Downstream node definition loaded?
- [ ] `$item` token được pass vào context?

### Issue: Advanced options không work

**Check**:
- [ ] `applyAdvancedOptions` được gọi trong flow-store?
- [ ] Options được apply AFTER executor return?
- [ ] Options config đúng format (wait, sort, limit)?

---

## 📚 Best Practices

### 1. Code Organization

✅ **DO**:
- Tách logic ra functions nhỏ, testable
- Sử dụng TypeScript strict mode
- Comment code phức tạp
- Follow naming conventions

❌ **DON'T**:
- Hardcode values
- Mix UI logic với business logic
- Duplicate code across nodes
- Ignore TypeScript errors

### 2. Error Handling

✅ **DO**:
```typescript
try {
  const result = processData(input);
  return { output: result, status: "success" };
} catch (error) {
  return {
    output: null,
    status: "error",
    error: error instanceof Error ? error.message : String(error),
  };
}
```

❌ **DON'T**:
```typescript
// Silent errors
const result = processData(input); // Might throw
return { output: result };

// Swallow errors
try {
  // ...
} catch {
  // Do nothing
}
```

### 3. Performance

✅ **DO**:
- Lazy load heavy dependencies
- Memoize expensive computations
- Use React.memo cho components
- Optimize re-renders với useCallback/useMemo

❌ **DON'T**:
- Import toàn bộ lodash (`import _ from 'lodash'`)
- Re-render form mỗi keystroke nếu không cần
- Process large arrays synchronously

### 4. Documentation

✅ **DO**:
- Document mọi node trong README.md
- Include examples trong docs
- Comment complex algorithms
- Keep docs up-to-date

❌ **DON'T**:
- Assume code is self-documenting
- Leave outdated comments
- Skip README for "simple" nodes

---

## 🔐 Security Considerations

### 1. Input Validation

**ALWAYS validate user input với Zod schema**

```typescript
// ✅ GOOD
const config = myNodeConfigSchema.parse(args.resolvedConfig);

// ❌ BAD
const config = args.resolvedConfig as MyNodeConfig;
```

### 2. Token Resolution

**Sanitize tokens để prevent injection**

```typescript
// Token resolution đã built-in sanitization trong expression.ts
// Không eval() raw tokens!
```

### 3. HTTP Requests

**Validate URLs và sanitize headers**

```typescript
// ✅ GOOD
const url = new URL(config.url); // Throws if invalid
const headers = sanitizeHeaders(config.headers);

// ❌ BAD
fetch(config.url); // No validation
```

---

## 📈 Performance Tips

### 1. Lazy Loading

```typescript
// Lazy load node definitions
const nodeDefinitions = require("../../nodes").nodeDefinitions;
```

### 2. Batch Processing

```typescript
// Process items in batches
const batchSize = 100;
for (let i = 0; i < items.length; i += batchSize) {
  const batch = items.slice(i, i + batchSize);
  await processBatch(batch);
}
```

### 3. Memoization

```typescript
// Memoize expensive token resolution
const memoizedResolve = React.useMemo(
  () => resolveTokens(config, stepOutputs),
  [config, stepOutputs]
);
```

---

## 🎓 Learning Resources

### Internal Docs
- `OUTPUT_FORMAT_STANDARD.md` - Output format chi tiết
- `UTILS_README.md` - Runtime utilities
- Node-specific READMEs trong mỗi node folder

### External Resources
- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [ReactFlow Documentation](https://reactflow.dev/)
- [Zustand Guide](https://github.com/pmndrs/zustand)

---

## 📞 Support

Nếu gặp vấn đề khi develop:

1. Check troubleshooting section ở trên
2. Review existing node implementations (http, if, loop làm examples tốt)
3. Read OUTPUT_FORMAT_STANDARD.md
4. Check execution layer code trong `state/execution/`
5. Test với simple workflow trước khi complex

---

**Cuối cùng**: Code clean, test kỹ, document đầy đủ! 🚀
