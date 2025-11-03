# 🔀 IF Node - Hướng dẫn sử dụng

## 📖 Khái niệm

IF node hoạt động như một **công tắc điều hướng** (router) trong workflow:
- ✅ **Nhận data** từ node trước
- 🔍 **Đánh giá điều kiện** (condition)
- 🚦 **Điều hướng** data vào 1 trong 2 nhánh: TRUE hoặc FALSE
- 📤 **Cả 2 nhánh đều nhận data giống nhau** từ node trước

## 🆚 So sánh với Switch

| Tính năng | IF Node | Switch Node |
|-----------|---------|-------------|
| **Input** | Data từ node trước | Data từ node trước |
| **Output** | 2 branches (TRUE/FALSE) | N branches (cases + default) |
| **Logic** | Điều kiện đúng/sai | So khớp giá trị hoặc filter array |
| **Data routing** | Pass through | Pass through hoặc Filter |
| **Dùng khi** | Cần tách luồng thành 2 | Cần tách thành nhiều luồng |

## 🎯 Cách hoạt động

### Concept cũ (❌ SAI)
```
Manual → IF
         ├─ TRUE: {condition data}  ← Chỉ thông tin điều kiện
         └─ FALSE: {condition data} ← Chỉ thông tin điều kiện
```

### Concept mới (✅ ĐÚNG)
```
Manual → IF
  Data    ├─ TRUE: {users: [...]}  ← Cùng data từ Manual
  {users} └─ FALSE: {users: [...]} ← Cùng data từ Manual
```

## 📋 Ví dụ thực tế

### Bước 1: Tạo Manual node với data
```json
[
  {"id": 1, "name": "Alice", "age": 25, "status": "active"},
  {"id": 2, "name": "Bob", "age": 17, "status": "inactive"}
]
```

### Bước 2: Thêm IF node
**Mode**: Simple
**Left Value**: `{{steps.manual1.users[0].age}}`
**Operator**: `>`
**Right Value**: `18`

### Bước 3: Kết quả
```
IF Node evaluates: 25 > 18 = TRUE

Output:
├─ TRUE: {users: [
│    {"id": 1, "name": "Alice", "age": 25, "status": "active"},
│    {"id": 2, "name": "Bob", "age": 17, "status": "inactive"}
│  ]}
│
└─ FALSE: {users: [
     {"id": 1, "name": "Alice", "age": 25, "status": "active"},
     {"id": 2, "name": "Bob", "age": 17, "status": "inactive"}
   ]}

Chỉ có nhánh TRUE chạy tiếp, nhánh FALSE bị skip.
```

### Bước 4: Connect node tiếp theo
```
Manual → IF → TRUE → SetVariable (xử lý user trưởng thành)
         └─ FALSE → SetVariable (xử lý user vị thành niên)
```

## 🎨 2 Modes

### 1️⃣ Simple Mode
Đánh giá **1 điều kiện** duy nhất.

**Config:**
- **Left Value**: Giá trị bên trái (có thể dùng token)
- **Operator**: Toán tử so sánh
  - `==`: Bằng
  - `!=`: Khác
  - `>`: Lớn hơn
  - `<`: Nhỏ hơn
  - `>=`: Lớn hơn hoặc bằng
  - `<=`: Nhỏ hơn hoặc bằng
  - `contains`: Chứa chuỗi
  - `startsWith`: Bắt đầu với
  - `endsWith`: Kết thúc với
  - `isEmpty`: Rỗng
  - `isNotEmpty`: Không rỗng
- **Right Value**: Giá trị bên phải

**Ví dụ:**
```
Left Value: {{steps.http1.status}}
Operator: ==
Right Value: 200

→ TRUE nếu status === 200
→ FALSE nếu status !== 200
```

### 2️⃣ Multi Mode
Đánh giá **nhiều điều kiện** kết hợp.

**Config:**
- **Logic**: AND hoặc OR
- **Conditions**: Mảng các điều kiện
  - Mỗi condition có: leftValue, operator, rightValue

**Ví dụ AND:**
```json
{
  "logic": "AND",
  "conditions": [
    {"leftValue": "{{steps.manual1.user.age}}", "operator": ">=", "rightValue": "18"},
    {"leftValue": "{{steps.manual1.user.status}}", "operator": "==", "rightValue": "active"}
  ]
}

→ TRUE nếu age >= 18 VÀ status === "active"
→ FALSE nếu một trong hai điều kiện sai
```

**Ví dụ OR:**
```json
{
  "logic": "OR",
  "conditions": [
    {"leftValue": "{{steps.manual1.user.role}}", "operator": "==", "rightValue": "admin"},
    {"leftValue": "{{steps.manual1.user.role}}", "operator": "==", "rightValue": "moderator"}
  ]
}

→ TRUE nếu role === "admin" HOẶC role === "moderator"
→ FALSE nếu cả hai điều kiện đều sai
```

## 🚀 Use Cases

### 1. Kiểm tra HTTP status
```
HTTP → IF (status == 200?)
       ├─ TRUE → Formatter (xử lý success)
       └─ FALSE → Manual (trigger alert)
```

### 2. Validate user input
```
Manual → IF (age >= 18?)
         ├─ TRUE → SetVariable (approved: true)
         └─ FALSE → SetVariable (approved: false)
```

### 3. Route theo nhiều điều kiện
```
Manual → IF (Multi: role == admin AND active == true?)
         ├─ TRUE → HTTP (call admin API)
         └─ FALSE → HTTP (call user API)
```

### 4. Check empty data
```
HTTP → IF (response isEmpty?)
       ├─ TRUE → Manual (no data message)
       └─ FALSE → Formatter (process data)
```

## ⚠️ Lưu ý quan trọng

### ✅ CẦN LÀM
1. **IF node phải có node trước đó** để nhận data
2. **Connect node vào nhánh TRUE hoặc FALSE** để xử lý tiếp
3. **Sử dụng token** để truy cập data: `{{steps.manual1.users}}`
4. **Chọn operator phù hợp** với kiểu dữ liệu (number: >, <; string: contains)

### ❌ TRÁNH LÀM
1. Đặt IF node làm node đầu tiên (trigger) - không có data input
2. Nghĩ rằng TRUE/FALSE có data khác nhau - chúng giống nhau
3. Dùng IF để filter array - dùng Switch filter mode
4. Quên connect node vào output handle - luồng sẽ dừng lại

## 🔍 Debug

### Kiểm tra data flow
1. **Run Manual node** → Xem output trong Result panel
2. **Run IF node** → Kiểm tra:
   - Condition có evaluate đúng không?
   - Output TRUE/FALSE có data từ Manual không?
3. **Xem canvas** → Handle nào được kết nối?

### Common Errors

#### ❌ "Cannot read property of undefined"
**Nguyên nhân:** Token path sai hoặc Manual chưa chạy

**Fix:**
```
Sai: {{steps.manual1.user.age}}  ← user không tồn tại
Đúng: {{steps.manual1.users[0].age}}  ← users là array
```

#### ❌ "IF node không có data"
**Nguyên nhân:** Manual node chưa chạy trước IF

**Fix:**
1. Click Manual node → Run
2. Đợi output hiển thị trong Result
3. Click IF node → Run

#### ❌ "Cả TRUE và FALSE đều có data"
**Trạng thái:** ✅ Đây là ĐÚNG!

**Giải thích:** IF node pass through data. Chỉ nhánh nào được connect mới chạy tiếp.

## 💡 Tips

1. **Dùng Simple mode** cho điều kiện đơn giản → dễ đọc, dễ debug
2. **Dùng Multi mode** cho logic phức tạp → tránh tạo nhiều IF node
3. **Test từng điều kiện** riêng lẻ trước khi combine
4. **Kéo field từ Result** vào config thay vì gõ token tay → tránh typo
5. **Đặt tên step rõ ràng** → dễ nhận biết trong workflow: `if_check_age`, `if_validate_user`
6. **Xem visual handles** trên canvas → biết nhánh nào đang active

## 📚 Template

### Template 1: Age Check
```
Manual node (JSON mode):
{
  "user": {
    "name": "Alice",
    "age": 25,
    "email": "alice@example.com"
  }
}

IF node (Simple mode):
- Left Value: {{steps.manual1.user.age}}
- Operator: >=
- Right Value: 18

TRUE branch → SetVariable:
- category: "adult"

FALSE branch → SetVariable:
- category: "minor"
```

### Template 2: Status & Role Check
```
Manual node (JSON mode):
{
  "user": {
    "role": "admin",
    "status": "active",
    "permissions": ["read", "write", "delete"]
  }
}

IF node (Multi mode):
{
  "logic": "AND",
  "conditions": [
    {"leftValue": "{{steps.manual1.user.role}}", "operator": "==", "rightValue": "admin"},
    {"leftValue": "{{steps.manual1.user.status}}", "operator": "==", "rightValue": "active"}
  ]
}

TRUE branch → HTTP:
- url: https://api.example.com/admin/dashboard
- method: GET

FALSE branch → SetVariable:
- error: "Unauthorized access"
```

### Template 3: Empty Check
```
Manual node (Form mode):
- Field: response
- Type: String
- Value: (để trống)

IF node (Simple mode):
- Left Value: {{steps.manual1.response}}
- Operator: isEmpty
- Right Value: (không cần)

TRUE branch → SetVariable:
- message: "No data received"

FALSE branch → Formatter:
- template: Response: {{steps.manual1.response}}
```

---

## 🎓 Tổng kết

IF node là **router node** - nhận data từ trước, đánh giá điều kiện, pass data vào 2 nhánh TRUE/FALSE. Cả 2 nhánh đều nhận **cùng data**, nhưng chỉ nhánh thoả điều kiện mới chạy tiếp trong workflow.

**Next:** Kết hợp IF với Switch để tạo workflow phân luồng phức tạp! 🚀
