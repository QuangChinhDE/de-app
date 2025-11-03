# Switch Node

## 📋 Chức năng

**Switch Node** cho phép bạn phân nhánh workflow dựa trên giá trị của một expression. Mỗi case sẽ có một điều kiện riêng, và chỉ case đầu tiên match sẽ được thực thi.

## 🎯 Khi nào sử dụng

- Khi có nhiều hơn 2 cases (nhiều nhánh)
- Khi cần route data dựa trên giá trị cụ thể
- Khi muốn xử lý khác nhau cho từng loại data
- Khi cần fallback (default case)

**So sánh với IF Node**: IF chỉ có pass/fail, Switch có nhiều nhánh và default case.

## ⚙️ Cấu hình

### 1. Expression
Giá trị cần kiểm tra. Thường là token từ node trước.

**Ví dụ**: `{{steps.manual1.status}}`

### 2. Cases
Danh sách các cases. Mỗi case có:
- **Value**: Giá trị để so sánh với expression
- **Output Mode**: Chọn output cho case này
  - **Pass Through Input**: Trả về input data nguyên gốc
  - **Custom**: Tự định nghĩa output (JSON)

### 3. Default Case
Case được thực thi khi không có case nào match.

## 📖 Ví dụ

### Ví dụ 1: Route dựa trên status
Input từ Manual node:
```json
{
  "id": 1,
  "name": "John",
  "status": "active"
}
```

Switch Node config:
```
Expression: {{steps.manual1.status}}

Cases:
  Case 1:
    Value: "active"
    Output Mode: Custom
    Custom Output: {"message": "User is active", "action": "proceed"}
  
  Case 2:
    Value: "inactive"
    Output Mode: Custom
    Custom Output: {"message": "User is inactive", "action": "skip"}
  
  Case 3:
    Value: "pending"
    Output Mode: Custom
    Custom Output: {"message": "User is pending", "action": "review"}

Default:
  Output Mode: Custom
  Custom Output: {"message": "Unknown status", "action": "error"}
```

**Kết quả với status = "active"**:
```json
{
  "matched": true,
  "matchedCase": 0,
  "caseValue": "active",
  "output": {
    "message": "User is active",
    "action": "proceed"
  }
}
```

### Ví dụ 2: HTTP status handling
Input từ HTTP node:
```json
{
  "status": 200,
  "data": {"users": [...]}
}
```

Switch Node config:
```
Expression: {{steps.http1.status}}

Cases:
  Case 1 (Success):
    Value: "200"
    Output Mode: Pass Through Input
  
  Case 2 (Not Found):
    Value: "404"
    Output Mode: Custom
    Custom Output: {"error": "Resource not found"}
  
  Case 3 (Server Error):
    Value: "500"
    Output Mode: Custom
    Custom Output: {"error": "Internal server error"}

Default:
  Output Mode: Custom
  Custom Output: {"error": "Unknown error"}
```

**Kết quả với status = 200**:
```json
{
  "matched": true,
  "matchedCase": 0,
  "caseValue": "200",
  "output": {
    "status": 200,
    "data": {"users": [...]}
  }
}
```

### Ví dụ 3: User role routing
Input:
```json
{
  "userId": 123,
  "role": "admin",
  "name": "Alice"
}
```

Switch Node config:
```
Expression: {{steps.manual1.role}}

Cases:
  Case 1 (Admin):
    Value: "admin"
    Output Mode: Custom
    Custom Output: {"permissions": "full", "dashboard": "/admin"}
  
  Case 2 (User):
    Value: "user"
    Output Mode: Custom
    Custom Output: {"permissions": "read", "dashboard": "/user"}
  
  Case 3 (Guest):
    Value: "guest"
    Output Mode: Custom
    Custom Output: {"permissions": "none", "dashboard": "/login"}

Default:
  Output Mode: Custom
  Custom Output: {"error": "Invalid role"}
```

**Kết quả với role = "admin"**:
```json
{
  "matched": true,
  "matchedCase": 0,
  "caseValue": "admin",
  "output": {
    "permissions": "full",
    "dashboard": "/admin"
  }
}
```

### Ví dụ 4: Number range handling
Input:
```json
{
  "score": 85
}
```

Switch Node config:
```
Expression: {{steps.manual1.score}}

Cases:
  Case 1:
    Value: "90"
    Output Mode: Custom
    Custom Output: {"grade": "A", "message": "Excellent"}
  
  Case 2:
    Value: "80"
    Output Mode: Custom
    Custom Output: {"grade": "B", "message": "Good"}
  
  Case 3:
    Value: "70"
    Output Mode: Custom
    Custom Output: {"grade": "C", "message": "Average"}

Default:
  Output Mode: Custom
  Custom Output: {"grade": "F", "message": "Need improvement"}
```

**Lưu ý**: Switch so sánh exact match, không support range. Để check range, dùng IF node với `>=` operator.

### Ví dụ 5: Array processing with switch
Input (array):
```json
[
  {"id": 1, "type": "email"},
  {"id": 2, "type": "sms"},
  {"id": 3, "type": "push"}
]
```

Switch Node config:
```
Expression: {{steps.manual1.type}}  // Auto-unwrap first item

Cases:
  Case 1:
    Value: "email"
    Output Mode: Custom
    Custom Output: {"channel": "email", "template": "email-template"}
  
  Case 2:
    Value: "sms"
    Output Mode: Custom
    Custom Output: {"channel": "sms", "template": "sms-template"}

Default:
  Output Mode: Pass Through Input
```

**Kết quả**: Match với first item's type = "email"

## 📤 Output Structure

**Khi có case match**:
```json
{
  "matched": true,
  "matchedCase": 0,              // Index của case matched
  "caseValue": "active",          // Value của case matched
  "output": { /* Case output */ }
}
```

**Khi không có case match (dùng default)**:
```json
{
  "matched": false,
  "matchedCase": null,
  "caseValue": null,
  "output": { /* Default output */ }
}
```

**Sử dụng trong node sau**:
- `{{steps.switch1.output}}` → Output của case matched
- `{{steps.switch1.matched}}` → true/false
- `{{steps.switch1.caseValue}}` → Value của case matched

## 🔗 Kết nối với node khác

**Input từ node trước**:
- Manual node → Route manual data
- HTTP node → Handle API response codes
- Filter node → Process filtered data
- SET node → Route transformed data

**Output đến node sau**:
- HTTP node → Call different APIs cho mỗi case
- SET node → Transform data khác nhau
- IF node → Further validation

## 💡 Tips & Best Practices

1. **Exact match**: Switch dùng `===` (strict equality)
2. **Type matters**: `"200"` (string) khác `200` (number)
3. **First match wins**: Case đầu tiên match sẽ được chọn
4. **Always have default**: Luôn config default case để handle unexpected values
5. **Pass Through vs Custom**: 
   - Pass Through: Giữ nguyên input data
   - Custom: Tự định nghĩa output mới

## ⚠️ Lưu ý

- Switch chỉ match **EXACT value** (không support regex, range)
- Type phải khớp: string vs number
- Token auto-unwrap array → Chỉ lấy first item
- Default case luôn được thực thi nếu không match
- Không support multiple matches → Chỉ case đầu tiên

## 🐛 Troubleshooting

**Không match case nào**:
- Check type: Expression trả về string hay number?
- Check value chính xác: `"active"` vs `"Active"` (case-sensitive)
- Xem resolved expression trong output
- Kiểm tra token path

**Luôn vào default case**:
- Case values không khớp với expression value
- Type mismatch: string vs number
- Expression resolve sai

**Array không xử lý đúng**:
- Token auto-unwrap first item
- Muốn xử lý từng item → Dùng Filter node trước Switch
- Hoặc dùng Filter node sau Switch để apply cho tất cả items
