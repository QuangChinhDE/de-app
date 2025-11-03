# 🔀 SORT Node

Sort array items by field with direction and data type support.

## 📋 Chức năng

**Sort Node** sắp xếp các items trong array theo một field cụ thể với direction (ascending/descending) và data type (string/number/date).

## 🎨 UI Components (Custom Form)

**Form Component**: `SortForm.tsx` (~180 lines)

**Features**:
- ✅ TokenizedInput cho items array
- ✅ TokenizedInput cho field path
- ✅ Direction toggle buttons với icons (↑ Ascending / ↓ Descending)
- ✅ DataType selector dropdown (string/number/date)
- ✅ Visual toggle buttons với active state colors

**Dependencies**:
- React Hook Form + Zod validation
- Design system primitives (Input, Select, Button)
- TokenizedInput component

## 🎯 Khi nào sử dụng

- **Sort API Response**: Sắp xếp users by name, age, created date
- **Top N Items**: Combine với Limit để lấy top scorers
- **Order Results**: Sắp xếp products by price, rating
- **Date Sorting**: Sort events by date
- **Custom Ordering**: Sort theo custom field

## ⚙️ Cấu hình

### 1. Items
Array cần sort.

**Type**: Array of objects (required)
**Input**: Token như `{{steps.xxx}}`
**Example**: `{{steps.http1.body.users}}`

### 2. Field
Field name hoặc path để sort theo.

**Type**: String (field path)
**Examples**:
- Simple: `age`, `name`, `score`
- Nested: `profile.age`, `address.city`
- Array index: `scores[0]`

**Supports**: TokenizedInput cho dynamic field

### 3. Direction
Hướng sắp xếp.

**Options**:
- `asc` (Ascending ↑): Tăng dần (A-Z, 0-9, oldest-newest)
- `desc` (Descending ↓): Giảm dần (Z-A, 9-0, newest-oldest)

**UI**: Toggle buttons với visual icons

### 4. Data Type
Loại dữ liệu của field để sort correctly.

**Options**:
- `string`: Alphabetical sorting (case-insensitive)
- `number`: Numeric sorting
- `date`: Date/timestamp sorting (ISO 8601)

**Important**: Chọn đúng type để sort correctly
- Wrong type → Incorrect order
- Example: "10" < "2" (string), but 10 > 2 (number)

## 📖 Ví dụ

### Ví dụ 1: Sort by Age (Number, Ascending)
Input:
```json
[
  {"name": "Alice", "age": 30},
  {"name": "Bob", "age": 25},
  {"name": "Charlie", "age": 35}
]
```

**Config**:
```
Items: {{steps.manual1}}
Field: age
Direction: asc
Data Type: number
```

**Output**:
```json
[
  {"name": "Bob", "age": 25},
  {"name": "Alice", "age": 30},
  {"name": "Charlie", "age": 35}
]
```

---

### Ví dụ 2: Sort by Name (String, Descending)
Input:
```json
[
  {"name": "Alice", "score": 90},
  {"name": "Charlie", "score": 85},
  {"name": "Bob", "score": 95}
]
```

**Config**:
```
Field: name
Direction: desc
Data Type: string
```

**Output** (Z→A):
```json
[
  {"name": "Charlie", "score": 85},
  {"name": "Bob", "score": 95},
  {"name": "Alice", "score": 90}
]
```

---

### Ví dụ 3: Sort by Date (Descending = Newest First)
Input:
```json
[
  {"event": "Event A", "date": "2024-01-15"},
  {"event": "Event B", "date": "2024-03-20"},
  {"event": "Event C", "date": "2024-02-10"}
]
```

**Config**:
```
Field: date
Direction: desc
Data Type: date
```

**Output** (Newest → Oldest):
```json
[
  {"event": "Event B", "date": "2024-03-20"},
  {"event": "Event C", "date": "2024-02-10"},
  {"event": "Event A", "date": "2024-01-15"}
]
```

---

### Ví dụ 4: Sort Nested Field
Input:
```json
[
  {"name": "Alice", "profile": {"age": 30}},
  {"name": "Bob", "profile": {"age": 25}},
  {"name": "Charlie", "profile": {"age": 35}}
]
```

**Config**:
```
Field: profile.age
Direction: asc
Data Type: number
```

**Output**: Sorted by nested age field

---

### Ví dụ 5: Top 10 Highest Scores
```
HTTP (get users) → SORT (by score, desc) → LIMIT (10)
```

**Sort Config**:
```
Field: score
Direction: desc
Data Type: number
```

Then **Limit Config**: `Skip: 0, Limit: 10`

**Result**: Top 10 highest scores

## 💡 Tips & Best Practices

1. **Choose Correct Data Type**:
   - String: For text, names, IDs (alphabetical)
   - Number: For integers, floats, counts (numeric)
   - Date: For ISO dates, timestamps (chronological)

2. **String Sorting is Case-Insensitive**:
   - "alice" = "Alice" = "ALICE"

3. **Number String Problem**:
   ```javascript
   // String sort (WRONG for numbers)
   ["1", "10", "2"] → ["1", "10", "2"]
   
   // Number sort (CORRECT)
   [1, 10, 2] → [1, 2, 10]
   ```

4. **Date Format**:
   - Use ISO 8601: `2024-01-15T10:30:00Z`
   - Supported: `YYYY-MM-DD`, `YYYY-MM-DDTHH:mm:ss`

5. **Combine with Limit**:
   ```
   SORT (desc) → LIMIT (10)  = Top 10
   SORT (asc)  → LIMIT (10)  = Bottom 10
   ```

6. **Null/Undefined Handling**:
   - Items với missing field → Moved to end
   - Null values treated as "less than" any value

## ⚠️ Lưu ý

- **Array Required**: Input phải là array of objects
- **Field Must Exist**: Field phải tồn tại trong items (hoặc items sẽ ở cuối)
- **Type Matters**: Sai data type → Sai order
- **Stable Sort**: Items với same value giữ nguyên relative order
- **No Multi-field Sort**: Chỉ sort by 1 field (cần multi-field → Dùng nhiều SORT nodes)

## 🔧 Development Guide

### Cách Update Node

#### 1. Thay đổi Schema (`schema.ts`)
```typescript
export const sortConfigSchema = z.object({
  items: z.string().min(1), // Token string
  field: z.string().min(1),
  direction: z.enum(["asc", "desc"]).default("asc"),
  dataType: z.enum(["string", "number", "date"]).default("string"),
  nullsPosition: z.enum(["first", "last"]).default("last"), // NEW
});

export type SortConfig = z.infer<typeof sortConfigSchema>;
```

#### 2. Thêm Feature Mới (`SortForm.tsx`)
```typescript
// Add nulls position option
<Select
  label="Null Values Position"
  {...register("nullsPosition")}
>
  <option value="first">First (before all)</option>
  <option value="last">Last (after all)</option>
</Select>

// Enhanced direction toggle
<div className="flex gap-2">
  <button
    type="button"
    onClick={() => setValue("direction", "asc")}
    className={`px-4 py-2 rounded ${
      direction === "asc" 
        ? "bg-blue-500 text-white" 
        : "bg-gray-200"
    }`}
  >
    ↑ Ascending
  </button>
  <button
    type="button"
    onClick={() => setValue("direction", "desc")}
    className={`px-4 py-2 rounded ${
      direction === "desc" 
        ? "bg-blue-500 text-white" 
        : "bg-gray-200"
    }`}
  >
    ↓ Descending
  </button>
</div>
```

#### 3. Update Runtime Logic (`runtime.ts`)
```typescript
import _ from "lodash";

export const sortRuntime: NodeRuntime<SortConfig> = {
  async execute(config, context) {
    const { items, field, direction, dataType, nullsPosition } = config;
    
    // Resolve items
    const resolvedItems = resolveExpression(items, context);
    const inputArray = Array.isArray(resolvedItems) 
      ? resolvedItems 
      : [resolvedItems];
    
    // Sort logic
    const sorted = [...inputArray].sort((a, b) => {
      const valA = _.get(a, field);
      const valB = _.get(b, field);
      
      // Handle nulls
      if (valA == null && valB == null) return 0;
      if (valA == null) return nullsPosition === "first" ? -1 : 1;
      if (valB == null) return nullsPosition === "first" ? 1 : -1;
      
      // Type-specific comparison
      let comparison = 0;
      switch (dataType) {
        case "number":
          comparison = Number(valA) - Number(valB);
          break;
        case "date":
          comparison = new Date(valA).getTime() - new Date(valB).getTime();
          break;
        case "string":
        default:
          comparison = String(valA).localeCompare(String(valB));
      }
      
      return direction === "asc" ? comparison : -comparison;
    });
    
    return {
      success: true,
      data: sorted,
    };
  },
};
```

#### 4. Testing Checklist
- [ ] Test asc direction với all 3 data types
- [ ] Test desc direction với all 3 data types
- [ ] Test với nested field paths (e.g., "profile.age")
- [ ] Test với missing fields (should go to end)
- [ ] Test với null/undefined values
- [ ] Test string sorting is case-insensitive
- [ ] Test number sorting với integers và floats
- [ ] Test date sorting với ISO dates
- [ ] Test token resolution trong field path
- [ ] Test với empty array (should return [])
- [ ] Test với single item (should return unchanged)

## 🐛 Troubleshooting

**Wrong sort order**:
- Check data type selection (string vs number!)
- Verify field exists in all items
- Check direction (asc vs desc)

**Numbers sorted as strings**:
- Problem: "1", "10", "2" → Sorted as ["1", "10", "2"]
- Solution: Change data type to "number"

**Dates not sorting correctly**:
- Ensure date format is ISO 8601
- Change data type to "date"
- Check date strings are valid

**Items missing from output**:
- Check field path is correct
- Verify input is array
- Items với null values may be at end
