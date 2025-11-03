# Token Resolution Test

## Scenario: Flattened Schema với Auto-unwrap Arrays

### Data Structure
```json
{
  "users": [
    {"id": 1, "name": "Alice", "status": "active"},
    {"id": 2, "name": "Bob", "status": "inactive"}
  ]
}
```

### Old Token Path (có [0])
```
{{steps.manual1.users[0].id}}     → 1
{{steps.manual1.users[0].name}}   → "Alice"
{{steps.manual1.users[0].status}} → "active"
```

### New Token Path (flatten, không có [0])
```
{{steps.manual1.users.id}}     → 1        (auto-unwrap array)
{{steps.manual1.users.name}}   → "Alice"  (auto-unwrap array)
{{steps.manual1.users.status}} → "active" (auto-unwrap array)
```

## Logic Auto-unwrap

Khi resolve token `{{steps.manual1.users.status}}`:

1. Start: cursor = `{users: [...]}`
2. Segment "users": cursor = `[{id:1, name:"Alice", status:"active"}, {...}]`
3. Segment "status": 
   - Detect cursor là array
   - Check segment "status" không phải số → auto-unwrap
   - cursor = `cursor[0]` = `{id:1, name:"Alice", status:"active"}`
   - cursor = `cursor.status` = `"active"`
4. Return: `"active"`

## Use Cases

### ✅ IF Node
```
Left Value: {{steps.manual1.users.status}}
Operator: ==
Right Value: active

→ Evaluates: "active" == "active" → TRUE
```

### ✅ Switch Filter Mode
```
Value: {{steps.manual1.users}}        → [{...}, {...}]
Filter Path: status
Cases: [active, inactive]

→ Split array by status field
```

### ✅ Backward Compatibility
```
Old token: {{steps.manual1.users[0].status}}
→ Still works! [0] explicitly accesses first item
```

## Edge Cases

### Array of Primitives
```
Data: {tags: ["javascript", "react", "node"]}
Token: {{steps.manual1.tags}}
→ Returns: ["javascript", "react", "node"] (entire array)

Token: {{steps.manual1.tags[0]}}
→ Returns: "javascript"
```

### Nested Arrays
```
Data: {matrix: [[1,2], [3,4]]}
Token: {{steps.manual1.matrix}}
→ Returns: [[1,2], [3,4]]

Token: {{steps.manual1.matrix[0]}}
→ Returns: [1,2]

Token: {{steps.manual1.matrix[0][1]}}
→ Returns: 2
```

### Empty Array
```
Data: {users: []}
Token: {{steps.manual1.users.id}}
→ Returns: undefined (cannot access field of empty array)
```

## Benefits

1. **User-friendly**: Không cần nhớ `[0]` khi kéo field
2. **Schema đơn giản**: Show trực tiếp fields, không có nested array level
3. **Backward compatible**: Token cũ vẫn hoạt động
4. **Smart resolution**: Tự động unwrap array khi cần
