# 🎯 Node Manual Trigger - Hướng dẫn sử dụng

## 📌 Tổng quan

**Node Manual** là node **Trigger** - node đầu tiên và duy nhất trong mọi workflow. Node này:
- ✅ **Không có input handle** (chỉ có output)
- ✅ **2 modes nhập data**: JSON hoặc Form
- ✅ **Tự do nhập test data** mà không cần hard-code

---

## 🎨 Cấu trúc Workflow

```
[Manual Trigger] (▶️)
       ↓
   [HTTP/Switch/SetVariable/...]
       ↓
   [Các nodes khác]
```

**Lưu ý:** 
- Node Manual **không có target handle** (không có điểm nối bên trái)
- Chỉ có **source handle** bên phải để kết nối đến node tiếp theo
- Là **starting point** duy nhất của workflow

---

## 🔧 2 Modes nhập data

### **Mode 1: JSON Mode** (Mặc định)

Nhập data dưới dạng JSON thuần. Phù hợp cho:
- Array của objects
- Nested objects phức tạp
- Copy/paste data từ API responses

**Ví dụ:**

**Array filtering:**
```json
[
  {"id": 1, "name": "Alice", "status": "active", "age": 25},
  {"id": 2, "name": "Bob", "status": "inactive", "age": 30},
  {"id": 3, "name": "Charlie", "status": "active", "age": 35}
]
```

**Single object:**
```json
{
  "userId": 123,
  "email": "user@example.com",
  "orders": [
    {"orderId": 1, "total": 100},
    {"orderId": 2, "total": 200}
  ]
}
```

**Simple value:**
```json
"Hello World"
```
hoặc
```json
42
```

---

### **Mode 2: Form Mode** (Dễ dùng hơn)

Nhập data dưới dạng bảng với 3 cột:
1. **Field Name**: Tên trường (key)
2. **Type**: Kiểu dữ liệu (string/number/boolean/json)
3. **Value**: Giá trị

**Ví dụ:**

| Field Name | Type    | Value                                    |
|------------|---------|------------------------------------------|
| name       | string  | John Doe                                 |
| age        | number  | 30                                       |
| active     | boolean | true                                     |
| tags       | array   | ["vip","new"]                            |
| address    | object  | {"city":"Hanoi","country":"Vietnam"}     |

**Output sẽ là:**
```json
{
  "name": "John Doe",
  "age": 30,
  "active": true,
  "tags": ["vip", "new"],
  "address": {
    "city": "Hanoi",
    "country": "Vietnam"
  }
}
```

**Các type hỗ trợ:**
- **ab String**: Text thường
- **# Number**: Số (int hoặc float)
- **☑ Boolean**: true/false (nhập "true", "1" → true, còn lại → false)
- **≡ Array**: Mảng - nhập JSON `["item1", "item2"]` hoặc CSV `item1, item2`
- **◇ Object**: Object - nhập JSON `{"key": "value"}`

---

## 🚀 Workflow mẫu

### **Ví dụ 1: Filter users by status**

**1. Node Manual (JSON Mode):**
```json
[
  {"id": 1, "name": "Alice", "status": "active"},
  {"id": 2, "name": "Bob", "status": "inactive"},
  {"id": 3, "name": "Charlie", "status": "active"}
]
```

**2. Node Switch (Filter Mode):**
- Value/Array: `{{steps.manual1}}`
- Filter Path: `status`
- Cases: `["active", "inactive"]`

**3. Output:**
- `active` → 2 users (Alice, Charlie)
- `inactive` → 1 user (Bob)

---

### **Ví dụ 2: HTTP API call with form data**

**1. Node Manual (Form Mode):**
| Field Name | Type   | Value                |
|------------|--------|----------------------|
| userId     | number | 123                  |
| action     | string | update               |
| notify     | boolean| true                 |

**2. Node HTTP:**
- Method: POST
- URL: `https://api.example.com/users`
- JSON Body: `{{steps.manual1}}`

**Output từ Manual:**
```json
{
  "userId": 123,
  "action": "update",
  "notify": true
}
```

---

### **Ví dụ 3: Complex nested data**

**1. Node Manual (JSON Mode):**
```json
{
  "user": {
    "id": 1,
    "name": "Alice"
  },
  "orders": [
    {"orderId": 101, "total": 250},
    {"orderId": 102, "total": 150}
  ],
  "settings": {
    "notifications": true,
    "theme": "dark"
  }
}
```

**2. Các nodes tiếp theo có thể access:**
- `{{steps.manual1.user.name}}` → "Alice"
- `{{steps.manual1.orders}}` → toàn bộ array
- `{{steps.manual1.settings.theme}}` → "dark"

---

## 💡 Tips & Best Practices

### **JSON Mode:**
✅ **Tốt cho:**
- Copy data từ API responses
- Test với data phức tạp (nested objects/arrays)
- Paste data từ file JSON

❌ **Hạn chế:**
- Phải valid JSON (dễ syntax error)
- Khó nhập nhanh cho simple objects

### **Form Mode:**
✅ **Tốt cho:**
- Nhập nhanh data đơn giản
- Không cần quan tâm JSON syntax
- Test từng field một

❌ **Hạn chế:**
- Không hỗ trợ nested objects trực tiếp
- Phải dùng type "json" cho arrays/objects

### **Chuyển đổi giữa 2 modes:**
1. Nhập data ở mode nào cũng được
2. Đổi mode → config cũ vẫn giữ nguyên
3. Run lại để update output

---

## 🎓 Scenarios thực tế

### **Scenario 1: Test API với nhiều users**
```
Manual (array) → Switch (filter) → HTTP (send email to active)
```

### **Scenario 2: Debug workflow với data cụ thể**
```
Manual (single object) → Formatter (extract field) → SetVariable
```

### **Scenario 3: Test conditional logic**
```
Manual (object with status) → IF (check status) → Branch nodes
```

### **Scenario 4: Quick form submission test**
```
Manual (form mode) → HTTP POST → Check response
```

---

## ⚡ Shortcuts

1. **Paste JSON nhanh:** Copy JSON từ đâu đó → Paste vào JSON Payload field
2. **Add nhiều fields:** Click "+ Add Field" nhiều lần
3. **Remove field:** Click ✕ bên phải mỗi row
4. **Run ngay:** Ctrl+Enter trong Config panel (nếu có shortcut)

---

## 🔍 Troubleshooting

**❌ "Invalid JSON payload":**
- Check JSON syntax (missing comma, bracket, quote)
- Use JSON validator online

**❌ Output empty trong Form mode:**
- Check Field Name không để trống
- Check Type phù hợp với Value

**❌ Node không có target handle:**
- Đúng rồi! Manual là trigger node, không có input
- Chỉ kết nối từ Manual → nodes khác

---

## 📚 Tóm tắt

| Tính năng | Mô tả |
|-----------|-------|
| **Type** | Trigger (starting point) |
| **Input Handle** | ❌ Không có (trigger không nhận input) |
| **Output Handle** | ✅ 1 handle duy nhất |
| **Modes** | JSON mode + Form mode |
| **Use cases** | Test data, workflow starting point |

Node Manual = **Điểm khởi đầu linh hoạt** cho mọi workflow testing! 🎯
