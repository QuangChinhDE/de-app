# 💻 CODE Node

Execute custom JavaScript code with access to input data.

## 📋 Chức năng

**Code Node** cho phép bạn execute custom JavaScript code để transform, calculate, hoặc manipulate data theo logic tùy chỉnh.

## 🎨 UI Components (Custom Form)

**Form Component**: `CodeForm.tsx` (~140 lines)

**Features**:
- ✅ Textarea với monospace font cho code editor
- ✅ TokenizedInput cho inputData field (optional)
- ✅ Tips box với amber color showing usage examples
- ✅ Code validation (syntax check)
- ✅ Info box explaining how to use 'input' variable

**Dependencies**:
- React Hook Form + Zod validation
- Design system primitives (Textarea, Button)
- TokenizedInput component

## 🎯 Khi nào sử dụng

- **Custom Calculations**: Logic phức tạp không có sẵn node
- **Data Transformation**: Transform structure theo custom rules
- **Conditional Logic**: Complex if/else logic
- **String Manipulation**: Regex, parsing, formatting
- **Math Operations**: Advanced calculations
- **Array Processing**: Custom filtering, mapping, reducing

## ⚙️ Cấu hình

### 1. Code (Required)
JavaScript code để execute.

**Type**: String (multiline)
**Syntax**: Standard JavaScript ES6+
**Return**: Must return a value (object, array, string, number, boolean)

**Available Variables**:
- `input` - Input data từ previous step hoặc inputData field
- `steps` - Access to all step outputs (e.g., `steps.manual1`)
- Standard JavaScript: `Math`, `Date`, `JSON`, `Array`, `Object`, etc.

**Example**:
```javascript
// Simple transformation
return {
  ...input,
  fullName: `${input.firstName} ${input.lastName}`,
  age: 2024 - input.birthYear
};
```

### 2. Input Data (Optional)
Override input data thay vì dùng previous step output.

**Type**: Token string (optional)
**Example**: `{{steps.manual1}}`, `{{steps.http1.body}}`
**Use Case**: Access data từ specific step thay vì previous step

## 📖 Ví dụ

### Ví dụ 1: Simple Calculation
Input:
```json
{
  "price": 100,
  "quantity": 3,
  "discount": 0.1
}
```

**Code**:
```javascript
const subtotal = input.price * input.quantity;
const discountAmount = subtotal * input.discount;
const total = subtotal - discountAmount;

return {
  ...input,
  subtotal,
  discountAmount,
  total
};
```

**Output**:
```json
{
  "price": 100,
  "quantity": 3,
  "discount": 0.1,
  "subtotal": 300,
  "discountAmount": 30,
  "total": 270
}
```

---

### Ví dụ 2: String Manipulation
Input:
```json
{
  "email": "  JOHN.DOE@EXAMPLE.COM  ",
  "phone": "+1-555-123-4567"
}
```

**Code**:
```javascript
return {
  email: input.email.trim().toLowerCase(),
  phone: input.phone.replace(/[^0-9]/g, ''),
  username: input.email.split('@')[0].trim().toLowerCase()
};
```

**Output**:
```json
{
  "email": "john.doe@example.com",
  "phone": "15551234567",
  "username": "john.doe"
}
```

---

### Ví dụ 3: Array Processing
Input:
```json
{
  "users": [
    {"name": "Alice", "age": 25, "active": true},
    {"name": "Bob", "age": 30, "active": false},
    {"name": "Charlie", "age": 35, "active": true}
  ]
}
```

**Code**:
```javascript
const activeUsers = input.users.filter(u => u.active);
const totalAge = activeUsers.reduce((sum, u) => sum + u.age, 0);
const averageAge = totalAge / activeUsers.length;

return {
  activeUsers,
  activeCount: activeUsers.length,
  averageAge: averageAge.toFixed(1)
};
```

**Output**:
```json
{
  "activeUsers": [
    {"name": "Alice", "age": 25, "active": true},
    {"name": "Charlie", "age": 35, "active": true}
  ],
  "activeCount": 2,
  "averageAge": "30.0"
}
```

---

### Ví dụ 4: Conditional Logic
Input:
```json
{
  "score": 85,
  "attendance": 90
}
```

**Code**:
```javascript
let grade;
if (input.score >= 90 && input.attendance >= 80) {
  grade = 'A';
} else if (input.score >= 80 && input.attendance >= 70) {
  grade = 'B';
} else if (input.score >= 70) {
  grade = 'C';
} else {
  grade = 'F';
}

return {
  ...input,
  grade,
  passed: grade !== 'F'
};
```

**Output**:
```json
{
  "score": 85,
  "attendance": 90,
  "grade": "B",
  "passed": true
}
```

---

### Ví dụ 5: Date Manipulation
Input:
```json
{
  "orderDate": "2024-01-15"
}
```

**Code**:
```javascript
const orderDate = new Date(input.orderDate);
const today = new Date();
const daysAgo = Math.floor((today - orderDate) / (1000 * 60 * 60 * 24));

return {
  orderDate: input.orderDate,
  daysAgo,
  formattedDate: orderDate.toLocaleDateString('en-US'),
  isRecent: daysAgo < 30
};
```

**Output**:
```json
{
  "orderDate": "2024-01-15",
  "daysAgo": 293,
  "formattedDate": "1/15/2024",
  "isRecent": false
}
```

---

### Ví dụ 6: Access Multiple Steps
**Code**:
```javascript
// Access data từ multiple steps
const user = steps.manual1;
const orders = steps.http1.body;

return {
  userId: user.id,
  userName: user.name,
  orderCount: orders.length,
  totalSpent: orders.reduce((sum, o) => sum + o.amount, 0)
};
```

## 💡 Tips & Best Practices

1. **Always Return**:
   - Code PHẢI có `return` statement
   - Return giá trị (không return undefined)

2. **Error Handling**:
   ```javascript
   try {
     // Your code here
     return result;
   } catch (error) {
     return { error: error.message };
   }
   ```

3. **Use ES6+ Features**:
   - Spread operator: `{...input}`
   - Arrow functions: `arr.map(x => x * 2)`
   - Template strings: `` `Hello ${name}` ``
   - Destructuring: `const {name, age} = input`

4. **Avoid Side Effects**:
   - Don't modify `input` directly
   - Create new objects: `{...input, newField: value}`

5. **Console Logging**:
   ```javascript
   console.log('Debug:', input);
   return result;
   ```
   (Logs visible trong browser console)

6. **Type Checking**:
   ```javascript
   if (Array.isArray(input)) {
     // Handle array
   } else {
     // Handle object
   }
   ```

## ⚠️ Lưu ý

- **No async/await**: Code execution is synchronous
- **No external libraries**: Chỉ có built-in JavaScript
- **No DOM access**: Không thể access `window`, `document`
- **Timeout**: Code execution có timeout (5 seconds)
- **Security**: Code runs trong isolated context
- **No Network**: Không thể gọi `fetch`, `XMLHttpRequest`

**Sandbox Restrictions**:
- ✅ Allowed: Math, Date, JSON, Array/Object methods
- ❌ Not Allowed: fetch, setTimeout, localStorage, DOM APIs

## 🔧 Development Guide

### Cách Update Node

#### 1. Thay đổi Schema (`schema.ts`)
```typescript
export const codeConfigSchema = z.object({
  code: z.string().min(1, "Code is required"),
  inputData: z.string().optional(), // Token string
  timeout: z.number().default(5000), // NEW: Configurable timeout
});

export type CodeConfig = z.infer<typeof codeConfigSchema>;
```

#### 2. Thêm Feature Mới (`CodeForm.tsx`)
```typescript
// Add timeout configuration
<Input
  label="Timeout (ms)"
  type="number"
  {...register("timeout", { valueAsNumber: true })}
/>

// Add code template buttons
<div className="flex gap-2">
  <button
    type="button"
    onClick={() => setValue("code", "return { ...input, newField: 'value' };")}
  >
    Template: Transform
  </button>
  <button
    type="button"
    onClick={() => setValue("code", "return input.filter(x => x.active);")}
  >
    Template: Filter Array
  </button>
</div>

// Add syntax highlighting (future enhancement)
<CodeEditor
  value={watch("code")}
  onChange={(val) => setValue("code", val)}
  language="javascript"
/>
```

#### 3. Update Runtime Logic (`runtime.ts`)
```typescript
export const codeRuntime: NodeRuntime<CodeConfig> = {
  async execute(config, context) {
    const { code, inputData, timeout } = config;
    
    // Prepare input
    const input = inputData 
      ? resolveExpression(inputData, context)
      : context.previousOutput;
    
    // Create safe execution context
    const sandbox = {
      input,
      steps: context.steps,
      Math,
      Date,
      JSON,
      console,
      Array,
      Object,
    };
    
    // Execute code với timeout
    try {
      const fn = new Function(...Object.keys(sandbox), `
        "use strict";
        ${code}
      `);
      
      const result = await Promise.race([
        Promise.resolve(fn(...Object.values(sandbox))),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Timeout")), timeout)
        ),
      ]);
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};
```

#### 4. Testing Checklist
- [ ] Test simple return statements
- [ ] Test với array processing (map/filter/reduce)
- [ ] Test với object manipulation
- [ ] Test error handling (try/catch)
- [ ] Test inputData token resolution
- [ ] Test access to steps variable
- [ ] Test timeout behavior (long-running code)
- [ ] Test syntax errors (should catch và return error)
- [ ] Test với empty code (should show validation error)
- [ ] Test console.log output (visible in browser console)

## 🐛 Troubleshooting

**"undefined" output**:
- Ensure code has `return` statement
- Check return value is not undefined

**Syntax errors**:
- Check for missing semicolons, brackets
- Verify variable names are correct
- Use browser console to debug

**"input is not defined"**:
- Check previous step has output
- Or provide inputData field

**Timeout errors**:
- Simplify code (avoid infinite loops)
- Reduce complexity
- Split into multiple CODE nodes

**Cannot access variable**:
- Check variable is in scope
- Use `steps.xxx` for step outputs
- Use `input` for input data
