# 📊 AGGREGATE Node

Perform aggregation operations on array data (sum, count, average, min, max, groupBy).

## 📋 Chức năng

**Aggregate Node** thực hiện các phép tính tổng hợp trên array data như tính tổng, đếm, trung bình, min, max, hoặc group by.

## 🎨 UI Components (Custom Form)

**Form Component**: `AggregateForm.tsx` (~180 lines)

**Features**:
- ✅ TokenizedInput cho items array
- ✅ Operation selector dropdown (sum/count/avg/min/max/groupBy)
- ✅ Conditional fields based on operation:
  - sum/avg/min/max: Show "field" input
  - groupBy: Show 3 extra fields (groupByField, groupOperation, groupOperationField)
- ✅ Dynamic form rendering based on selection
- ✅ Visual operation indicators

**Dependencies**:
- React Hook Form + Zod validation
- Design system primitives (Input, Select, Button)
- TokenizedInput component

## 🎯 Khi nào sử dụng

- **Calculate Totals**: Tính tổng sales, revenue, quantities
- **Count Items**: Đếm số users, orders, products
- **Calculate Averages**: Trung bình age, score, rating
- **Find Min/Max**: Lowest/highest price, oldest/youngest
- **Group Data**: Group users by city, orders by status

## ⚙️ Cấu hình

### 1. Items
Array cần aggregate.

**Type**: Array of objects (required)
**Input**: Token như `{{steps.xxx}}`
**Example**: `{{steps.http1.body.orders}}`

### 2. Operation
Loại aggregation operation.

**Options**:
- `sum` - Tính tổng một field
- `count` - Đếm số items
- `avg` - Trung bình một field
- `min` - Giá trị nhỏ nhất
- `max` - Giá trị lớn nhất
- `groupBy` - Group items và aggregate theo group

### 3. Field (for sum/avg/min/max)
Field name để aggregate.

**Type**: String (field path)
**Examples**: `price`, `quantity`, `score`, `profile.age`
**Required**: Cho sum/avg/min/max operations
**Not Required**: Cho count operation

### 4. Group By Fields (for groupBy operation)
Chỉ hiện khi operation = "groupBy".

**Group By Field**: Field để group theo (e.g., `city`, `status`, `category`)
**Group Operation**: Operation cho mỗi group (sum/count/avg/min/max)
**Group Operation Field**: Field để apply operation (nếu cần)

## 📖 Ví dụ

### Ví dụ 1: SUM - Tổng Revenue
Input:
```json
[
  {"orderId": 1, "amount": 100, "status": "paid"},
  {"orderId": 2, "amount": 200, "status": "paid"},
  {"orderId": 3, "amount": 150, "status": "paid"}
]
```

**Config**:
```
Operation: sum
Field: amount
```

**Output**:
```json
{
  "operation": "sum",
  "field": "amount",
  "result": 450,
  "count": 3
}
```

---

### Ví dụ 2: COUNT - Đếm Items
Input:
```json
[
  {"id": 1, "name": "Alice"},
  {"id": 2, "name": "Bob"},
  {"id": 3, "name": "Charlie"}
]
```

**Config**:
```
Operation: count
```

**Output**:
```json
{
  "operation": "count",
  "result": 3
}
```

---

### Ví dụ 3: AVG - Trung Bình Age
Input:
```json
[
  {"name": "Alice", "age": 25},
  {"name": "Bob", "age": 30},
  {"name": "Charlie", "age": 35}
]
```

**Config**:
```
Operation: avg
Field: age
```

**Output**:
```json
{
  "operation": "avg",
  "field": "age",
  "result": 30,
  "count": 3
}
```

---

### Ví dụ 4: MIN/MAX - Lowest/Highest Price
Input:
```json
[
  {"product": "A", "price": 100},
  {"product": "B", "price": 50},
  {"product": "C", "price": 200}
]
```

**Config (MIN)**:
```
Operation: min
Field: price
```

**Output**:
```json
{
  "operation": "min",
  "field": "price",
  "result": 50,
  "item": {"product": "B", "price": 50}
}
```

**Config (MAX)**:
```
Operation: max
Field: price
```

**Output**:
```json
{
  "operation": "max",
  "field": "price",
  "result": 200,
  "item": {"product": "C", "price": 200}
}
```

---

### Ví dụ 5: GROUP BY - Sales by City
Input:
```json
[
  {"city": "NYC", "amount": 100},
  {"city": "LA", "amount": 200},
  {"city": "NYC", "amount": 150},
  {"city": "LA", "amount": 300},
  {"city": "NYC", "amount": 50}
]
```

**Config**:
```
Operation: groupBy
Group By Field: city
Group Operation: sum
Group Operation Field: amount
```

**Output**:
```json
{
  "operation": "groupBy",
  "groupByField": "city",
  "groupOperation": "sum",
  "result": [
    {"city": "NYC", "sum": 300, "count": 3},
    {"city": "LA", "sum": 500, "count": 2}
  ]
}
```

---

### Ví dụ 6: GROUP BY - Average Age by Department
Input:
```json
[
  {"name": "Alice", "dept": "Engineering", "age": 25},
  {"name": "Bob", "dept": "Sales", "age": 30},
  {"name": "Charlie", "dept": "Engineering", "age": 35},
  {"name": "David", "dept": "Sales", "age": 28}
]
```

**Config**:
```
Operation: groupBy
Group By Field: dept
Group Operation: avg
Group Operation Field: age
```

**Output**:
```json
{
  "operation": "groupBy",
  "groupByField": "dept",
  "groupOperation": "avg",
  "result": [
    {"dept": "Engineering", "avg": 30, "count": 2},
    {"dept": "Sales", "avg": 29, "count": 2}
  ]
}
```

---

### Ví dụ 7: GROUP BY - Count Users by Status
Input:
```json
[
  {"name": "Alice", "status": "active"},
  {"name": "Bob", "status": "inactive"},
  {"name": "Charlie", "status": "active"},
  {"name": "David", "status": "active"}
]
```

**Config**:
```
Operation: groupBy
Group By Field: status
Group Operation: count
```

**Output**:
```json
{
  "operation": "groupBy",
  "groupByField": "status",
  "groupOperation": "count",
  "result": [
    {"status": "active", "count": 3},
    {"status": "inactive", "count": 1}
  ]
}
```

## 💡 Tips & Best Practices

1. **Field Must Exist**:
   - Ensure field exists trong tất cả items
   - Missing fields treated as 0 (for numbers) or skipped

2. **Number Fields**:
   - sum/avg/min/max require numeric fields
   - String numbers will be converted: "100" → 100

3. **Count vs Sum**:
   - Count: Số lượng items (không cần field)
   - Sum: Tổng giá trị của field

4. **GroupBy for Reporting**:
   - Perfect for creating reports, dashboards
   - Combine with SORT để order groups

5. **Null Handling**:
   - Null/undefined values skipped trong calculations
   - Count only counts non-null items

6. **Combine Operations**:
   ```
   FILTER (active users) → AGGREGATE (avg age) → Result
   ```

## ⚠️ Lưu ý

- **Array Required**: Input phải là array
- **Numeric Fields**: sum/avg/min/max require numbers
- **Empty Array**: Returns appropriate default:
  - count: 0
  - sum: 0
  - avg: 0 (or null)
  - min/max: null
  - groupBy: []

- **GroupBy Memory**: Large datasets với nhiều groups có thể slow

## 🔧 Development Guide

### Cách Update Node

#### 1. Thay đổi Schema (`schema.ts`)
```typescript
export const aggregateConfigSchema = z.object({
  items: z.string().min(1), // Token string
  operation: z.enum(["sum", "count", "avg", "min", "max", "groupBy"]),
  field: z.string().optional(), // For sum/avg/min/max
  // GroupBy fields
  groupByField: z.string().optional(),
  groupOperation: z.enum(["sum", "count", "avg", "min", "max"]).optional(),
  groupOperationField: z.string().optional(),
  // NEW: Additional options
  includePercentages: z.boolean().default(false), // For groupBy
  sortGroups: z.enum(["asc", "desc", "none"]).default("none"),
});

export type AggregateConfig = z.infer<typeof aggregateConfigSchema>;
```

#### 2. Thêm Feature Mới (`AggregateForm.tsx`)
```typescript
// Add percentage option for groupBy
{watch("operation") === "groupBy" && (
  <Checkbox
    label="Include Percentages"
    {...register("includePercentages")}
  />
)}

// Add sort option for groupBy results
{watch("operation") === "groupBy" && (
  <Select
    label="Sort Groups"
    {...register("sortGroups")}
  >
    <option value="none">No Sort</option>
    <option value="asc">Ascending</option>
    <option value="desc">Descending</option>
  </Select>
)}
```

#### 3. Update Runtime Logic (`runtime.ts`)
```typescript
import _ from "lodash";

export const aggregateRuntime: NodeRuntime<AggregateConfig> = {
  async execute(config, context) {
    const { items, operation, field, groupByField, groupOperation, groupOperationField } = config;
    
    // Resolve items
    const resolvedItems = resolveExpression(items, context);
    const inputArray = Array.isArray(resolvedItems) 
      ? resolvedItems 
      : [resolvedItems];
    
    // Basic operations
    if (operation === "count") {
      return {
        success: true,
        data: {
          operation: "count",
          result: inputArray.length,
        },
      };
    }
    
    if (["sum", "avg", "min", "max"].includes(operation)) {
      const values = inputArray
        .map(item => _.get(item, field))
        .filter(val => val != null)
        .map(Number);
      
      let result;
      switch (operation) {
        case "sum":
          result = values.reduce((sum, val) => sum + val, 0);
          break;
        case "avg":
          result = values.length > 0 
            ? values.reduce((sum, val) => sum + val, 0) / values.length 
            : 0;
          break;
        case "min":
          result = values.length > 0 ? Math.min(...values) : null;
          break;
        case "max":
          result = values.length > 0 ? Math.max(...values) : null;
          break;
      }
      
      return {
        success: true,
        data: {
          operation,
          field,
          result,
          count: values.length,
        },
      };
    }
    
    // GroupBy operation
    if (operation === "groupBy") {
      const grouped = _.groupBy(inputArray, groupByField);
      
      const result = Object.entries(grouped).map(([key, items]) => {
        let aggResult;
        
        if (groupOperation === "count") {
          aggResult = items.length;
        } else {
          const values = items
            .map(item => _.get(item, groupOperationField))
            .filter(val => val != null)
            .map(Number);
          
          switch (groupOperation) {
            case "sum":
              aggResult = values.reduce((sum, val) => sum + val, 0);
              break;
            case "avg":
              aggResult = values.length > 0
                ? values.reduce((sum, val) => sum + val, 0) / values.length
                : 0;
              break;
            case "min":
              aggResult = values.length > 0 ? Math.min(...values) : null;
              break;
            case "max":
              aggResult = values.length > 0 ? Math.max(...values) : null;
              break;
          }
        }
        
        return {
          [groupByField]: key,
          [groupOperation]: aggResult,
          count: items.length,
        };
      });
      
      return {
        success: true,
        data: {
          operation: "groupBy",
          groupByField,
          groupOperation,
          result,
        },
      };
    }
    
    return { success: false, error: "Invalid operation" };
  },
};
```

#### 4. Testing Checklist
- [ ] Test COUNT operation
- [ ] Test SUM với positive/negative numbers
- [ ] Test AVG calculation accuracy
- [ ] Test MIN/MAX với various values
- [ ] Test groupBy với all group operations
- [ ] Test với empty array (should return defaults)
- [ ] Test với missing fields (should skip)
- [ ] Test với null/undefined values
- [ ] Test nested field paths (e.g., "profile.age")
- [ ] Test token resolution trong items field
- [ ] Test conditional field rendering trong form
- [ ] Verify groupBy result structure

## 🐛 Troubleshooting

**Result is 0 but expected value**:
- Check field name is correct (case-sensitive)
- Verify field contains numbers (not strings)
- Check for null/undefined values

**GroupBy returns empty array**:
- Check groupByField exists trong items
- Verify items is an array
- Check groupByField có values

**AVG calculation wrong**:
- Verify all values are numbers
- Check for null values (skipped trong calculation)
- Confirm field path is correct

**MIN/MAX returns null**:
- Check array is not empty
- Verify field exists và contains values
- Ensure values are numbers
