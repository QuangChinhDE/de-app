# 🔢 LIMIT Node

Slice/paginate arrays with skip and limit parameters.

## 📋 Chức năng

**Limit Node** cho phép giới hạn số lượng items trong array bằng cách skip một số items và lấy một số lượng items nhất định. Node này giống như SQL `LIMIT` và `OFFSET`.

## 🎨 UI Components (Custom Form)

**Form Component**: `LimitForm.tsx` (~160 lines)

**Features**:
- ✅ TokenizedInput cho items array
- ✅ Skip number input (số items bỏ qua)
- ✅ Limit number input (số items lấy)
- ✅ Range preview box showing slice range (e.g., "0 → 10")
- ✅ Total items preview
- ✅ Visual indicators với calculation

**Dependencies**:
- React Hook Form + Zod validation
- Design system primitives (Input, Button)
- TokenizedInput component

## 🎯 Khi nào sử dụng

- **Pagination**: Implement pagination cho lists
- **Top N Items**: Lấy top 10, top 100 items
- **Skip First Items**: Bỏ qua header rows hoặc first N items
- **Sample Data**: Lấy subset để test trước khi process full data
- **Rate Limiting**: Giới hạn số items per batch

## ⚙️ Cấu hình

### 1. Items
Array cần slice/limit.

**Type**: Array (required)
**Input**: Token như `{{steps.xxx}}` hoặc previous output
**Example**: `{{steps.http1.body.users}}`

### 2. Skip
Số lượng items cần bỏ qua từ đầu array.

**Type**: Number (>= 0)
**Default**: 0
**Example**: 
- Skip = 0: Bắt đầu từ item đầu tiên
- Skip = 10: Bỏ qua 10 items đầu, bắt đầu từ item thứ 11

### 3. Limit
Số lượng items tối đa cần lấy sau khi skip.

**Type**: Number (> 0)
**Default**: 10
**Example**:
- Limit = 10: Lấy tối đa 10 items
- Limit = 100: Lấy tối đa 100 items

### 4. Range Preview
Form tự động hiển thị:
- **Range**: `skip → skip + limit` (e.g., "0 → 10", "10 → 20")
- **Total Items**: Tổng số items sẽ được output

## 📖 Ví dụ

### Ví dụ 1: Top 10 Items
Input array (100 items):
```json
[
  {"id": 1, "name": "Item 1", "score": 95},
  {"id": 2, "name": "Item 2", "score": 90},
  ...
  {"id": 100, "name": "Item 100", "score": 10}
]
```

**Config**:
```
Items: {{steps.manual1}}
Skip: 0
Limit: 10
```

**Preview**: `0 → 10` (Total Items: 10)

**Output**: First 10 items (id 1-10)

---

### Ví dụ 2: Pagination - Page 2
Input array (100 items):
```json
[{"id": 1}, {"id": 2}, ..., {"id": 100}]
```

**Config**:
```
Items: {{steps.manual1}}
Skip: 10
Limit: 10
```

**Preview**: `10 → 20` (Total Items: 10)

**Output**: Items 11-20 (second page)

**Pagination Pattern**:
- Page 1: Skip = 0, Limit = 10
- Page 2: Skip = 10, Limit = 10
- Page 3: Skip = 20, Limit = 10
- Page N: Skip = (N-1) * 10, Limit = 10

---

### Ví dụ 3: Skip Header + Limit
Input array (CSV-like data):
```json
[
  {"row": "Header", "col1": "Name", "col2": "Age"},
  {"row": 1, "col1": "Alice", "col2": 25},
  {"row": 2, "col1": "Bob", "col2": 30},
  ...
]
```

**Config**:
```
Skip: 1  (skip header)
Limit: 10
```

**Preview**: `1 → 11` (Total Items: 10)

**Output**: Items 2-11 (skip header row)

---

### Ví dụ 4: Large Dataset Sampling
Input array (10,000 items):

**Config**:
```
Skip: 0
Limit: 100
```

**Preview**: `0 → 100` (Total Items: 100)

**Output**: First 100 items for testing

## 💡 Tips & Best Practices

1. **Pagination Formula**:
   ```
   Skip = (PageNumber - 1) * ItemsPerPage
   Limit = ItemsPerPage
   ```

2. **Check Array Length**:
   - Use `{{steps.http1.length}}` để biết total items
   - Nếu Skip >= array.length → Empty array

3. **Combine with Sort**:
   ```
   Sort (by score DESC) → Limit (top 10)
   ```

4. **Use with Loop**:
   ```
   HTTP (get 1000 items) → Limit (100) → Loop → Process
   ```

5. **Token Support**:
   - Items: `{{steps.xxx}}`
   - Skip: `{{steps.manual1.offset}}`
   - Limit: `{{steps.manual1.pageSize}}`

## ⚠️ Lưu ý

- **Array Required**: Input phải là array, nếu không sẽ return empty array
- **Out of Bounds**: Nếu Skip > array.length → Empty array
- **Partial Results**: Nếu Skip + Limit > array.length → Return remaining items only
- **Zero-based**: Array indexing starts at 0

**Examples**:
```javascript
Array: [1, 2, 3, 4, 5]

Skip=0, Limit=3  → [1, 2, 3]
Skip=2, Limit=2  → [3, 4]
Skip=4, Limit=10 → [5]
Skip=10, Limit=5 → []
```

## 🔧 Development Guide

### Cách Update Node

#### 1. Thay đổi Schema (`schema.ts`)
```typescript
export const limitConfigSchema = z.object({
  items: z.string().min(1), // Token string
  skip: z.number().min(0).default(0),
  limit: z.number().positive().default(10),
  maxLimit: z.number().optional(), // NEW: Max limit constraint
});

export type LimitConfig = z.infer<typeof limitConfigSchema>;
```

#### 2. Thêm Feature Mới (`LimitForm.tsx`)
```typescript
// Add max limit validation
const maxLimit = watch("maxLimit");

<Input
  label="Max Limit (Optional)"
  type="number"
  {...register("maxLimit", { valueAsNumber: true })}
/>

{maxLimit && watch("limit") > maxLimit && (
  <p className="text-red-500 text-sm">
    Limit cannot exceed {maxLimit}
  </p>
)}

// Enhanced preview
const previewText = () => {
  const skip = watch("skip") || 0;
  const limit = watch("limit") || 10;
  const end = skip + limit;
  
  return (
    <div className="p-3 bg-blue-50 rounded">
      <p className="font-mono">Range: {skip} → {end}</p>
      <p className="text-sm text-gray-600">Total Items: {limit}</p>
      {maxLimit && limit > maxLimit && (
        <p className="text-red-500">⚠️ Exceeds max limit</p>
      )}
    </div>
  );
};
```

#### 3. Update Runtime Logic (`runtime.ts`)
```typescript
export const limitRuntime: NodeRuntime<LimitConfig> = {
  async execute(config, context) {
    const { items, skip, limit, maxLimit } = config;
    
    // Resolve items token
    const resolvedItems = resolveExpression(items, context);
    
    // Ensure array
    const inputArray = Array.isArray(resolvedItems) 
      ? resolvedItems 
      : [resolvedItems];
    
    // Apply max limit constraint
    const effectiveLimit = maxLimit 
      ? Math.min(limit, maxLimit) 
      : limit;
    
    // Slice array
    const result = inputArray.slice(skip, skip + effectiveLimit);
    
    return {
      success: true,
      data: result,
      metadata: {
        totalInput: inputArray.length,
        skip,
        limit: effectiveLimit,
        totalOutput: result.length,
      },
    };
  },
};
```

#### 4. Testing Checklist
- [ ] Test với skip=0, limit=10 (first page)
- [ ] Test với skip=10, limit=10 (second page)
- [ ] Test với skip > array.length (should return [])
- [ ] Test với limit > array.length (should return all remaining)
- [ ] Test với skip + limit > array.length (partial results)
- [ ] Test token resolution trong items field
- [ ] Test dynamic skip/limit từ previous step
- [ ] Verify range preview calculation
- [ ] Test với empty array input
- [ ] Test với non-array input (should return [])

## 🐛 Troubleshooting

**Empty array output**:
- Check skip value (không vượt quá array length)
- Verify items token resolves correctly
- Check input is actually an array

**Wrong items returned**:
- Verify skip calculation: `(page - 1) * limit`
- Check limit value is positive
- Ensure array indexing starts at 0

**Range preview không match output**:
- Refresh form after changing values
- Check if skip/limit values are numbers (not strings)
