# 🔍 FILTER Node Guide

## Tổng Quan

**FILTER Node** là node dùng để lọc mảng dữ liệu với nhiều điều kiện đồng thời (AND logic). Khác với IF node (split TRUE/FALSE) và Switch node (route theo giá trị), Filter node tập trung vào việc **lọc và tách riêng** các items thỏa mãn điều kiện phức tạp.

---

## ✨ Đặc Điểm

### So Sánh với IF và Switch

| Feature | IF Node | Switch Node | **Filter Node** |
|---------|---------|-------------|----------------|
| Mục đích | Split TRUE/FALSE | Route theo giá trị | **Lọc với nhiều điều kiện** |
| Số điều kiện | 1 điều kiện | 1 field, N cases | **N điều kiện (AND)** |
| Output | TRUE, FALSE | case_0, case_1, default | **filtered, removed** |
| Logic | Single condition | Value matching | **Multiple conditions** |

### Khi Nào Dùng Filter?

✅ **Dùng Filter khi:**
- Cần lọc với **nhiều điều kiện đồng thời**
- Ví dụ: Lọc users có `age > 18 AND status == "active" AND city == "HN"`
- Muốn tách riêng items **thỏa mãn** vs **không thỏa mãn**

❌ **Không dùng Filter khi:**
- Chỉ có 1 điều kiện đơn giản → Dùng **IF node**
- Cần route theo giá trị cụ thể → Dùng **Switch node**

---

## 🎯 Config Schema

### 1. Filter Conditions (JSON String)

Danh sách điều kiện dạng JSON array. Mỗi condition có:
- **field**: Token path (e.g., `{{steps.manual1.age}}`)
- **fieldType**: Type của field (`string`, `number`, `boolean`, `date`, `array`, `object`)
- **operator**: Operator phù hợp với type
- **value**: Giá trị so sánh

```json
[
  {
    "field": "{{steps.manual1.age}}",
    "fieldType": "number",
    "operator": ">=",
    "value": "18"
  },
  {
    "field": "{{steps.manual1.status}}",
    "fieldType": "string",
    "operator": "is equal to",
    "value": "active"
  }
]
```

### 2. Field Types & Operators

#### String Type
- `is equal to` / `is not equal to`
- `contains` / `does not contain`
- `starts with` / `does not start with`
- `ends with` / `does not end with`
- `matches regex` / `does not match regex`
- `is empty` / `is not empty`
- `exists` / `does not exist`

#### Number Type
- `is equal to` / `is not equal to`
- `is greater than` / `is less than`
- `is greater than or equal to` / `is less than or equal to`
- `is empty` / `is not empty`
- `exists` / `does not exist`

#### Boolean Type
- `is true` / `is false`
- `is equal to` / `is not equal to`
- `is empty` / `is not empty`
- `exists` / `does not exist`

#### Date & Time Type
- `is equal to` / `is not equal to`
- `is after` / `is before`
- `is after or equal to` / `is before or equal to`
- `is empty` / `is not empty`
- `exists` / `does not exist`

#### Array Type
- `contains` / `does not contain`
- `length equal to` / `length not equal to`
- `length greater than` / `length less than`
- `length greater than or equal to` / `length less than or equal to`
- `is empty` / `is not empty`
- `exists` / `does not exist`

### 3. Logic Operator

- **AND**: Tất cả conditions phải đúng (mặc định)
- **OR**: Ít nhất 1 condition phải đúng

### 4. Mode

- **`include`**: Giữ lại items thỏa mãn điều kiện (mặc định)
- **`exclude`**: Loại bỏ items thỏa mãn điều kiện

---

## 📥 Input/Output

### Input
- **`input`**: Mảng dữ liệu cần lọc (từ node trước)

### Output Structure

```typescript
{
  filtered: [],    // Items thỏa mãn điều kiện
  removed: [],     // Items không thỏa mãn
  summary: {
    total: 10,
    filtered: 3,
    removed: 7
  }
}
```

---

## 🚀 Examples

### Example 1: Lọc Users Active và Trưởng Thành

**Input data:**
```json
[
  { "id": 1, "name": "An", "age": 25, "status": "active" },
  { "id": 2, "name": "Bình", "age": 17, "status": "active" },
  { "id": 3, "name": "Chi", "age": 30, "status": "inactive" },
  { "id": 4, "name": "Dũng", "age": 22, "status": "active" }
]
```

**Config:**
```json
{
  "conditions": "[{\"field\":\"{{steps.manual1.age}}\",\"fieldType\":\"number\",\"operator\":\">=\",\"value\":\"18\"},{\"field\":\"{{steps.manual1.status}}\",\"fieldType\":\"string\",\"operator\":\"is equal to\",\"value\":\"active\"}]",
  "mode": "include",
  "logic": "AND"
}
```

**Output:**
```json
{
  "filtered": [
    { "id": 1, "name": "An", "age": 25, "status": "active" },
    { "id": 4, "name": "Dũng", "age": 22, "status": "active" }
  ],
  "removed": [
    { "id": 2, "name": "Bình", "age": 17, "status": "active" },
    { "id": 3, "name": "Chi", "age": 30, "status": "inactive" }
  ],
  "summary": { "total": 4, "filtered": 2, "removed": 2 }
}
```

### Example 2: Lọc Products Trong Khoảng Giá (AND Logic)

**Config:**
```json
{
  "conditions": "[{\"field\":\"{{steps.http1.price}}\",\"fieldType\":\"number\",\"operator\":\">=\",\"value\":\"100000\"},{\"field\":\"{{steps.http1.price}}\",\"fieldType\":\"number\",\"operator\":\"<=\",\"value\":\"500000\"},{\"field\":\"{{steps.http1.category}}\",\"fieldType\":\"string\",\"operator\":\"is equal to\",\"value\":\"electronics\"}]",
  "mode": "include",
  "logic": "AND"
}
```

➡️ Lọc sản phẩm điện tử có giá từ 100k-500k (tất cả điều kiện đúng)

### Example 3: Exclude Mode - Loại Bỏ Spam

**Config:**
```json
{
  "conditions": "[{\"field\":\"{{steps.manual1.email}}\",\"fieldType\":\"string\",\"operator\":\"contains\",\"value\":\"spam\"}]",
  "mode": "exclude",
  "logic": "AND"
}
```

➡️ Loại bỏ emails có chứa từ "spam"

### Example 4: OR Logic - Lọc Multiple Categories

**Config:**
```json
{
  "conditions": "[{\"field\":\"{{steps.http1.category}}\",\"fieldType\":\"string\",\"operator\":\"is equal to\",\"value\":\"electronics\"},{\"field\":\"{{steps.http1.category}}\",\"fieldType\":\"string\",\"operator\":\"is equal to\",\"value\":\"books\"}]",
  "mode": "include",
  "logic": "OR"
}
```

➡️ Lọc sản phẩm thuộc electronics HOẶC books (ít nhất 1 điều kiện đúng)

---

## ⚠️ Type Validation

### Auto Type Detection

Filter node tự động phát hiện type của data và so sánh với `fieldType` bạn chọn:

```
Sample data: { "age": 25, "name": "John" }

✅ CORRECT:
- field: {{steps.manual1.age}}, fieldType: number
- field: {{steps.manual1.name}}, fieldType: string

❌ WRONG (will show warning):
- field: {{steps.manual1.age}}, fieldType: string ← age là number!
- field: {{steps.manual1.name}}, fieldType: number ← name là string!
```

### Type Mismatch Warning

Nếu chọn sai type, filter vẫn chạy nhưng sẽ có **warning** trong `summary.warnings`:

```json
{
  "filtered": [...],
  "removed": [...],
  "summary": {
    "total": 10,
    "filtered": 3,
    "removed": 7,
    "warnings": [
      "Field 'age': expected type 'string' but got 'number'"
    ]
  }
}
```

### Best Practice

1. **Check DATA panel** để xem type thực tế của field
2. **Chọn đúng fieldType** trước khi chọn operator
3. **Xem warnings** trong summary nếu kết quả không đúng

## 🔧 Implementation Details

### Dynamic Operators

Khi thay đổi `fieldType`, danh sách operators tự động update:
- String → shows: "is equal to", "contains", "starts with", etc.
- Number → shows: "is greater than", "is less than", etc.
- Boolean → shows: "is true", "is false"

### Token Resolution Logic

Giống IF và Switch, Filter sử dụng **original token** trước khi resolve:

```typescript
// ❌ SAI - Dùng resolved value
const fieldPath = args.resolvedConfig.field; // "active"

// ✅ ĐÚNG - Dùng original token
const fieldPath = args.config.field; // "{{steps.manual1.status}}"
const match = fieldPath.match(/\{\{steps\.[^.]+\.(.+?)\}\}/);
const field = match[1]; // "status"
```

### Nested Field Support

Hỗ trợ nested fields:

```typescript
// Token: {{steps.http1.user.address.city}}
// Extract: "user.address.city"
// Access: item.user.address.city
```

### AND Logic

Tất cả conditions phải đúng:

```typescript
const allConditionsPass = conditions.every((condition) =>
  evaluateCondition(item, condition)
);
```

---

## 🎨 UI Features

### TABLE Mode với Filter Node

Khi xem TABLE mode, Filter node hiển thị 2 branches:

- **✅ FILTERED** - Items thỏa mãn điều kiện
- **❌ REMOVED** - Items không thỏa mãn

### SCHEMA Mode

Drag fields từ `filtered` hoặc `removed` vào config của nodes khác.

---

## ⚡ Best Practices

### 1. Thứ Tự Điều Kiện

Đặt điều kiện **nhanh nhất** trước (short-circuit optimization):

```json
// ✅ GOOD - Check cheap condition first
[
  { "field": "{{steps.manual1.status}}", "operator": "==", "value": "active" },
  { "field": "{{steps.manual1.email}}", "operator": "contains", "value": "@gmail.com" }
]
```

### 2. Kiểm Tra Empty Array

Luôn check `summary.filtered` trước khi dùng tiếp:

```typescript
// IF node check filtered có items không
{
  "leftValue": "{{steps.filter1.summary.filtered}}",
  "operator": ">",
  "rightValue": "0"
}
```

### 3. Combine với Switch

Filter → Switch → Process từng nhóm:

```
Manual → Filter (age >= 18) → Switch (by city) → HTTP (gửi theo vùng)
```

---

## 🐛 Common Issues

### Issue 1: "Filter mode requires an array input"

**Nguyên nhân:** Previous data không phải array

**Fix:** Check node trước có return array không

### Issue 2: Tất cả items vào `removed`

**Nguyên nhân:** Token không resolve đúng

**Fix:** 
1. Kiểm tra token syntax: `{{steps.nodeKey.field}}`
2. Verify field name chính xác (case-sensitive)
3. Test với 1 condition trước

### Issue 3: Nested field không work

**Nguyên nhân:** Object path không đúng

**Fix:**
```typescript
// Token: {{steps.manual1.user.name}}
// Extract: "user.name"
// Access: item["user"]["name"]
```

---

## 🔗 Workflow Examples

### Example: User Segmentation Pipeline

```
1. Manual Trigger
   ↓
2. HTTP - Fetch all users
   ↓
3. Filter - Active users (age >= 18, status == "active")
   ↓ filtered
4. Switch - By city (HN, HCM, DN)
   ↓ case_0 (HN)
5. HTTP - Send to Hanoi endpoint
```

### Example: E-commerce Product Filter

```
1. Manual Trigger
   ↓
2. HTTP - Get all products
   ↓
3. Filter - In stock (quantity > 0, price >= 100000, price <= 500000)
   ↓ filtered
4. Formatter - Transform to email format
   ↓
5. HTTP - Send notification
```

---

## 📊 Performance Notes

- **AND logic**: Nếu 1 condition fail, các conditions sau vẫn chạy (không short-circuit)
- **Array size**: Test với < 1000 items, optimize nếu lớn hơn
- **Nested fields**: Mỗi level nested tăng thời gian access

---

## 🎓 Summary

| Aspect | Details |
|--------|---------|
| **Purpose** | Lọc array với nhiều điều kiện AND |
| **Input** | Array từ node trước |
| **Output** | `filtered`, `removed`, `summary` |
| **Logic** | ALL conditions phải đúng |
| **Operators** | 9 operators (==, !=, >, <, >=, <=, contains, startsWith, endsWith) |
| **Mode** | `include` (keep) hoặc `exclude` (remove) |
| **Use Case** | Complex filtering, data cleaning, segmentation |

---

**Tạo bởi:** Node Playground Team 🚀  
**Version:** 1.0.0  
**Last Updated:** 2025-11-01
