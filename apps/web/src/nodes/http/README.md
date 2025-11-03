# HTTP Request Node

## 📋 Chức năng

**HTTP Request** node cho phép bạn gọi API endpoints qua các phương thức HTTP (GET, POST, PUT, PATCH, DELETE). Node này hỗ trợ authentication, custom headers, query parameters, và request body.

## 🎨 UI Components (Custom Form)

**Form Component**: `HttpForm.tsx` (~280 lines)

**Features**:
- ✅ Method selector: GET/POST/PUT/PATCH/DELETE
- ✅ TokenizedInput cho URL với token parsing
- ✅ Authentication: None/Bearer/Basic với conditional fields
- ✅ KeyValueEditor cho headers & query parameters
- ✅ 4 Body modes: JSON, Form Data, Multipart, Raw
- ✅ Conditional rendering based on method & body mode
- ✅ Drag-drop support cho tất cả fields

**Dependencies**:
- React Hook Form + Zod validation
- Design system primitives (Input, Select, Textarea, Button)
- TokenizedInput component
- KeyValueEditor component

## 🎯 Khi nào sử dụng

- Khi cần gọi REST API
- Khi cần fetch data từ external service
- Khi cần gửi data đến server
- Khi cần integrate với third-party APIs

## ⚙️ Cấu hình

### 1. Method
Chọn HTTP method:
- **GET**: Lấy dữ liệu (không có body)
- **POST**: Tạo mới resource
- **PUT**: Update toàn bộ resource
- **PATCH**: Update một phần resource
- **DELETE**: Xóa resource

### 2. URL
URL đầy đủ của API endpoint.

**Hỗ trợ tokens**: `{{steps.<node-key>.<field>}}`
**Drag & Drop**: Kéo fields từ Result/Data panel vào ô URL

**Ví dụ với dynamic URL**:
```
Manual node output: { "userId": 123 }
HTTP URL: https://api.example.com/users/{{steps.manual1.userId}}
→ Resolved: https://api.example.com/users/123
```

### 3. Authentication
Chọn loại authentication:
- **None**: Không cần authentication
- **Bearer Token**: Sử dụng token (thường là JWT)
- **Basic Auth**: Username + Password

**Hỗ trợ tokens trong auth fields**:
- Bearer Token: `{{steps.manual1.apiKey}}`
- Username: `{{steps.manual1.username}}`
- Password: `{{steps.manual1.password}}`

**Drag & Drop**: Kéo API key/credentials từ Result/Data panel

### 4. Query Parameters (Optional)
Danh sách key-value pairs sẽ được append vào URL.

**Ví dụ**: 
- Key: `page`, Value: `1`
- Key: `limit`, Value: `10`
→ URL: `https://api.example.com/users?page=1&limit=10`

### 5. Headers (Optional)
Custom HTTP headers.

**Ví dụ**:
- Key: `Content-Type`, Value: `application/json`
- Key: `X-Custom-Header`, Value: `custom-value`

### 6. Body (POST/PUT/PATCH only)
Request body dạng JSON.

**Hỗ trợ tokens**: Có thể dùng data từ node trước
**Drag & Drop**: Kéo fields từ Result/Data panel vào JSON editor

**Ví dụ**:
```json
{
  "userId": "{{steps.manual1.id}}",
  "name": "{{steps.manual1.name}}",
  "email": "{{steps.manual1.email}}"
}
```

## 📖 Ví dụ

### Ví dụ 1: GET request with query params
```
Method: GET
URL: https://jsonplaceholder.typicode.com/posts
Query Parameters:
  - userId: 1
```

**Output**:
```json
[
  {
    "userId": 1,
    "id": 1,
    "title": "sunt aut facere repellat...",
    "body": "quia et suscipit..."
  },
  ...
]
```

### Ví dụ 2: POST request với data từ Manual node
Giả sử Manual node output:
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

HTTP node config:
```
Method: POST
URL: https://api.example.com/users
Headers:
  - Content-Type: application/json
Body:
{
  "name": "{{steps.manual1.name}}",
  "email": "{{steps.manual1.email}}",
  "role": "user"
}
```

**Request được gửi đi**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user"
}
```

### Ví dụ 3: Bearer Token authentication
```
Method: GET
URL: https://api.github.com/user/repos
Authentication: Bearer Token
Token: ghp_xxxxxxxxxxxxxxxxxxxx
```

**Request headers**:
```
Authorization: Bearer ghp_xxxxxxxxxxxxxxxxxxxx
```

### Ví dụ 4: Basic Auth
```
Method: GET
URL: https://api.example.com/private-data
Authentication: Basic Auth
Username: admin
Password: secret123
```

**Request headers**:
```
Authorization: Basic YWRtaW46c2VjcmV0MTIz
```

### Ví dụ 5: Dynamic URL với Drag & Drop
**Workflow**: Manual → HTTP

**Manual node output**:
```json
{
  "userId": 456,
  "apiEndpoint": "https://api.example.com"
}
```

**HTTP node config** (kéo fields từ Result panel):
```
URL: {{steps.manual1.apiEndpoint}}/users/{{steps.manual1.userId}}
```

**Resolved URL**:
```
https://api.example.com/users/456
```

### Ví dụ 6: Dynamic Bearer Token
**Workflow**: Manual → HTTP

**Manual node output**:
```json
{
  "apiKey": "sk-proj-abc123xyz"
}
```

**HTTP node config** (kéo apiKey vào Bearer Token field):
```
Method: GET
URL: https://api.openai.com/v1/models
Authentication: Bearer Token
Token: {{steps.manual1.apiKey}}
```

**Request sẽ dùng token từ Manual node output**

## 📤 Output Structure

HTTP node trả về object với cấu trúc:

```typescript
{
  status: number,        // HTTP status code (200, 404, 500, etc.)
  data: any,            // Response body (parsed JSON hoặc text)
  headers: object       // Response headers
}
```

**Sử dụng trong node khác**:
- `{{steps.http1.data}}` → Toàn bộ response data
- `{{steps.http1.data.id}}` → Specific field
- `{{steps.http1.status}}` → HTTP status code

## 🔗 Kết nối với node khác

**Input từ node trước**:
- Manual node → Dùng output làm request body/params
- IF/Switch node → Chỉ call API khi điều kiện đúng
- SET node → Transform data trước khi gửi request

**Output đến node sau**:
- IF node → Check API response status/data
- Filter node → Lọc array response
- SET node → Transform API response

## 💡 Tips & Best Practices

1. **Error Handling**: Check `{{steps.http1.status}}` để xử lý lỗi
2. **Query vs Body**:
   - GET/DELETE: Dùng query params
   - POST/PUT/PATCH: Dùng body
3. **Content-Type**: Luôn set `Content-Type: application/json` cho JSON body
4. **Tokens**: Dùng tokens để tránh hardcode sensitive data
5. **Test với small data**: Test với ít records trước khi scale up

## ⚠️ Lưu ý

- GET và DELETE không có body
- Bearer Token và Basic Auth **không được mask** khi hiển thị (cần cẩn thận)
- CORS: Frontend không thể call directly → Cần proxy qua backend (đã có sẵn)

## 🔧 Development Guide

### Cách Update Node

#### 1. Thay đổi Schema (`schema.ts`)
```typescript
export const httpConfigSchema = z.object({
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  url: z.string().url(),
  authType: z.enum(["none", "bearer", "basic"]),
  headers: z.array(...),
  queryParams: z.array(...),
  bodyMode: z.enum(["json", "form", "multipart", "raw"]),
  // ... body fields
});
```

#### 2. Thêm Body Mode Mới (`HttpForm.tsx`)
```typescript
// Add new body mode in enum
bodyMode: z.enum(["json", "form", "multipart", "raw", "graphql"]),

// Add conditional rendering
{watch("bodyMode") === "graphql" && (
  <Textarea
    label="GraphQL Query"
    {...register("graphqlQuery")}
  />
)}
```

#### 3. Update Runtime (`runtime.ts`)
```typescript
export const httpRuntime: NodeRuntime<HttpConfig> = {
  async execute(config, context) {
    const { method, url, authType, headers, bodyMode, ... } = config;
    
    // Build request options
    const options = {
      method,
      headers: buildHeaders(headers, authType),
      body: buildBody(bodyMode, config),
    };
    
    const response = await fetch(resolveUrl(url, context), options);
    return { success: response.ok, data: await response.json() };
  },
};
```

#### 4. Testing Checklist
- [ ] Test all 5 HTTP methods
- [ ] Test all 3 auth types với valid/invalid credentials
- [ ] Test all 4 body modes với different data types
- [ ] Test token resolution trong URL/headers/body
- [ ] Test KeyValueEditor add/remove/edit functionality
- [ ] Verify CORS proxy works correctly
- [ ] Test error handling (network errors, 4xx, 5xx)
- Timeout: Request sẽ timeout sau một thời gian nhất định (mặc định của fetch)
- Không retry tự động: Nếu request fail, cần manual retry

## 🐛 Troubleshooting

**Lỗi CORS**:
- Đảm bảo request đi qua proxy backend (port 4000)
- Check API có cho phép CORS không

**401/403 Unauthorized**:
- Check authentication credentials
- Verify token còn valid không
- Check API permissions

**JSON Parse Error**:
- API response không phải JSON
- Check Content-Type header
- Xem raw response trong console
