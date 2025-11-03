# IF Node

## 📋 Chức năng

**IF Node** là node điều kiện cơ bản, cho phép bạn kiểm tra một điều kiện và chỉ cho phép workflow tiếp tục khi điều kiện đúng (true). Nếu điều kiện sai (false), workflow sẽ dừng lại tại node này.

## 🎯 Khi nào sử dụng

- Khi cần kiểm tra một điều kiện đơn giản (true/false)
- Khi muốn dừng workflow nếu điều kiện không thỏa mãn
- Khi cần filter/validate data trước khi xử lý tiếp
- Khi chỉ có 2 cases: thực hiện hoặc không thực hiện

**So sánh với Switch Node**: IF chỉ có 1 điều kiện (pass/fail), Switch có nhiều nhánh.

## ⚙️ Cấu hình

### Condition
Biểu thức điều kiện trả về `true` hoặc `false`.

**Hỗ trợ**:
- Tokens: `{{steps.<node-key>.<field>}}`
- Operators: `===`, `!==`, `>`, `<`, `>=`, `<=`
- Logic operators: `&&` (AND), `||` (OR)
- String comparison: `"value"`, `'value'`
- Number comparison: `123`, `45.6`

## 📖 Ví dụ

### Ví dụ 1: Check simple field value
Input từ Manual node:
```json
{
  "status": "active",
  "age": 25
}
```

IF Node config:
```javascript
{{steps.manual1.status}} === "active"
```

**Kết quả**: 
- ✅ Condition true → Workflow tiếp tục
- Output: Pass through input data

### Ví dụ 2: Check number comparison
Input:
```json
{
  "price": 150,
  "discount": 20
}
```

IF Node config:
```javascript
{{steps.manual1.price}} > 100
```

**Kết quả**: 
- ✅ True (150 > 100) → Workflow continues
- Output: `{ price: 150, discount: 20 }`

### Ví dụ 3: Multiple conditions (AND)
Input:
```json
{
  "age": 25,
  "status": "active",
  "verified": true
}
```

IF Node config:
```javascript
{{steps.manual1.age}} >= 18 && {{steps.manual1.status}} === "active"
```

**Kết quả**: 
- ✅ True (25 >= 18 AND status is "active")
- Output: Pass through data

### Ví dụ 4: Multiple conditions (OR)
Input:
```json
{
  "role": "admin",
  "permissions": "write"
}
```

IF Node config:
```javascript
{{steps.manual1.role}} === "admin" || {{steps.manual1.permissions}} === "superuser"
```

**Kết quả**: 
- ✅ True (role is "admin" OR permissions is "superuser")
- Output: Pass through data

### Ví dụ 5: Check HTTP status
Input từ HTTP node:
```json
{
  "status": 200,
  "data": { "id": 1 }
}
```

IF Node config:
```javascript
{{steps.http1.status}} === 200
```

**Kết quả**: 
- ✅ True nếu API call thành công
- ❌ False nếu status khác 200 (lỗi)

### Ví dụ 6: Check field existence and value
Input:
```json
{
  "user": {
    "name": "John",
    "email": "john@example.com"
  }
}
```

IF Node config:
```javascript
{{steps.manual1.user.email}} !== ""
```

**Kết quả**: 
- ✅ True nếu email có giá trị
- ❌ False nếu email rỗng

## 📤 Output Structure

**Khi condition = TRUE**:
```json
{
  "conditionMet": true,
  "evaluatedCondition": "true === true",
  "data": { /* Original input data */ }
}
```

**Khi condition = FALSE**:
```json
{
  "conditionMet": false,
  "evaluatedCondition": "false === true"
}
```

## 🔗 Kết nối với node khác

**Input từ node trước**:
- Manual node → Check manual data
- HTTP node → Validate API response
- Filter/SET node → Check processed data

**Output đến node sau**:
- Chỉ tiếp tục nếu condition = true
- Nếu false, workflow dừng (các node sau không chạy)

## 💡 Tips & Best Practices

1. **Simple conditions**: IF node nên dùng cho điều kiện đơn giản
2. **Complex logic**: Nếu có nhiều cases, dùng Switch node thay vì nhiều IF
3. **Type safety**: Đảm bảo so sánh đúng type (string vs number)
4. **Null check**: Check field tồn tại trước khi compare
5. **Error handling**: Dùng IF để validate data trước khi gọi API

## ⚠️ Lưu ý

- IF node **KHÔNG hỗ trợ else branch** → Chỉ có "pass" hoặc "stop"
- Nếu cần else branch → Dùng **Switch node**
- Condition phải trả về boolean (true/false)
- Token không tồn tại → Resolved thành empty string `""`
- So sánh string: Phải dùng quotes `"value"` hoặc `'value'`
- So sánh number: Không cần quotes `123`

## 🐛 Troubleshooting

**Condition luôn false**:
- Check token path đúng chưa: `{{steps.<node-key>.<field>}}`
- Check type: `"123"` (string) khác `123` (number)
- Xem resolved condition trong output để debug

**Workflow không tiếp tục**:
- Condition = false → Workflow dừng (expected behavior)
- Check logic điều kiện
- Xem data thực tế trong Result panel

**Token không resolve**:
- Node trước chưa chạy
- Path sai: `steps.manual1.name` chứ không phải `manual1.name`
- Field không tồn tại trong data
