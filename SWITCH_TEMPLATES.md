# 🎯 SWITCH Filter - Quick Templates

## Template 1: Filter Users by Status
**Use case:** Phân loại users theo trạng thái active/inactive

### Manual Node (JSON Mode):
```json
[
  {"id": 1, "name": "Alice", "email": "alice@example.com", "status": "active", "age": 25},
  {"id": 2, "name": "Bob", "email": "bob@example.com", "status": "inactive", "age": 30},
  {"id": 3, "name": "Charlie", "email": "charlie@example.com", "status": "active", "age": 35},
  {"id": 4, "name": "David", "email": "david@example.com", "status": "pending", "age": 28},
  {"id": 5, "name": "Eve", "email": "eve@example.com", "status": "active", "age": 22}
]
```

### Switch Node Config:
- Mode: `filter`
- Value/Array: `{{steps.manual1}}`
- Filter Path: `status`
- Cases: `active`, `inactive`, `pending`
- Default: `other`

### Expected Output:
- **active** → 3 users (Alice, Charlie, Eve)
- **inactive** → 1 user (Bob)
- **pending** → 1 user (David)
- **other** → 0 users

---

## Template 2: Filter Products by Category
**Use case:** Phân loại sản phẩm theo category

### Manual Node (JSON Mode):
```json
[
  {"id": 101, "name": "Laptop", "category": "electronics", "price": 1000, "stock": 50},
  {"id": 102, "name": "T-Shirt", "category": "clothing", "price": 25, "stock": 200},
  {"id": 103, "name": "Phone", "category": "electronics", "price": 800, "stock": 100},
  {"id": 104, "name": "Jeans", "category": "clothing", "price": 60, "stock": 150},
  {"id": 105, "name": "Apple", "category": "food", "price": 2, "stock": 500},
  {"id": 106, "name": "Headphones", "category": "electronics", "price": 150, "stock": 80}
]
```

### Switch Node Config:
- Mode: `filter`
- Value/Array: `{{steps.manual1}}`
- Filter Path: `category`
- Cases: `electronics`, `clothing`, `food`
- Default: `other`

### Expected Output:
- **electronics** → 3 items (Laptop, Phone, Headphones)
- **clothing** → 2 items (T-Shirt, Jeans)
- **food** → 1 item (Apple)

---

## Template 3: Filter Orders by Priority
**Use case:** Chia orders theo độ ưu tiên xử lý

### Manual Node (JSON Mode):
```json
[
  {"orderId": "ORD001", "customer": "Alice", "priority": "high", "total": 500},
  {"orderId": "ORD002", "customer": "Bob", "priority": "low", "total": 50},
  {"orderId": "ORD003", "customer": "Charlie", "priority": "urgent", "total": 1000},
  {"orderId": "ORD004", "customer": "David", "priority": "medium", "total": 200},
  {"orderId": "ORD005", "customer": "Eve", "priority": "high", "total": 750}
]
```

### Switch Node Config:
- Mode: `filter`
- Value/Array: `{{steps.manual1}}`
- Filter Path: `priority`
- Cases: `urgent`, `high`, `medium`, `low`
- Default: `unknown`

### Expected Output:
- **urgent** → 1 order (ORD003 - $1000)
- **high** → 2 orders (ORD001, ORD005 - total $1250)
- **medium** → 1 order (ORD004 - $200)
- **low** → 1 order (ORD002 - $50)

---

## Template 4: Filter by Age Group
**Use case:** Phân nhóm tuổi users

### Manual Node (JSON Mode):
```json
[
  {"id": 1, "name": "Alice", "age": 18, "ageGroup": "teen"},
  {"id": 2, "name": "Bob", "age": 25, "ageGroup": "young"},
  {"id": 3, "name": "Charlie", "age": 35, "ageGroup": "adult"},
  {"id": 4, "name": "David", "age": 55, "ageGroup": "senior"},
  {"id": 5, "name": "Eve", "age": 22, "ageGroup": "young"}
]
```

### Switch Node Config:
- Mode: `filter`
- Value/Array: `{{steps.manual1}}`
- Filter Path: `ageGroup`
- Cases: `teen`, `young`, `adult`, `senior`

---

## Template 5: Filter by Boolean Flag
**Use case:** Chia users theo verified/unverified

### Manual Node (JSON Mode):
```json
[
  {"id": 1, "email": "alice@example.com", "verified": "true"},
  {"id": 2, "email": "bob@example.com", "verified": "false"},
  {"id": 3, "email": "charlie@example.com", "verified": "true"},
  {"id": 4, "email": "david@example.com", "verified": "false"}
]
```

### Switch Node Config:
- Mode: `filter`
- Value/Array: `{{steps.manual1}}`
- Filter Path: `verified`
- Cases: `true`, `false`

**Lưu ý:** SWITCH filter so sánh string, nên boolean trong data nên để dạng string `"true"` / `"false"`

---

## ❌ Anti-patterns (KHÔNG làm thế này)

### ❌ Wrong 1: Array of strings
```json
["active", "inactive", "pending"]
```
**Problem:** Không có field để filter
**Fix:** Wrap thành objects: `[{"status": "active"}, {"status": "inactive"}]`

### ❌ Wrong 2: Single object
```json
{"name": "Alice", "status": "active"}
```
**Problem:** Không phải array
**Fix:** Wrap trong array: `[{"name": "Alice", "status": "active"}]`

### ❌ Wrong 3: Nested array không map đúng
```json
{
  "users": [{"status": "active"}]
}
```
**Problem:** Output là object, không phải array
**Fix:** Trong Switch Value/Array dùng `{{steps.manual1.users}}`

---

## 💡 Tips

1. **Copy template trên** → Paste vào Manual JSON Payload
2. **Run Manual first** → Check output có phải array không
3. **Open Results DATA tab** → Drag toàn bộ array vào Switch
4. **Filter Path = field name** trong object (case sensitive!)
5. **Add cases** theo giá trị thực tế trong data
6. **Run Switch** → Check từng output array

**Nếu vẫn lỗi, đọc file `TEST_SWITCH_ARRAY.md` section Debug!**
