# Item Lineage Tracking - n8n Pattern Implementation

## 🎯 Mục tiêu: "Luôn luôn đúng" như n8n

Để đảm bảo Result Panel luôn hiển thị đúng branch, không phụ thuộc UI state hay graph changes, chúng ta implement **3 lớp bảo đảm** của n8n:

---

## Layer 1: Dòng dõi dữ liệu theo item (Item Lineage)

### Concept
Mỗi output item **"chỉ tay"** về input item gốc của nó. n8n gọi là **pairedItem**.

### Implementation

#### Type Definition (`packages/types/src/index.ts`)
```typescript
export interface INodeExecutionData {
  json: Record<string, unknown>;
  pairedItem?: {
    item: number;  // Index of input item
    input: number; // Input index (0, 1, 2 for MERGE inputs)
  } | Array<{item: number; input: number}>;
}

export interface INodeExecutionOutput {
  output: INodeExecutionData[][];  // output[0] = TRUE, output[1] = FALSE
  outputLabels?: string[];         // ["TRUE", "FALSE"]
}
```

#### Example: IF Node Execution
```typescript
// Input: [item0, item1, item2]
// IF evaluates: item0→TRUE, item1→FALSE, item2→TRUE

executionData = {
  output: [
    // Output 0 (TRUE branch)
    [
      { json: item0, pairedItem: { item: 0, input: 0 } },
      { json: item2, pairedItem: { item: 2, input: 0 } }
    ],
    // Output 1 (FALSE branch)
    [
      { json: item1, pairedItem: { item: 1, input: 0 } }
    ]
  ],
  outputLabels: ["TRUE", "FALSE"]
}
```

### Benefits
- ✅ **Item-level precision**: Biết chính xác item nào đi qua nhánh nào
- ✅ **Merge-safe**: Xử lý được trường hợp items từ nhiều nhánh merge lại
- ✅ **Traceable**: Lần ngược lineage từ downstream về upstream

---

## Layer 2: Ảnh chụp thực thi bất biến (Immutable Execution Snapshot)

### Concept
UI đọc dữ liệu từ **execution run đã lưu**, không đọc trạng thái graph đang sửa.

### Implementation

#### RunRecord Storage
```typescript
export type RunRecord = {
  stepKey: string;
  
  // NEW: Immutable execution snapshot
  executionData?: INodeExecutionOutput;
  
  // OLD: Raw output (backward compat)
  output?: unknown;
  
  // Metadata
  at: string;
  durationMs?: number;
  status?: number;
}
```

#### Priority Hierarchy
```
1. executionData (item lineage) - HIGHEST PRIORITY
    ↓ (if not available)
2. source[] (node-level tracking)
    ↓ (if not available)  
3. Graph edges (metadata only)
    ↓ (if not available)
4. Empty state
```

### Benefits
- ✅ **Time-travel debugging**: Xem lại run cũ mà không bị ảnh hưởng bởi graph hiện tại
- ✅ **Consistent UX**: UI không nhảy branch khi user đổi dây
- ✅ **Audit trail**: Biết chính xác data flow tại thời điểm run

---

## Layer 3: Khoá nhánh theo item (Per-Item Branch Lock)

### Concept
Phân tích **tất cả items** trong target node để xác định chúng từ nhánh nào.

### Logic

#### Case 1: All items from single branch
```typescript
Target node items: [item1, item2, item3]
Trace lineage → All from IF.TRUE

Result: branches[IF] = "TRUE" (LOCKED)
UI: "🎯 Connected branch: TRUE" (no dropdown)
```

#### Case 2: Mixed branches (after Merge)
```typescript
Target node items: [item1, item2, item3, item4]
Trace lineage → item1,item2 from IF.TRUE; item3,item4 from IF.FALSE

Result: branches[IF] = "MIXED"
UI: "⚠️ Multiple branches: TRUE + FALSE" (per-item view)
```

#### Case 3: Viewing source node itself
```typescript
selectedStepKey = "if1"
resultNodeKey = "if1"
isViewingSelfNode = true

Result: connectedBranch = undefined (forced)
UI: "🔀 Branch: [SELECT]" (dropdown enabled)
```

### Implementation

#### Utility Function (`utils/run-data.ts`)
```typescript
export function traceBranchesFromItems(
  items: INodeExecutionData[],
  sourceNode: RunRecord | undefined
): Set<string> {
  const branches = new Set<string>();
  
  for (const item of items) {
    const paired = Array.isArray(item.pairedItem) 
      ? item.pairedItem 
      : [item.pairedItem];
    
    for (const pair of paired) {
      // Check which output array this item came from
      for (let outputIdx = 0; outputIdx < sourceNode.executionData.output.length; outputIdx++) {
        if (pair.item < sourceNode.executionData.output[outputIdx].length) {
          const branchLabel = sourceNode.executionData.outputLabels?.[outputIdx];
          if (branchLabel) branches.add(branchLabel);
        }
      }
    }
  }
  
  return branches;
}
```

#### Branch Resolution (`getBranchConnection`)
```typescript
export function getBranchConnection(
  sourceNodeKey: string,
  targetNodeKey: string,
  targetRunRecord: RunRecord,
  sourceRunRecord: RunRecord,
  edges: CustomEdge[],
  steps: StepInstance[]
): {
  branch?: string;
  outputIndex?: number;
  isMixed: boolean;
  itemCount?: number;
} {
  // Priority 1: Item lineage (most accurate)
  if (targetRunRecord?.executionData && sourceRunRecord?.executionData) {
    const targetItems = targetRunRecord.executionData.output[0];
    const tracedBranches = traceBranchesFromItems(targetItems, sourceRunRecord);
    
    if (tracedBranches.size > 1) {
      return { isMixed: true, itemCount: targetItems.length };
    }
    
    if (tracedBranches.size === 1) {
      const branch = Array.from(tracedBranches)[0];
      return { branch, isMixed: false, itemCount: targetItems.length };
    }
  }
  
  // Priority 2: Node-level source tracking
  // Priority 3: Graph edges
  // ...
}
```

### Benefits
- ✅ **Smart branch detection**: Tự động phát hiện MIXED case
- ✅ **Merge-aware**: Xử lý đúng node nhận từ nhiều nhánh
- ✅ **Self-node aware**: Phân biệt xem chính node hay downstream

---

## 🧪 Test Scenarios

### Scenario 1: IF → TRUE → SET1
```
1. Run IF → outputs: TRUE[item1, item2], FALSE[item3]
2. Run SET1 → receives: [item1, item2] (pairedItem → IF.TRUE)
3. Select SET1 → Result shows IF with "🎯 Connected: TRUE" (LOCKED)
4. Can drag fields from IF.TRUE branch only
```

### Scenario 2: IF → TRUE → SET2, IF → FALSE → SET3
```
1. Run IF → TRUE[...], FALSE[...]
2. Run SET2 → receives items from TRUE (lineage tracked)
3. Run SET3 → receives items from FALSE (lineage tracked)
4. Select SET2 → "🎯 Connected: TRUE"
5. Select SET3 → "🎯 Connected: FALSE"
6. Each sees only their branch ✅
```

### Scenario 3: IF → MERGE → SET (Mixed)
```
1. IF outputs: TRUE[item1, item2], FALSE[item3]
2. MERGE collects: [item1, item2, item3]
3. MERGE items have pairedItem pointing to different IF outputs
4. SET receives merged items
5. traceBranchesFromItems() returns Set{"TRUE", "FALSE"}
6. Result shows: "⚠️ Multiple branches" ✅
```

### Scenario 4: View IF node itself
```
1. Select IF1 on canvas
2. Result panel auto-selects IF1
3. isViewingSelfNode = true
4. connectedBranch = undefined
5. Dropdown enabled: "🔀 Branch: [TRUE/FALSE]"
6. User can freely select branch to view ✅
```

### Scenario 5: Graph changed after run
```
1. Run workflow: IF → TRUE → SET1
2. User disconnects edge, reconnects to FALSE
3. Result panel still shows run data from step 1
4. "🎯 Connected: TRUE" (from run record, not graph)
5. Execution snapshot immutable ✅
```

---

## 📊 Comparison: Before vs After

### Before (Node-level tracking)
```typescript
// Only knew: "SET1 receives from IF"
source: [{previousNode: "if1", outputKey: "TRUE"}]

Problem: What if items came from multiple branches?
→ Can't detect MIXED case accurately
```

### After (Item-level lineage)
```typescript
// Know for each item: "item0 from IF.TRUE, item1 from IF.FALSE"
executionData: {
  output: [[
    {json: item0, pairedItem: {item: 0, input: 0}},  // From TRUE
    {json: item1, pairedItem: {item: 1, input: 0}}   // From FALSE
  ]]
}

Solution: traceBranchesFromItems() → Set{"TRUE", "FALSE"} → MIXED ✅
```

---

## 🔧 Usage in UI Components

### ResultPanel
```typescript
const connectedBranches = useMemo(() => {
  const targetRunRecord = stepRunStates[selectedStepKey]?.lastRun;
  
  for (const sourceKey of sourceNodes) {
    const sourceRunRecord = stepRunStates[sourceKey]?.lastRun;
    
    const connection = getBranchConnection(
      sourceKey,
      selectedStepKey,
      targetRunRecord,
      sourceRunRecord,  // Pass for item lineage tracing
      customEdges,
      steps
    );
    
    if (connection.isMixed) {
      branches[sourceKey] = "MIXED";
    } else if (connection.branch) {
      branches[sourceKey] = connection.branch;
    }
  }
}, [selectedStepKey, stepRunStates, ...]);
```

### DataFieldsPanel
```typescript
const isViewingSelfNode = selectedStepKey === selectedNode;
const connectedBranch = !isViewingSelfNode 
  ? connectedBranches?.[selectedNode] 
  : undefined;

// UI Logic
if (connectedBranch === "MIXED") {
  // Show "⚠️ Multiple branches" banner
  // Display all branches merged
}
else if (connectedBranch) {
  // Show "🎯 Connected branch: TRUE" banner (LOCKED)
  // Display only this branch data
}
else if (branches.length > 0) {
  // Show "🔀 Branch: [SELECT]" dropdown
  // User can choose branch to view
}
```

---

## 🎯 Key Takeaways

### Why This Works
1. **Item-level precision** → Can detect mixed branches accurately
2. **Immutable snapshots** → Not affected by graph changes
3. **Priority hierarchy** → Always use best available data source
4. **Self-awareness** → Distinguish viewing self vs viewing as upstream

### n8n Principles Applied
✅ **Item lineage** (pairedItem tracking)  
✅ **Execution snapshots** (immutable run data)  
✅ **Per-item branch lock** (smart MIXED detection)  
✅ **Fallback hierarchy** (run data > graph > empty)  

### Result
**"Luôn luôn đúng"** - UI always shows correct branch regardless of:
- Graph state changes
- When edge was connected
- Multi-branch scenarios
- Viewing self vs downstream

---

## 📚 References

- n8n Architecture: Item-based execution model
- n8n pairedItem: Item lineage tracking
- n8n Execution Data: Immutable snapshots
- n8n Branch Handling: Per-item resolution
