# Node Runtime Utilities

Shared utility functions for processing tokens and field paths across all node runtimes.

## Overview

These utilities standardize how nodes handle token extraction and field value access, ensuring consistent behavior throughout the workflow system.

## Functions

### `extractFieldPath(value: string): string`

Extract the full field path from a token or return plain string as-is.

**Use case:** When you need the complete path to access nested fields.

**Examples:**
```typescript
extractFieldPath("name")                              // → "name"
extractFieldPath("{{steps.manual1.name}}")           // → "name"
extractFieldPath("{{steps.manual1.user.email}}")     // → "user.email"
extractFieldPath("{{steps.manual1.data[0].id}}")     // → "data[0].id"
extractFieldPath("{{steps.http1.users}}")            // → "users"
```

**Usage in nodes:**
- **FILTER node**: Extract field path for condition evaluation
- **SWITCH node**: Extract field path for array filtering
- **IF node**: Extract field path for array condition checking

---

### `extractFieldName(value: string): string`

Extract only the top-level (root) field name from a token.

**Use case:** When you need just the first field segment (e.g., for picking fields from an object).

**Examples:**
```typescript
extractFieldName("name")                              // → "name"
extractFieldName("{{steps.manual1.name}}")           // → "name"
extractFieldName("{{steps.manual1.user.email}}")     // → "user" (top-level)
extractFieldName("{{steps.manual1.data[0].id}}")     // → "data" (array field)
```

**Usage in nodes:**
- **SPLIT node**: Extract top-level field names for field picking

---

### `getFieldValue(obj: unknown, path: string): unknown`

Get nested field value from an object using dot notation or array index notation.

**Use case:** Navigate nested objects/arrays to retrieve values.

**Examples:**
```typescript
const data = {
  user: { name: "John", email: "john@example.com" },
  items: [{ id: 1, title: "Item 1" }]
};

getFieldValue(data, "user.name")        // → "John"
getFieldValue(data, "user.email")       // → "john@example.com"
getFieldValue(data, "items[0].id")      // → 1
getFieldValue(data, "items[0].title")   // → "Item 1"
```

**Usage in nodes:**
- **FILTER node**: Access item field values for condition evaluation
- **SWITCH node**: Access item field values for case matching
- **IF node**: Access item field values for filtering

---

## Architecture Pattern

### Two-Layer Token Handling

All nodes follow this pattern for consistent UX:

1. **UI Layer (SchemaForm)**
   - Chips widgets display **FULL tokens**: `{{steps.manual1.name}}`
   - Users can see exactly what they're referencing
   - No field extraction during drag-drop

2. **Runtime Layer (Node execution)**
   - Import utilities: `import { extractFieldPath, extractFieldName, getFieldValue } from "../utils"`
   - Extract field paths/names as needed
   - Process data using extracted values

### Example: SPLIT Node

**UI shows:**
```
Fields: [{{steps.manual1.name}}] [{{steps.manual1.user.email}}] [X]
```

**Runtime extracts:**
```typescript
import { extractFieldName } from "../utils";

const fields = ["{{steps.manual1.name}}", "{{steps.manual1.user.email}}"];
const fieldNames = fields.map(extractFieldName);  // ["name", "user"]
```

---

## Benefits

✅ **Consistency**: All nodes use same extraction logic
✅ **Clarity**: Users see full token paths in UI
✅ **Maintainability**: Single source of truth for token handling
✅ **Reusability**: Import utilities instead of duplicating code
✅ **Testing**: Easier to test shared utilities

---

## Node Usage Matrix

| Node   | extractFieldPath | extractFieldName | getFieldValue |
|--------|-----------------|------------------|---------------|
| MANUAL | -               | -                | -             |
| HTTP   | -               | -                | -             |
| IF     | ✓               | -                | ✓             |
| SWITCH | ✓               | -                | ✓             |
| FILTER | ✓               | -                | ✓             |
| SET    | -               | -                | (custom)      |
| SPLIT  | -               | ✓                | -             |

*Note: SET node uses custom `getPathValue` for token resolution context*

---

## Migration Guide

If you're adding a new node that needs field extraction:

1. **Import utilities:**
   ```typescript
   import { extractFieldPath, extractFieldName, getFieldValue } from "../utils";
   ```

2. **Extract field paths from config:**
   ```typescript
   const fieldPath = extractFieldPath(args.config.someField);
   ```

3. **Access nested values:**
   ```typescript
   const value = getFieldValue(item, fieldPath);
   ```

4. **Keep UI displaying full tokens** - No changes needed in schema/form!

---

## See Also

- [Master Node Documentation](./README.md)
- [SPLIT Node README](./split/README.md) - Example of extractFieldName usage
- [FILTER Node README](./filter/README.md) - Example of extractFieldPath + getFieldValue
- [Token Resolution Guide](../../TOKEN_RESOLUTION_GUIDE.md)
