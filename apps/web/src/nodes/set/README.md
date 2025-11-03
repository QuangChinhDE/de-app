# SET Node

## 📋 Chức năng

**SET Node** cho phép bạn thêm, sửa đổi, hoặc tạo mới các fields trong data. Node này hoạt động giống như SET node trong n8n, hỗ trợ type conversion và drag-drop từ DATA panel.

## 🎯 Khi nào sử dụng

- Khi cần thêm field mới vào data
- Khi cần transform/convert data type
- Khi cần rename fields
- Khi cần tính toán fields mới từ fields hiện có
- Khi cần remove fields không cần thiết

## ⚙️ Cấu hình

### 1. Include Other Input Fields
Toggle để quyết định có giữ lại các fields gốc hay không.

- **ON (true)**: Giữ lại tất cả fields gốc + thêm fields mới
- **OFF (false)**: Chỉ giữ fields được định nghĩa trong "Fields to Set"

### 2. Fields to Set
Danh sách các fields muốn set. Mỗi field có:

- **Key**: Tên field (output field name)
- **Value**: Giá trị (hỗ trợ token `{{steps.<node-key>.<field>}}`)
- **Type**: Loại dữ liệu muốn convert
  - String
  - Number
  - Boolean
  - Array
  - Object

**Drag & Drop**: Có thể kéo field từ DATA panel vào ô Value!

## 📖 Ví dụ

### Ví dụ 1: Thêm field mới (Keep other fields)
Input từ Manual node:
```json
[
  {"id": 1, "name": "Alice", "age": 25},
  {"id": 2, "name": "Bob", "age": 30}
]
```

SET Node config:
```
Include Other Input Fields: ON
Fields to Set:
  - Key: fullName
    Value: {{steps.manual1.name}}
    Type: String
  
  - Key: isAdult
    Value: true
    Type: Boolean
```

**Output**:
```json
[
  {"id": 1, "name": "Alice", "age": 25, "fullName": "Alice", "isAdult": true},
  {"id": 2, "name": "Bob", "age": 30, "fullName": "Bob", "isAdult": true}
]
```

### Ví dụ 2: Chỉ giữ fields được chọn
Input:
```json
[
  {"id": 1, "name": "Alice", "age": 25, "email": "alice@example.com", "phone": "123"},
  {"id": 2, "name": "Bob", "age": 30, "email": "bob@example.com", "phone": "456"}
]
```

SET Node config:
```
Include Other Input Fields: OFF
Fields to Set:
  - Key: userId
    Value: {{steps.manual1.id}}
    Type: Number
  
  - Key: displayName
    Value: {{steps.manual1.name}}
    Type: String
```

**Output** (Chỉ có 2 fields được chọn):
```json
[
  {"userId": 1, "displayName": "Alice"},
  {"userId": 2, "displayName": "Bob"}
]
```

### Ví dụ 3: Type conversion (Number → String)
Input:
```json
[
  {"id": 1, "name": "Alice", "age": 25},
  {"id": 2, "name": "Bob", "age": 30}
]
```

SET Node config:
```
Include Other Input Fields: ON
Fields to Set:
  - Key: idString
    Value: {{steps.manual1.id}}
    Type: String
  
  - Key: ageString
    Value: {{steps.manual1.age}}
    Type: String
```

**Output** (id và age converted sang string):
```json
[
  {"id": 1, "name": "Alice", "age": 25, "idString": "1", "ageString": "25"},
  {"id": 2, "name": "Bob", "age": 30, "idString": "2", "ageString": "30"}
]
```

### Ví dụ 4: Type conversion (String → Number)
Input:
```json
[
  {"productId": "101", "price": "29.99", "quantity": "5"},
  {"productId": "102", "price": "49.99", "quantity": "3"}
]
```

SET Node config:
```
Include Other Input Fields: ON
Fields to Set:
  - Key: priceNum
    Value: {{steps.manual1.price}}
    Type: Number
  
  - Key: quantityNum
    Value: {{steps.manual1.quantity}}
    Type: Number
```

**Output**:
```json
[
  {"productId": "101", "price": "29.99", "quantity": "5", "priceNum": 29.99, "quantityNum": 5},
  {"productId": "102", "price": "49.99", "quantity": "3", "priceNum": 49.99, "quantityNum": 3}
]
```

### Ví dụ 5: Tạo field mới từ multiple fields
Input:
```json
[
  {"firstName": "John", "lastName": "Doe"},
  {"firstName": "Jane", "lastName": "Smith"}
]
```

SET Node config:
```
Include Other Input Fields: ON
Fields to Set:
  - Key: fullName
    Value: {{steps.manual1.firstName}} {{steps.manual1.lastName}}
    Type: String
```

**Output**:
```json
[
  {"firstName": "John", "lastName": "Doe", "fullName": "John Doe"},
  {"firstName": "Jane", "lastName": "Smith", "fullName": "Jane Smith"}
]
```

### Ví dụ 6: Rename field
Input:
```json
[
  {"user_id": 1, "user_name": "Alice"},
  {"user_id": 2, "user_name": "Bob"}
]
```

SET Node config:
```
Include Other Input Fields: OFF
Fields to Set:
  - Key: id
    Value: {{steps.manual1.user_id}}
    Type: Number
  
  - Key: name
    Value: {{steps.manual1.user_name}}
    Type: String
```

**Output** (Fields đã được rename):
```json
[
  {"id": 1, "name": "Alice"},
  {"id": 2, "name": "Bob"}
]
```

### Ví dụ 7: Static values
Input:
```json
[
  {"id": 1, "name": "Alice"},
  {"id": 2, "name": "Bob"}
]
```

SET Node config:
```
Include Other Input Fields: ON
Fields to Set:
  - Key: status
    Value: active
    Type: String
  
  - Key: createdAt
    Value: 2025-11-02
    Type: String
  
  - Key: version
    Value: 1
    Type: Number
```

**Output** (Tất cả items có cùng static values):
```json
[
  {"id": 1, "name": "Alice", "status": "active", "createdAt": "2025-11-02", "version": 1},
  {"id": 2, "name": "Bob", "status": "active", "createdAt": "2025-11-02", "version": 1}
]
```

### Ví dụ 8: Boolean conversion
Input:
```json
[
  {"id": 1, "isActive": "true", "isVerified": "1"},
  {"id": 2, "isActive": "false", "isVerified": "0"}
]
```

SET Node config:
```
Include Other Input Fields: ON
Fields to Set:
  - Key: activeBool
    Value: {{steps.manual1.isActive}}
    Type: Boolean
  
  - Key: verifiedBool
    Value: {{steps.manual1.isVerified}}
    Type: Boolean
```

**Output**:
```json
[
  {"id": 1, "isActive": "true", "isVerified": "1", "activeBool": true, "verifiedBool": true},
  {"id": 2, "isActive": "false", "isVerified": "0", "activeBool": false, "verifiedBool": false}
]
```

**Boolean conversion rules**:
- `"true"`, `"1"`, `"yes"` → `true`
- Tất cả giá trị khác → `false`

### Ví dụ 9: Per-item token resolution
Input:
```json
[
  {"id": 1, "name": "Alice", "status": "active"},
  {"id": 2, "name": "Bob", "status": "inactive"},
  {"id": 3, "name": "Charlie", "status": "active"}
]
```

SET Node config:
```
Include Other Input Fields: ON
Fields to Set:
  - Key: userId
    Value: {{steps.manual1.id}}
    Type: String
```

**Output** (Mỗi item có userId khác nhau):
```json
[
  {"id": 1, "name": "Alice", "status": "active", "userId": "1"},
  {"id": 2, "name": "Bob", "status": "inactive", "userId": "2"},
  {"id": 3, "name": "Charlie", "status": "active", "userId": "3"}
]
```

**Quan trọng**: Token `{{steps.manual1.id}}` được resolve **PER ITEM**, không phải một lần cho tất cả!

## 📤 Output Structure

SET node trả về:
- **Nếu input là array**: Array với các items đã transformed
- **Nếu input là object**: Object đã transformed
- **Nếu không có input**: Object mới với fields được set

## 🎨 Drag & Drop Feature

**Cách dùng**:
1. Chạy node trước để có data trong DATA panel
2. Mở config của SET node
3. Trong "Fields to Set", click vào ô **Value**
4. Kéo field từ DATA panel vào ô Value
5. Token sẽ tự động được điền: `{{steps.<node-key>.<field>}}`

**Visual feedback**:
- Khi kéo field vào ô Value: Border màu xanh + "⬇️ DROP" indicator
- Token tự động format đúng

## 🔗 Kết nối với node khác

**Input từ node trước**:
- Manual node → Transform manual data
- HTTP node → Transform API response
- Filter node → Transform filtered data
- IF/Switch node → Transform conditionally

**Output đến node sau**:
- HTTP node → Gửi transformed data đến API
- Filter node → Lọc data đã transform
- SET node khác → Chain transformations

## 💡 Tips & Best Practices

1. **Include Other Fields**:
   - ON: Khi chỉ thêm/sửa vài fields
   - OFF: Khi muốn "pick" fields cụ thể

2. **Type Conversion**:
   - Luôn chọn type đúng để đảm bảo data consistency
   - String → Number: Phải là số hợp lệ
   - String → Boolean: `"true"`, `"1"`, `"yes"` → true

3. **Per-item Resolution**:
   - Token được resolve cho TỪNG item trong array
   - Mỗi item có context riêng

4. **Drag & Drop**:
   - Nhanh hơn typing thủ công
   - Tránh typo trong field names
   - Tự động format đúng token syntax

5. **Field Names**:
   - Dùng camelCase: `firstName`, `userId`
   - Tránh spaces và special characters
   - Có thể overwrite fields cũ bằng cách dùng cùng key

## ⚠️ Lưu ý

- **Array processing**: Mỗi item được xử lý độc lập với context riêng
- **Type validation**: Nếu convert fail, sẽ dùng giá trị mặc định:
  - Number: `0` nếu không parse được
  - Boolean: `false` nếu không phải `"true"`, `"1"`, `"yes"`
- **Empty values**: 
  - `null`, `undefined`, `""` → Convert sang `null`
- **Overwrite**: Nếu key trùng với field gốc, sẽ overwrite

## 🐛 Troubleshooting

**Field không xuất hiện trong output**:
- Check key name có đúng không (case-sensitive)
- Check "Include Other Input Fields" toggle
- Xem console logs để debug

**Type conversion sai**:
- Check type được chọn đúng chưa
- Check value có thể convert được không (ví dụ: `"abc"` không thể → number)
- Xem console logs để debug conversion

**Token không resolve**:
- Check token syntax: `{{steps.<node-key>.<field>}}`
- Node trước chưa chạy
- Field path sai

**Drag & drop không hoạt động**:
- Check DATA panel có data không (chạy node trước)
- Đảm bảo focus vào ô Value field
- Thử refresh page

**Per-item không hoạt động**:
- Đảm bảo input là array
- Check token reference đúng step
- Xem console logs để debug resolution
