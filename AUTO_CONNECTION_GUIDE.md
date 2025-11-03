# Auto Connection & Data Flow Guide

## 🔗 Automatic Edge Creation

Khi bạn thêm node vào canvas, hệ thống **TỰ ĐỘNG** tạo connections (edges) giữa các nodes theo thứ tự:

```
Manual → HTTP → Filter → SetVariable → ...
```

### Code Implementation

File: `apps/web/src/components/FlowCanvas.tsx`

```tsx
// Auto-generate edges based on step order (simple pipeline)
const flowEdges: Edge[] = [];
for (let i = 0; i < steps.length - 1; i++) {
  flowEdges.push({
    id: `e${steps[i].key}-${steps[i + 1].key}`,
    source: steps[i].key,
    target: steps[i + 1].key,
    type: "smoothstep",
    animated: false,
  });
}
```

**Lợi ích:**
- ✅ Không cần kéo edge thủ công
- ✅ Tự động layout với dagre
- ✅ Tự động fit view với padding
- ✅ Animation mượt mà khi thêm/xóa node

---

## 📦 Automatic Previous Data Passing

Hệ thống **TỰ ĐỘNG** truyền output của node trước vào node hiện tại qua `__previousOutput`:

### Code Implementation

File: `apps/web/src/state/flow-store.ts`

```tsx
// Tự động truyền output của node trước vào tất cả các node (trừ Manual trigger)
if (step.schemaKey !== "manual") {
  const currentIndex = state.steps.findIndex((s) => s.key === stepKey);
  if (currentIndex > 0) {
    const previousStep = state.steps[currentIndex - 1];
    const previousOutput = state.stepOutputs[previousStep.key];
    if (previousOutput !== undefined) {
      resolvedConfig = { ...resolvedConfig, __previousOutput: previousOutput };
    }
  }
}
```

**Cách sử dụng trong node runtime:**

```typescript
export async function runFilterNode(args: NodeRuntimeArgs): Promise<NodeRuntimeResult> {
  // Lấy data từ node trước
  const previousData = args.resolvedConfig.__previousOutput || {};
  
  // Xử lý array data
  let arrayToFilter: unknown[] = [];
  if (Array.isArray(previousData)) {
    arrayToFilter = previousData;
  } else if (previousData && typeof previousData === "object") {
    // Tìm array field trong object
    const firstArray = Object.values(previousData).find(v => Array.isArray(v));
    if (firstArray) arrayToFilter = firstArray as unknown[];
  }
  
  // Filter logic...
}
```

---

## 🆕 Thêm Node Mới

Khi tạo node mới, **KHÔNG CẦN** sửa gì trong flow-store.ts!

### Trước đây (❌ Cách cũ - phải nhớ update):

```tsx
// Phải thêm vào list mỗi khi có node mới
if (step.schemaKey === "if" || 
    step.schemaKey === "switch" || 
    step.schemaKey === "filter") {  // ← Quên thêm dòng này = BUG!
  // ...
}
```

### Bây giờ (✅ Cách mới - tự động):

```tsx
// Tất cả nodes (trừ manual) tự động nhận previousOutput
if (step.schemaKey !== "manual") {
  // Tự động áp dụng cho: http, if, switch, filter, formatter, setVariable, ...
}
```

---

## 📋 Checklist Khi Tạo Node Mới

1. ✅ **Tạo node definition** trong `apps/web/src/nodes/[nodeName]/`
   - `index.ts` - Export NodeDefinition
   - `schema.ts` - Zod schema + FieldDef[]
   - `runtime.ts` - Node execution logic

2. ✅ **Register node** trong `apps/web/src/nodes/index.ts`
   ```tsx
   import { myNewNode } from "./myNew";
   export const nodeDefinitions = [..., myNewNode];
   ```

3. ✅ **Add to Sidebar** trong `apps/web/src/components/Sidebar.tsx`
   ```tsx
   const handleAddNode = (key: string) => {
     if (key === "manual" || key === "http" || ... || key === "myNew") {
       addStep(key);
     }
   };
   ```

4. ✅ **Update NodeDefinitionKey type** trong `apps/web/src/nodes/types.ts`
   ```tsx
   export type NodeDefinitionKey = 
     | "manual" | "http" | ... | "myNew";
   ```

5. ✅ **KHÔNG CẦN** sửa flow-store.ts - previousOutput tự động!

---

## 🔍 Debug Previous Data

Nếu node không nhận được data, check:

1. **Node trước đã run chưa?**
   ```
   Manual node PHẢI run trước → Tạo output → Filter node mới có data
   ```

2. **Console logs:**
   ```tsx
   console.log("[Node Runtime] Previous data:", args.resolvedConfig.__previousOutput);
   ```

3. **Step outputs trong Zustand:**
   ```tsx
   const stepOutputs = useFlowStore((state) => state.stepOutputs);
   console.log("All outputs:", stepOutputs);
   ```

---

## 🎯 Best Practices

1. **Manual Node:** Luôn là node đầu tiên, không nhận previousOutput
2. **Filter/IF/Switch:** Tự động nhận array từ node trước
3. **HTTP:** Có thể nhận previousOutput để transform request
4. **SetVariable:** Có thể nhận previousOutput để tạo biến mới
5. **Formatter:** Có thể nhận previousOutput để transform data

---

## 📊 Data Flow Example

```
Manual Node (trigger)
  ↓ output: [{id:1}, {id:2}, {id:3}]
  
HTTP Node (optional transform)
  ↓ previousOutput: [{id:1}, {id:2}, {id:3}]
  ↓ output: [{id:1, status:"ok"}, ...]
  
Filter Node (conditional filtering)
  ↓ previousOutput: [{id:1, status:"ok"}, ...]
  ↓ conditions: id == 2
  ↓ output: [{id:2, status:"ok"}]
  
SetVariable Node (extract field)
  ↓ previousOutput: [{id:2, status:"ok"}]
  ↓ output: {selectedId: 2, selectedStatus: "ok"}
```

---

## ✅ Summary

- **Auto Edges:** ✅ FlowCanvas tự động tạo connections
- **Auto Layout:** ✅ Dagre tự động sắp xếp nodes
- **Auto Data:** ✅ flow-store tự động truyền previousOutput
- **No Manual Work:** ✅ Không cần nhớ update danh sách nodes

**Kết quả:** Chỉ cần tạo node definition → Register → Hệ thống tự động xử lý phần còn lại! 🚀
