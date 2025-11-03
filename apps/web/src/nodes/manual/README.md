# Manual Trigger Node

## 📋 Chức năng

**Manual Trigger** là node khởi đầu của workflow. Node này cho phép bạn nhập dữ liệu thủ công (manual data input) để bắt đầu một workflow.

## 🎨 UI Components (Custom Form)

**Form Component**: `ManualForm.tsx` (~330 lines)

**Features**:
- ✅ Dual mode: JSON mode & Form mode (builder)
- ✅ JSON mode: Monaco-like textarea với syntax validation
- ✅ Form mode: Visual field builder với drag-drop
- ✅ FormFieldsEditor: Add/remove fields với name/value/type
- ✅ Toggle switch giữa 2 modes với preserved data
- ✅ Type support: String, Number, Boolean, Object, Array

**Dependencies**:
- React Hook Form + Zod validation
- Design system primitives (Textarea, Button, Select)
- Embedded FormFieldsEditor component

## 🎯 Khi nào sử dụng

- Khi bạn muốn test workflow với dữ liệu mẫu
- Khi bạn cần khởi tạo workflow với dữ liệu tĩnh
- Khi bạn muốn tạo dữ liệu đầu vào cho các node tiếp theo

## ⚙️ Cấu hình

### Output Data (JSON)
Nhập dữ liệu dạng JSON. Dữ liệu này sẽ là output của node và có thể được sử dụng bởi các node tiếp theo.

**Lưu ý**: 
- Phải là JSON hợp lệ
- Có thể là object, array, string, number, boolean
- Dữ liệu này sẽ được gán vào `steps.<node-key>`

## 📖 Ví dụ

### Ví dụ 1: Object đơn giản
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30
}
```

**Output**: 
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30
}
```

**Sử dụng trong node khác**:
- `{{steps.manual1.id}}` → `1`
- `{{steps.manual1.name}}` → `"John Doe"`
- `{{steps.manual1.email}}` → `"john@example.com"`

### Ví dụ 2: Array of objects
```json
[
  {"id": 1, "name": "Alice", "status": "active"},
  {"id": 2, "name": "Bob", "status": "inactive"},
  {"id": 3, "name": "Charlie", "status": "active"}
]
```

**Output**: Array với 3 items

**Sử dụng trong node khác**:
- `{{steps.manual1.id}}` → `1` (auto-unwrap first item)
- `{{steps.manual1[0].name}}` → `"Alice"`
- `{{steps.manual1[1].status}}` → `"inactive"`

### Ví dụ 3: Nested object
```json
{
  "user": {
    "profile": {
      "name": "Jane Doe",
      "age": 25
    },
    "settings": {
      "theme": "dark",
      "notifications": true
    }
  }
}
```

**Output**: Nested object

**Sử dụng trong node khác**:
- `{{steps.manual1.user.profile.name}}` → `"Jane Doe"`
- `{{steps.manual1.user.settings.theme}}` → `"dark"`

## 🔗 Kết nối với node khác

Manual Trigger node **KHÔNG** nhận input từ node trước (vì nó là node khởi đầu).

Output của Manual node có thể được sử dụng bởi:
- **HTTP Node**: Dùng data làm request body hoặc query params
- **IF Node**: Kiểm tra điều kiện trên data
- **Switch Node**: Phân nhánh dựa trên giá trị trong data
- **Filter Node**: Lọc array data
- **SET Node**: Transform/modify data

## 💡 Tips & Best Practices

1. **Sử dụng JSON mode**: Cho data phức tạp với nested objects/arrays
2. **Sử dụng Form mode**: Cho data đơn giản, dễ quản lý fields
3. **Validate JSON**: Đảm bảo JSON hợp lệ trước khi Run
4. **Test data**: Dùng Fuzz button để generate test data nhanh

## 🔧 Development Guide

### Cách Update Node

#### 1. Thay đổi Schema (`schema.ts`)
```typescript
export const manualConfigSchema = z.object({
  mode: z.enum(["json", "form"]),
  data: z.string(), // JSON string for json mode
  fields: z.array(...), // Array for form mode
});
```

#### 2. Update Form (`ManualForm.tsx`)
- Modify field layout in JSX
- Add new validation rules
- Update FormFieldsEditor for new field types

#### 3. Update Runtime (`runtime.ts`)
```typescript
export const manualRuntime: NodeRuntime<ManualConfig> = {
  async execute(config, context) {
    const { mode, data, fields } = config;
    
    if (mode === "json") {
      return { success: true, data: JSON.parse(data) };
    } else {
      // Convert fields to object
      const result = convertFieldsToObject(fields);
      return { success: true, data: result };
    }
  },
};
```

#### 4. Testing Checklist
- [ ] Test JSON mode với valid/invalid JSON
- [ ] Test Form mode với different field types
- [ ] Test mode switching preserves data
- [ ] Test drag-drop functionality
- [ ] Verify output format matches expected structure

1. **JSON hợp lệ**: Luôn kiểm tra JSON syntax trước khi run
2. **Dữ liệu mẫu**: Nên dùng dữ liệu giống với dữ liệu thực tế để test chính xác
3. **Array vs Object**: 
   - Dùng array nếu muốn test xử lý nhiều items
   - Dùng object nếu chỉ cần test với 1 item
4. **Tên field**: Đặt tên field rõ ràng, dễ hiểu để dễ reference trong các node sau

## ⚠️ Lưu ý

- Manual node phải được chạy thủ công (click Run button)
- Không thể kết nối input từ node khác vào Manual node
- JSON không hợp lệ sẽ gây lỗi khi parse
