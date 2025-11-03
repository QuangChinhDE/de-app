# Split Out Node

## 📋 Chức năng

**Split Out Node** cho phép bạn tách/chọn (split/extract) các fields cụ thể từ data. Node này là **ĐỐI LẬP** với SET node:
- **SET Node**: Thêm/sửa fields
- **SPLIT Node**: Tách/chọn fields ra

## 🎨 UI Components (Custom Form)

**Form Component**: `SplitForm.tsx` (~140 lines)

**Features**:
- ✅ Mode toggle: AUTO / FIELD
- ✅ AUTO mode: Automatically split array items
- ✅ FIELD mode: TokenizedInput cho fieldPath để split nested arrays
- ✅ Info box explaining split behavior với indigo color
- ✅ Conditional rendering based on mode

**Dependencies**:
- React Hook Form + Zod validation
- Design system primitives (Button, Select)
- TokenizedInput component

## 🎯 Khi nào sử dụng

- Khi cần extract một số fields cụ thể từ object
- Khi muốn loại bỏ fields không cần thiết
- Khi cần "pick" fields để gửi đến API
- Khi muốn simplify data structure
- Khi cần rename workflow bằng cách chọn fields

## ⚙️ Cấu hình

### 1. Fields To Split Out
Danh sách tên các fields muốn tách ra.

**Input**: Array of strings (field names)
**Cách dùng**: Type tên field và nhấn Enter

### 2. Include (none/all/selected)
Chọn cách xử lý các fields khác (không nằm trong split list):

- **`none`**: Chỉ lấy split fields (loại bỏ tất cả fields khác)
- **`all`**: Lấy split fields + TẤT CẢ fields khác
- **`selected`**: Lấy split fields + CHỈ một số fields được chọn

### 3. Select Other Fields
Chỉ dùng khi `includeMode = "selected"`.

Danh sách tên các fields khác muốn giữ lại (ngoài split fields).

## 📖 Ví dụ

### Ví dụ 1: Split ra một số fields (Include = none)
Input từ Manual node:
```json
[
  {"id": 1, "name": "Alice", "email": "alice@example.com", "age": 25, "address": "123 St"},
  {"id": 2, "name": "Bob", "email": "bob@example.com", "age": 30, "address": "456 Ave"}
]
```

Split Node config:
```
Fields To Split Out: ["id", "name"]
Include: none
```

**Output** (Chỉ có id và name):
```json
[
  {"id": 1, "name": "Alice"},
  {"id": 2, "name": "Bob"}
]
```

### Ví dụ 2: Split + Keep all other fields (Include = all)
Input:
```json
[
  {"userId": 1, "userName": "Alice", "email": "alice@example.com", "role": "admin"},
  {"userId": 2, "userName": "Bob", "email": "bob@example.com", "role": "user"}
]
```

Split Node config:
```
Fields To Split Out: ["userId", "userName"]
Include: all
```

**Output** (Split fields + tất cả fields khác):
```json
[
  {"userId": 1, "userName": "Alice", "email": "alice@example.com", "role": "admin"},
  {"userId": 2, "userName": "Bob", "email": "bob@example.com", "role": "user"}
]
```

**Lưu ý**: Với `include = all`, output giống input (vì giữ tất cả fields). Dùng mode này khi muốn đảm bảo split fields luôn có trong output ngay cả khi không tồn tại.

### Ví dụ 3: Split + Selected other fields (Include = selected)
Input:
```json
[
  {"id": 1, "name": "Alice", "email": "alice@example.com", "age": 25, "phone": "111", "address": "123 St"},
  {"id": 2, "name": "Bob", "email": "bob@example.com", "age": 30, "phone": "222", "address": "456 Ave"}
]
```

Split Node config:
```
Fields To Split Out: ["id", "name"]
Include: selected
Select Other Fields: ["email"]
```

**Output** (Split fields + chỉ email):
```json
[
  {"id": 1, "name": "Alice", "email": "alice@example.com"},
  {"id": 2, "name": "Bob", "email": "bob@example.com"}
]
```

### Ví dụ 4: Remove sensitive fields
Input:
```json
[
  {"id": 1, "name": "Alice", "password": "secret123", "token": "abc", "role": "admin"},
  {"id": 2, "name": "Bob", "password": "pass456", "token": "xyz", "role": "user"}
]
```

Split Node config (Remove password và token):
```
Fields To Split Out: ["id", "name", "role"]
Include: none
```

**Output** (Loại bỏ sensitive fields):
```json
[
  {"id": 1, "name": "Alice", "role": "admin"},
  {"id": 2, "name": "Bob", "role": "user"}
]
```

### Ví dụ 5: API payload preparation
Input:
```json
[
  {"userId": 1, "userName": "Alice", "email": "alice@example.com", "createdAt": "2024-01-01", "updatedAt": "2024-02-01", "internal_flag": true},
  {"userId": 2, "userName": "Bob", "email": "bob@example.com", "createdAt": "2024-01-15", "updatedAt": "2024-02-10", "internal_flag": false}
]
```

Split Node config (Chỉ gửi fields cần thiết đến API):
```
Fields To Split Out: ["userId", "userName", "email"]
Include: none
```

**Output** (Clean payload cho API):
```json
[
  {"userId": 1, "userName": "Alice", "email": "alice@example.com"},
  {"userId": 2, "userName": "Bob", "email": "bob@example.com"}
]
```

### Ví dụ 6: Object input (single item)
Input:
```json
{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com",
  "age": 25,
  "address": "123 St"
}
```

Split Node config:
```
Fields To Split Out: ["id", "email"]
Include: none
```

**Output**:
```json
{
  "id": 1,
  "email": "alice@example.com"
}
```

### Ví dụ 7: Field không tồn tại
Input:
```json
[
  {"id": 1, "name": "Alice"},
  {"id": 2, "name": "Bob", "email": "bob@example.com"}
]
```

Split Node config:
```
Fields To Split Out: ["id", "email"]
Include: none
```

**Output** (email chỉ có ở item có field đó):
```json
[
  {"id": 1},
  {"id": 2, "email": "bob@example.com"}
]
```

## 📤 Output Structure

Split node trả về:
- **Nếu input là array**: Array với các items đã split
- **Nếu input là object**: Object đã split
- **Nếu không có input**: `null`

## 🔗 Kết nối với node khác

**Input từ node trước**:
- Manual node → Split manual data
- HTTP node → Extract fields từ API response
- Filter node → Split filtered data
- SET node → Split transformed data

**Output đến node sau**:
- HTTP node → Gửi clean data đến API
- SET node → Transform split data
- Filter node → Lọc split data

## 💡 Tips & Best Practices

1. **Include Mode Selection**:
   - `none`: Khi cần loại bỏ nhiều fields (blacklist approach)
   - `all`: Khi cần đảm bảo split fields tồn tại
   - `selected`: Khi cần control chính xác fields nào giữ lại

2. **vs SET Node**:
   - **SPLIT**: Pick/extract existing fields (không tạo mới)
   - **SET**: Add/modify fields (có thể tạo mới)
   - Dùng SPLIT khi muốn "chọn", dùng SET khi muốn "biến đổi"

3. **Remove Sensitive Data**:
   - Split out chỉ public fields
   - Dùng `include = none` để loại bỏ passwords, tokens, internal flags

4. **API Payload**:
   - Split ra chỉ fields mà API cần
   - Giảm payload size
   - Tránh gửi unnecessary data

5. **Performance**:
   - Split càng sớm càng tốt để giảm data size
   - Avoid processing fields không cần thiết

## ⚠️ Lưu ý

- **Field names**: Case-sensitive (phân biệt hoa thường)
- **Missing fields**: Nếu field không tồn tại, sẽ không xuất hiện trong output (không có error)
- **Empty fields list**: Nếu không chọn field nào → Output giống input
- **Include mode**:
  - `none`: Chỉ split fields
  - `all`: Split fields + all others (same as input nếu all fields exist)
  - `selected`: Split fields + only selected others

## 🔄 So sánh với SET Node

| Feature | SPLIT Node | SET Node |
|---------|-----------|----------|
| **Purpose** | Extract/Pick fields | Add/Modify fields |
| **Creates new fields** | ❌ No | ✅ Yes |
| **Removes fields** | ✅ Yes (with `include=none`) | ✅ Yes (with `includeOtherFields=false`) |
| **Type conversion** | ❌ No | ✅ Yes |
| **Rename fields** | ❌ No (only pick) | ✅ Yes (new key name) |
| **Use tokens** | ❌ No | ✅ Yes |
| **Best for** | Filtering fields | Transforming data |

**Workflow Pattern**:
```
HTTP → SPLIT (pick fields) → SET (transform) → HTTP (send)
```

## 🐛 Troubleshooting

**Output giống input**:
- Check `includeMode` = `all` và tất cả fields được split
- Nếu muốn chỉ lấy split fields → Dùng `includeMode = none`

**Field bị mất**:
- Check field name spelling (case-sensitive)
- Check field có tồn tại trong input không
- Xem console logs để debug

**Empty output**:
- Input không phải object/array
- Tất cả split fields không tồn tại trong input
- Check data trong DATA panel

**Include mode không hoạt động**:
- Verify includeMode value: `"none"`, `"all"`, hoặc `"selected"`
- Check selectedFields khi dùng `includeMode = "selected"`
- Xem console logs

## 🎯 Use Cases

1. **Clean API Payloads**: Chỉ gửi fields cần thiết
2. **Remove Sensitive Data**: Loại bỏ passwords, tokens trước khi log
3. **Simplify Data**: Giảm complexity của nested objects
4. **Extract Metadata**: Lấy chỉ metadata fields
5. **Privacy Compliance**: Remove PII (Personally Identifiable Information)

---

**Version**: 1.0.0  
**Last Updated**: November 2, 2025  
**Status**: Production Ready ✅
