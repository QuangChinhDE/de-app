# 📚 Node Playground - Hướng dẫn sử dụng đầy đủ

## 📖 Tổng quan

Node Playground là công cụ để xây dựng và test workflows bằng cách kết nối các nodes với nhau. Mỗi node thực hiện một chức năng cụ thể và có thể truyền data sang node tiếp theo.

## 🎯 Các Node có sẵn

### 1. Manual Trigger (▶️)
- **Chức năng**: Khởi động workflow với dữ liệu manual
- **Type**: Trigger
- **[Chi tiết →](./manual/README.md)**

### 2. HTTP Request (🌐)
- **Chức năng**: Gọi REST APIs với GET/POST/PUT/PATCH/DELETE
- **Type**: Action
- **[Chi tiết →](./http/README.md)**

### 3. IF Node (❓)
- **Chức năng**: Kiểm tra điều kiện đơn giản (true/false)
- **Type**: Logic
- **[Chi tiết →](./if/README.md)**

### 4. Switch Node (🔀)
- **Chức năng**: Phân nhánh workflow với nhiều cases
- **Type**: Logic
- **[Chi tiết →](./switch/README.md)**

### 5. Filter Node (🔍)
- **Chức năng**: Lọc array items theo điều kiện
- **Type**: Utility
- **[Chi tiết →](./filter/README.md)**

### 6. SET Node (📝)
- **Chức năng**: Thêm/sửa/transform fields trong data
- **Type**: Utility
- **[Chi tiết →](./set/README.md)**

### 7. Split Out Node (✂️)
- **Chức năng**: Tách/chọn fields cụ thể từ data
- **Type**: Utility
- **[Chi tiết →](./split/README.md)**

## 🚀 Quick Start

### Bước 1: Tạo workflow đơn giản
1. Click **Manual Trigger** trong Sidebar
2. Nhập JSON data vào config panel
3. Click **RUN** button
4. Xem output trong Result Panel

### Bước 2: Thêm node HTTP
1. Click **HTTP Request** trong Sidebar
2. Config URL, method, headers
3. Dùng token từ Manual: `{{steps.manual1.fieldName}}`
4. Click **RUN ENTIRE FLOW**

### Bước 3: Process data với Filter
1. Click **Filter Node**
2. Add conditions để lọc data
3. Run để xem filtered results

### Bước 4: Transform với SET
1. Click **SET Node**
2. Add fields để transform
3. Kéo fields từ DATA panel vào Value
4. Run để xem transformed data

### Bước 5: Extract fields với SPLIT
1. Click **Split Out Node**
2. Add field names to split out
3. Choose include mode (none/all/selected)
4. Run để xem split results

## 💡 Concepts quan trọng

### Token Resolution
Dùng `{{steps.<node-key>.<field>}}` để reference data từ node khác.

**Ví dụ**:
```
{{steps.manual1.name}}      → Lấy field "name" từ manual1
{{steps.http1.data.id}}     → Lấy nested field
{{steps.http1.status}}      → Lấy HTTP status code
```

### Auto-connection
- Các nodes được tự động kết nối theo thứ tự
- Data tự động truyền từ node trước (`__previousOutput`)
- Không cần manual wiring

### Per-item Processing
- Khi input là array, các nodes xử lý **TỪNG ITEM** một cách độc lập
- Token được resolve trong context của từng item
- Ví dụ: SET node với array 5 items → 5 items output với fields khác nhau

### Drag & Drop
- Kéo fields từ DATA panel vào config
- Tự động tạo đúng token syntax
- Visual feedback khi hover

## 🔗 Workflow Patterns

### Pattern 1: Data Fetch → Process → Transform
```
Manual → HTTP → Filter → SET
```
1. Manual: Tạo query params
2. HTTP: Fetch data từ API
3. Filter: Lọc items cần thiết
4. SET: Transform sang format mong muốn

### Pattern 2: Conditional Processing
```
Manual → IF → HTTP (chỉ chạy nếu IF pass)
```
1. Manual: Input data
2. IF: Check điều kiện
3. HTTP: Chỉ call API nếu điều kiện đúng

### Pattern 3: Multi-branch Routing
```
Manual → Switch → [Different actions per case]
```
1. Manual: Input với field "type"
2. Switch: Route dựa trên "type" value
3. Each case: Xử lý khác nhau

### Pattern 4: Filter → Transform Pipeline
```
HTTP → Filter → SET → HTTP
```
1. HTTP: Fetch users từ API
2. Filter: Chỉ lấy active users
3. SET: Transform sang format khác
4. HTTP: POST transformed data đến API khác

### Pattern 5: Extract → Clean → Send
```
HTTP → SPLIT → HTTP
```
1. HTTP: Fetch data từ API
2. SPLIT: Chỉ lấy fields cần thiết (remove sensitive data)
3. HTTP: POST clean data đến API khác

## 📊 Data Flow

### Input/Output Chain
```
Manual Output
    ↓
HTTP Input (via tokens) → HTTP Output
    ↓
Filter Input (__previousOutput) → Filtered Output
    ↓
SET Input (__previousOutput) → Transformed Output
```

### Token Context
Mỗi node có access đến:
- `config`: Raw configuration
- `resolvedConfig`: Config sau khi resolve tokens
- `__previousOutput`: Output từ node trước (tự động)
- `__stepOutputs`: Tất cả step outputs (cho per-item resolution)

## 🎨 UI Features

### Canvas
- **Drag**: Pan canvas
- **Scroll**: Zoom in/out
- **Click node**: Mở config panel
- **Auto-layout**: Nodes tự động xếp theo thứ tự

### Config Panel
- **Dynamic form**: Render dựa trên node schema
- **Validation**: Real-time validation với zod
- **Token support**: Autocomplete tokens (planned)
- **Drag & drop**: Kéo fields từ DATA panel

### Data Panel
- **Tree view**: Hierarchical data display
- **Draggable fields**: Kéo vào config values
- **Type info**: Show data types
- **Expand/collapse**: Navigate nested data

### Result Panel
- **Timeline**: Xem lịch sử runs
- **Output**: Formatted JSON output
- **Error details**: Debug errors
- **Request preview**: Xem HTTP requests (HTTP node)

## ⚙️ Advanced Features

### Type Conversion (SET Node)
```
String → Number:  "123" → 123
String → Boolean: "true" → true, "1" → true
Number → String:  123 → "123"
JSON → Array:     "[1,2,3]" → [1,2,3]
JSON → Object:    '{"a":1}' → {a: 1}
```

### Array Processing
- Filter: Lọc items trong array
- SET: Transform từng item với per-item token resolution
- Auto-unwrap: Token tự động lấy first item nếu cần

### Error Handling
- IF node: Dừng workflow nếu condition false
- HTTP node: Trả về error status
- Filter node: Trả về empty array nếu không match
- Switch node: Luôn có default case

## 🐛 Debugging Tips

### 1. Check Token Resolution
- Xem `resolvedInput` trong Result Panel
- Verify token syntax: `{{steps.<key>.<field>}}`
- Đảm bảo node trước đã run

### 2. Check Data Types
- Xem data trong DATA panel
- Verify type trong Filter/SET nodes
- Test với simple data trước

### 3. Check Node Execution
- Xem status của từng node (success/error/running)
- Check Timeline trong Result Panel
- Xem console logs (F12)

### 4. Common Issues
- **Token không resolve**: Node trước chưa run hoặc path sai
- **Type mismatch**: String vs Number comparison
- **Empty output**: Filter conditions quá strict
- **Array processing**: Check per-item vs whole array

## 💾 Import/Export

### Export Flow
1. Click **Export** button trong Sidebar
2. File JSON được download
3. Chứa tất cả nodes và configs

### Import Flow
1. Click **Import** button
2. Chọn JSON file
3. Flow được restore với tất cả nodes

### Flow JSON Structure
```json
{
  "steps": [
    {
      "key": "manual1",
      "schemaKey": "manual",
      "config": { ... }
    },
    ...
  ]
}
```

## 📝 Best Practices

### 1. Node Naming
- Đặt tên clear và descriptive
- Dùng số thứ tự: `manual1`, `http1`, `filter1`
- Tránh special characters

### 2. Data Structure
- Dùng camelCase cho field names
- Consistent data types
- Avoid deeply nested objects

### 3. Error Prevention
- Luôn validate input data
- Check HTTP status codes
- Dùng IF node để prevent errors
- Test với small data first

### 4. Performance
- Filter data sớm để giảm processing
- Avoid unnecessary transformations
- Limit array sizes cho testing

### 5. Maintainability
- Document complex workflows
- Use meaningful field names
- Keep workflows simple và modular
- Export backups regularly

## 🔮 Roadmap Features

- [ ] Token autocomplete trong config
- [ ] Node search/filter trong Sidebar
- [ ] Undo/Redo functionality
- [ ] Workflow templates
- [ ] Custom node types
- [ ] Parallel execution
- [ ] Loop nodes
- [ ] Error handling nodes
- [ ] Webhook triggers
- [ ] Schedule triggers

## 📞 Support

Gặp vấn đề? Check:
1. Node-specific README trong mỗi folder
2. Console logs (F12)
3. Result Panel error messages
4. Example workflows trong docs

---

**Version**: 1.0.0  
**Last Updated**: November 2, 2025  
**Status**: Production Ready ✅
