# Filter Node

## 📋 Chức năng

**Filter Node** cho phép bạn lọc (filter) các items trong một array dựa trên các điều kiện. Node này hỗ trợ nhiều loại operators cho từng type dữ liệu (string, number, boolean, array).

## 🎨 UI Components (Custom Form)

**Form Component**: `FilterForm.tsx` (~150 lines)

**Features**:
- ✅ FilterConditionsEditor integration
- ✅ Logic operator toggle: AND / OR
- ✅ Mode toggle: INCLUDE (keep matching) / EXCLUDE (remove matching)
- ✅ Type-based operators với dropdown dynamic
- ✅ Add/remove conditions với visual feedback
- ✅ TokenizedInput cho source fields

**Dependencies**:
- React Hook Form + Zod validation
- Design system primitives (Button, Select)
- FilterConditionsEditor component (shared với IF node)

**Modes**:
- **INCLUDE**: Giữ items thỏa mãn conditions
- **EXCLUDE**: Loại bỏ items thỏa mãn conditions

## 🎯 Khi nào sử dụng

- Khi cần lọc array dựa trên điều kiện
- Khi muốn giữ lại chỉ những items thỏa mãn điều kiện
- Khi cần filter API response
- Khi muốn remove items không mong muốn

## ⚙️ Cấu hình

### 1. Filter Conditions
Danh sách các điều kiện. **TẤT CẢ** điều kiện phải thỏa mãn (AND logic).

Mỗi condition có:
- **Source Field**: Field cần check (hỗ trợ token)
- **Type**: Loại dữ liệu (String, Number, Boolean, Array)
- **Operator**: Toán tử so sánh (tùy theo type)
- **Value**: Giá trị để so sánh

### 2. Operators theo Type

#### String Operators
- **equals**: Bằng chính xác
- **not equals**: Không bằng
- **contains**: Chứa substring
- **not contains**: Không chứa substring
- **starts with**: Bắt đầu bằng
- **ends with**: Kết thúc bằng
- **is empty**: Là string rỗng
- **is not empty**: Không rỗng

#### Number Operators
- **equals**: Bằng
- **not equals**: Không bằng
- **greater than**: Lớn hơn `>`
- **greater than or equal**: Lớn hơn hoặc bằng `>=`
- **less than**: Nhỏ hơn `<`
- **less than or equal**: Nhỏ hơn hoặc bằng `<=`

#### Boolean Operators
- **is true**: Là true
- **is false**: Là false

#### Array Operators
- **contains**: Array chứa giá trị
- **not contains**: Array không chứa giá trị
- **is empty**: Array rỗng
- **is not empty**: Array không rỗng

## 📖 Ví dụ

### Ví dụ 1: Filter users by status
Input từ Manual node:
```json
[
  {"id": 1, "name": "Alice", "status": "active", "age": 25},
  {"id": 2, "name": "Bob", "status": "inactive", "age": 30},
  {"id": 3, "name": "Charlie", "status": "active", "age": 35},
  {"id": 4, "name": "David", "status": "pending", "age": 28}
]
```

Filter Node config:
```
Conditions:
  Condition 1:
    Source Field: {{steps.manual1.status}}
    Type: String
    Operator: equals
    Value: active
```

**Output**:
```json
[
  {"id": 1, "name": "Alice", "status": "active", "age": 25},
  {"id": 3, "name": "Charlie", "status": "active", "age": 35}
]
```

### Ví dụ 2: Filter với multiple conditions (AND)
Input:
```json
[
  {"id": 1, "name": "Alice", "status": "active", "age": 25},
  {"id": 2, "name": "Bob", "status": "active", "age": 17},
  {"id": 3, "name": "Charlie", "status": "active", "age": 35}
]
```

Filter Node config:
```
Conditions:
  Condition 1:
    Source Field: {{steps.manual1.status}}
    Type: String
    Operator: equals
    Value: active
  
  Condition 2:
    Source Field: {{steps.manual1.age}}
    Type: Number
    Operator: greater than or equal
    Value: 18
```

**Output** (Active AND Age >= 18):
```json
[
  {"id": 1, "name": "Alice", "status": "active", "age": 25},
  {"id": 3, "name": "Charlie", "status": "active", "age": 35}
]
```

### Ví dụ 3: Filter với string contains
Input:
```json
[
  {"id": 1, "email": "alice@gmail.com"},
  {"id": 2, "email": "bob@yahoo.com"},
  {"id": 3, "email": "charlie@gmail.com"},
  {"id": 4, "email": "david@hotmail.com"}
]
```

Filter Node config:
```
Conditions:
  Condition 1:
    Source Field: {{steps.manual1.email}}
    Type: String
    Operator: contains
    Value: gmail
```

**Output** (Email chứa "gmail"):
```json
[
  {"id": 1, "email": "alice@gmail.com"},
  {"id": 3, "email": "charlie@gmail.com"}
]
```

### Ví dụ 4: Filter với number range
Input:
```json
[
  {"product": "Laptop", "price": 1200},
  {"product": "Mouse", "price": 25},
  {"product": "Keyboard", "price": 80},
  {"product": "Monitor", "price": 300}
]
```

Filter Node config:
```
Conditions:
  Condition 1:
    Source Field: {{steps.manual1.price}}
    Type: Number
    Operator: greater than
    Value: 50
  
  Condition 2:
    Source Field: {{steps.manual1.price}}
    Type: Number
    Operator: less than or equal
    Value: 500
```

**Output** (Price > 50 AND Price <= 500):
```json
[
  {"product": "Keyboard", "price": 80},
  {"product": "Monitor", "price": 300}
]
```

### Ví dụ 5: Filter với boolean
Input:
```json
[
  {"id": 1, "name": "Alice", "verified": true},
  {"id": 2, "name": "Bob", "verified": false},
  {"id": 3, "name": "Charlie", "verified": true}
]
```

Filter Node config:
```
Conditions:
  Condition 1:
    Source Field: {{steps.manual1.verified}}
    Type: Boolean
    Operator: is true
```

**Output**:
```json
[
  {"id": 1, "name": "Alice", "verified": true},
  {"id": 3, "name": "Charlie", "verified": true}
]
```

### Ví dụ 6: Filter với array contains
Input:
```json
[
  {"id": 1, "name": "Alice", "tags": ["vip", "premium"]},
  {"id": 2, "name": "Bob", "tags": ["basic"]},
  {"id": 3, "name": "Charlie", "tags": ["vip", "enterprise"]}
]
```

Filter Node config:
```
Conditions:
  Condition 1:
    Source Field: {{steps.manual1.tags}}
    Type: Array
    Operator: contains
    Value: vip
```

**Output** (Tags array chứa "vip"):
```json
[
  {"id": 1, "name": "Alice", "tags": ["vip", "premium"]},
  {"id": 3, "name": "Charlie", "tags": ["vip", "enterprise"]}
]
```

### Ví dụ 7: Filter empty values
Input:
```json
[
  {"id": 1, "name": "Alice", "notes": "Important"},
  {"id": 2, "name": "Bob", "notes": ""},
  {"id": 3, "name": "Charlie", "notes": "VIP customer"}
]
```

Filter Node config:
```
Conditions:
  Condition 1:
    Source Field: {{steps.manual1.notes}}
    Type: String
    Operator: is not empty
```

**Output** (Notes không rỗng):
```json
[
  {"id": 1, "name": "Alice", "notes": "Important"},
  {"id": 3, "name": "Charlie", "notes": "VIP customer"}
]
```

## 📤 Output Structure

Filter node trả về array đã được filter:

```json
[
  { /* item 1 matched conditions */ },
  { /* item 2 matched conditions */ },
  ...
]
```

**Lưu ý**:
- Nếu không có item nào match → Trả về empty array `[]`
- Nếu input không phải array → Trả về empty array `[]`

## 🔗 Kết nối với node khác

**Input từ node trước**:
- Manual node → Filter manual data array
- HTTP node → Filter API response array
- SET node → Filter transformed data

**Output đến node sau**:
- SET node → Transform filtered items
- HTTP node → Gửi filtered data đến API
- IF node → Check số lượng items sau filter

## 💡 Tips & Best Practices

1. **Type validation**: Đảm bảo chọn đúng type cho field
2. **Multiple conditions = AND**: Tất cả conditions phải true
3. **OR logic**: Muốn OR → Dùng nhiều Filter nodes riêng biệt
4. **Empty array**: Check `{{steps.filter1.length}}` để biết có items không
5. **Case sensitive**: String comparison là case-sensitive
6. **Type conversion**: Filter tự động convert type khi cần (string → number, etc.)

## ⚠️ Lưu ý

- **Input phải là array**: Nếu không phải array, sẽ trả về empty array
- **Logic operator**: Hỗ trợ cả AND và OR (update từ phiên bản cũ)
- **Mode toggle**: INCLUDE giữ matching items, EXCLUDE loại bỏ matching items
- **Token auto-unwrap**: `{{steps.manual1.status}}` tự động lấy field từ từng item
- **Type conversion**: Node tự động convert value sang đúng type
- **Case sensitive**: String comparison phân biệt hoa thường

## � Development Guide

### Cách Update Node

#### 1. Thay đổi Schema (`schema.ts`)
```typescript
export const filterConfigSchema = z.object({
  conditions: z.array(z.object({
    field: z.string(),
    fieldType: z.enum(["string", "number", "boolean", "array"]),
    operator: z.string(),
    value: z.string(),
  })),
  logic: z.enum(["AND", "OR"]).default("AND"),
  mode: z.enum(["include", "exclude"]).default("include"),
});
```

#### 2. Thêm Mode Mới (`FilterForm.tsx`)
```typescript
// Add new mode option
mode: z.enum(["include", "exclude", "transform"]),

// Add conditional UI
{watch("mode") === "transform" && (
  <Input label="Transform Expression" {...register("transformExpr")} />
)}
```

#### 3. Update Runtime Logic (`runtime.ts`)
```typescript
export const filterRuntime: NodeRuntime<FilterConfig> = {
  async execute(config, context) {
    const { conditions, logic, mode } = config;
    const inputArray = Array.isArray(context.previousOutput) 
      ? context.previousOutput 
      : [context.previousOutput];
    
    const filtered = inputArray.filter(item => {
      const results = conditions.map(cond => evaluateCondition(cond, item));
      const matches = logic === "AND" 
        ? results.every(r => r === true)
        : results.some(r => r === true);
      
      return mode === "include" ? matches : !matches;
    });
    
    return { success: true, data: filtered };
  },
};
```

#### 4. Testing Checklist
- [ ] Test AND logic với multiple conditions
- [ ] Test OR logic với multiple conditions
- [ ] Test INCLUDE mode (keep matching)
- [ ] Test EXCLUDE mode (remove matching)
- [ ] Test all operators cho mỗi field type
- [ ] Test với empty array input
- [ ] Test với non-array input (should return [])
- [ ] Test token resolution trong conditions
- [ ] Verify FilterConditionsEditor functionality

## �🐛 Troubleshooting

**Trả về empty array**:
- Input không phải array
- Không có item nào match điều kiện
- Source field path sai
- Type không đúng (string vs number)

**Condition không hoạt động**:
- Check type của field: string, number, boolean, array
- Check operator phù hợp với type
- Check value format: `"string"` vs `123`
- Xem console logs để debug

**Token không resolve**:
- Phải dùng format `{{steps.<node-key>.<field>}}`
- Field path trong từng item, không phải root level
- Node trước chưa chạy

**Type conversion error**:
- Field thực tế là string nhưng chọn type Number
- Value không thể convert (ví dụ: "abc" → number)
- Check data type thực tế trong Result panel
