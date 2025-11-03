# 🎯 Hướng dẫn Test SWITCH Node với Array Filtering

## 📋 Quick Start Checklist

1. ✅ **Manual node:** Mode = `json`, nhập array of objects `[{...}, {...}]`
2. ✅ **Run Manual:** Check Results có array không phải object
3. ✅ **Add Switch:** Mode = `filter`
4. ✅ **Value/Array:** Kéo output từ Manual hoặc `{{steps.manual1}}`
5. ✅ **Filter Path:** Nhập tên field trong object (vd: `status`)
6. ✅ **Cases:** Add các giá trị cần filter (vd: `active`, `inactive`)
7. ✅ **Run Switch:** Check output có các arrays đã filtered

---

## ⚠️ Lưu ý quan trọng về SWITCH Filter Mode

**SWITCH Filter Mode yêu cầu:**
- ✅ **Input phải là ARRAY OF OBJECTS** (mảng chứa các object)
  ```json
  [{"status": "active"}, {"status": "inactive"}]
  ```
- ✅ Mỗi object phải có field để filter (vd: `status`, `type`, `category`)
- ❌ **KHÔNG phải array of strings** như `["item1", "item2"]`
- ❌ **KHÔNG phải single object** như `{"name": "Alice"}`

**Nếu gặp lỗi, đọc section "🔍 Debug" bên dưới!**

---

## ✨ Workflow mẫu: Manual → Switch → Các nhánh xử lý

### **Bước 1: Node Manual (Trigger) - Nhập data test**

#### **Cách 1: JSON Mode (Recommended cho SWITCH)**

1. Khi mở app, node **Manual** đã được tạo sẵn ở đầu workflow
2. **Double-click** vào node Manual để mở Config panel
3. Chọn **Mode**: `json`
4. Nhập **array of objects** vào field **JSON Payload**:

```json
[
  {"id": 1, "name": "Alice", "status": "active", "age": 25},
  {"id": 2, "name": "Bob", "status": "inactive", "age": 30},
  {"id": 3, "name": "Charlie", "status": "active", "age": 35},
  {"id": 4, "name": "David", "status": "pending", "age": 28},
  {"id": 5, "name": "Eve", "status": "active", "age": 22}
]
```

5. Click **RUN** → Data sẽ xuất hiện trong **Results panel**
6. ✅ **Quan trọng**: Output phải là array, không phải object!

#### **Cách 2: Form Mode (Chỉ dùng cho array of objects)**

Nếu dùng Form Mode để tạo array for objects:

| Field Name | Type  | Value |
|------------|-------|-------|
| users      | array | `[{"id":1,"name":"Alice","status":"active"},{"id":2,"name":"Bob","status":"inactive"}]` |

⚠️ **Lưu ý:** 
- Type phải chọn `array`
- Value phải là JSON string chứa array of objects
- Không dùng Form Mode để tạo từng field riêng lẻ nếu muốn filter!

---

### **Bước 2: Thêm SWITCH node để lọc array**

1. Click **Switch** trong Sidebar để thêm node
2. Kéo edge từ **Manual** → **Switch** để kết nối
3. **Double-click** vào Switch node để config:

**Configuration:**
- **Mode**: `filter` ⚠️ **BẮT BUỘC chọn filter mode!**
- **Value / Array**: 
  - **Cách 1 (Drag & Drop):** Từ Results panel của Manual, mở DATA tab → Kéo toàn bộ array vào field này
  - **Cách 2 (Manual):** Nhập `{{steps.manual1}}` (nếu Manual output trực tiếp là array)
  - **Cách 3 (Nested):** Nhập `{{steps.manual1.users}}` (nếu output là object có field `users`)
- **Filter Path**: `status` ⚠️ **Tên field trong TỪNG object của array**
  - Nếu object có `{"status": "active"}` → nhập `status`
  - Nếu object có `{"type": "vip"}` → nhập `type`
  - Nếu nested như `{"user": {"role": "admin"}}` → nhập `user.role`
- **Cases**: 
  ```
  active
  inactive  
  pending
  ```
  (Click "+ Add Case" để thêm từng case)
- **Default Case**: `other` (cho các giá trị không match bất kỳ case nào)

4. Click **RUN** → Xem Results panel

---

### **❌ Các lỗi thường gặp:**

**Lỗi 1: "Filter mode requires an array input"**
- **Nguyên nhân:** Output của Manual không phải là array
- **Giải pháp:** 
  - Check Results panel của Manual, phải thấy `[...]` chứ không phải `{...}`
  - Nếu là object, dùng token path đến field array: `{{steps.manual1.users}}`

**Lỗi 2: "Filter mode requires a filterPath"**
- **Nguyên nhân:** Chưa điền Filter Path hoặc để trống
- **Giải pháp:** Nhập tên field cần filter, ví dụ `status`

**Lỗi 3: Output rỗng hoặc tất cả vào `default`**
- **Nguyên nhân:** Filter Path không khớp với field trong objects
- **Giải pháp:** 
  - Check data trong Results của Manual
  - Nếu object có `{"status": "active"}`, Filter Path phải là `status` (không phải `Status` hay `user.status`)
  - Case sensitive!

---

### **Bước 3: Xem kết quả filtering**

Switch node sẽ tạo ra 4 outputs trong Results panel:

**📊 DATA tab sẽ hiển thị:**
```json
{
  "case_0": [
    {"id": 1, "name": "Alice", "status": "active", "age": 25},
    {"id": 3, "name": "Charlie", "status": "active", "age": 35},
    {"id": 5, "name": "Eve", "status": "active", "age": 22}
  ],
  "case_1": [
    {"id": 2, "name": "Bob", "status": "inactive", "age": 30}
  ],
  "case_2": [
    {"id": 4, "name": "David", "status": "pending", "age": 28}
  ],
  "default": []
}
```

**🔄 Node sẽ có 4 output handles:**
- **active** (xanh dương) - 3 users
- **inactive** (tím) - 1 user
- **pending** (hồng) - 1 user  
- **default** (xám) - 0 users (empty vì tất cả đã match)

---

### **Bước 4: Kết nối các nhánh xử lý**

Giờ bạn có thể kéo từ mỗi output handle đến node tiếp theo:

**Ví dụ workflow:**
```
Manual (array)
    ↓
Switch (filter by status)
    ├─ active → HTTP (send notification)
    ├─ inactive → SetVariable (archive list)
    ├─ pending → Formatter (format pending list)
    └─ default → (không cần xử lý)
```

**Thao tác:**
1. Thêm node HTTP vào canvas
2. Kéo từ handle **active** của Switch → node HTTP
3. Config HTTP để gửi notification cho active users
4. Trong HTTP config, có thể kéo `{{steps.switch1.case_0}}` để lấy filtered array

---

---

## 🔍 Debug: Kiểm tra data structure

### **Bước 1: Check Manual output**

Sau khi run Manual node, mở **Results panel** → tab **DATA**:

✅ **Đúng - Array of objects:**
```json
[
  {"id": 1, "name": "Alice", "status": "active"},
  {"id": 2, "name": "Bob", "status": "inactive"}
]
```

❌ **SAI - Single object:**
```json
{
  "id": 1,
  "name": "Alice",
  "status": "active"
}
```
→ **Fix:** Wrap trong array `[...]` hoặc dùng Single mode thay vì Filter mode

❌ **SAI - Array of strings:**
```json
["active", "inactive", "pending"]
```
→ **Fix:** Cần array of objects có field để filter

❌ **SAI - Nested array:**
```json
{
  "users": [
    {"id": 1, "status": "active"}
  ]
}
```
→ **Fix:** Trong SWITCH, Value/Array phải trỏ đến `{{steps.manual1.users}}`

---

### **Bước 2: Check Filter Path**

Với data:
```json
[
  {"id": 1, "name": "Alice", "status": "active"},
  {"id": 2, "name": "Bob", "status": "inactive"}
]
```

✅ **Filter Path = `status`** → Lọc theo field `status`
✅ **Filter Path = `name`** → Lọc theo field `name`
❌ **Filter Path = `user.status`** → SAI! Không có nested object
❌ **Filter Path = `Status`** → SAI! Case sensitive

---

### **Bước 3: Verify output**

Sau khi run SWITCH, check Results panel:

```json
{
  "case_0": [
    {"id": 1, "name": "Alice", "status": "active"}
  ],
  "case_1": [
    {"id": 2, "name": "Bob", "status": "inactive"}
  ],
  "case_2": [],
  "default": []
}
```

- ✅ `case_0` có items → Case "active" matched
- ✅ `case_1` có items → Case "inactive" matched
- ✅ `case_2` rỗng → Không có items với case "pending"
- ✅ `default` rỗng → Tất cả items đã match cases

---

## 🎨 Các test cases khác

### **Test 1: Filter by age range**
```json
[
  {"name": "Alice", "ageGroup": "young"},
  {"name": "Bob", "ageGroup": "middle"},
  {"name": "Charlie", "ageGroup": "senior"}
]
```
- Filter Path: `ageGroup`
- Cases: `["young", "middle", "senior"]`

### **Test 2: Filter products by category**
```json
[
  {"product": "Laptop", "category": "electronics", "price": 1000},
  {"product": "Shirt", "category": "clothing", "price": 50},
  {"product": "Phone", "category": "electronics", "price": 800}
]
```
- Filter Path: `category`
- Cases: `["electronics", "clothing", "food"]`

### **Test 3: Single mode (không phải array)**
Thay đổi Mode thành `single` để test như IF node:
```json
{"status": "success", "code": 200}
```
- Mode: `single`
- Value: `{{steps.manual1.status}}`
- Cases: `["success", "error", "pending"]`

---

## 💡 Tips

1. **Node Manual là starting point**: Luôn bắt đầu workflow với Manual để nhập data test
2. **JSON Editor**: Field trong Manual hỗ trợ syntax highlighting JSON
3. **Drag & Drop**: Kéo data từ Results → Config để map nhanh
4. **Filter Path**: Có thể dùng nested path như `user.address.city`
5. **Edit & Rerun**: Sửa data trong Manual → Run lại → Tất cả nodes downstream tự động update

---

## 🚀 Workflow hoàn chỉnh

```
[Manual Trigger]
    ↓ (array of users)
[Switch - Filter by status]
    ├─ active → [HTTP] Send welcome email
    ├─ inactive → [SetVariable] Add to cleanup list  
    ├─ pending → [HTTP] Send reminder
    └─ default → [Formatter] Log unknown status
```

Giờ bạn có thể test mọi scenario chỉ bằng cách sửa data trong Manual node! 🎯
