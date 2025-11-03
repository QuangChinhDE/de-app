# Filter Node - Quick Reference

## 🎯 Config Format

```json
{
  "conditions": "[{\"field\":\"{{token}}\",\"fieldType\":\"type\",\"operator\":\"op\",\"value\":\"val\"}]",
  "mode": "include|exclude",
  "logic": "AND|OR"
}
```

## 📋 Field Types & Operators

### String
- `is equal to` / `is not equal to`
- `contains` / `does not contain` 
- `starts with` / `does not start with`
- `ends with` / `does not end with`
- `matches regex` / `does not match regex`
- `is empty` / `is not empty`
- `exists` / `does not exist`

### Number
- `is equal to` / `is not equal to`
- `is greater than` / `is less than`
- `is greater than or equal to` / `is less than or equal to`
- `is empty` / `is not empty`
- `exists` / `does not exist`

### Boolean
- `is true` / `is false`
- `is equal to` / `is not equal to`
- `exists` / `does not exist`

### Date & Time
- `is equal to` / `is not equal to`
- `is after` / `is before`
- `is after or equal to` / `is before or equal to`
- `exists` / `does not exist`

### Array
- `contains` / `does not contain`
- `length equal to` / `length not equal to`
- `length greater than` / `length less than`
- `is empty` / `is not empty`
- `exists` / `does not exist`

## 💡 Examples

### String Filter
```json
{
  "field": "{{steps.manual1.status}}",
  "fieldType": "string",
  "operator": "is equal to",
  "value": "active"
}
```

### Number Range (AND)
```json
[
  {"field": "{{steps.http1.price}}", "fieldType": "number", "operator": ">=", "value": "100"},
  {"field": "{{steps.http1.price}}", "fieldType": "number", "operator": "<=", "value": "500"}
]
```
→ Logic: "AND" → Both must be true

### Multiple Values (OR)
```json
[
  {"field": "{{steps.http1.category}}", "fieldType": "string", "operator": "is equal to", "value": "electronics"},
  {"field": "{{steps.http1.category}}", "fieldType": "string", "operator": "is equal to", "value": "books"}
]
```
→ Logic: "OR" → At least one must be true

### Boolean Check
```json
{
  "field": "{{steps.manual1.isActive}}",
  "fieldType": "boolean",
  "operator": "is true",
  "value": ""
}
```

### Array Length
```json
{
  "field": "{{steps.http1.items}}",
  "fieldType": "array",
  "operator": "length greater than",
  "value": "5"
}
```

## 🔧 Mode

- **include**: Keep items matching conditions
- **exclude**: Remove items matching conditions

## 🎲 Logic

- **AND**: All conditions must pass
- **OR**: At least one condition must pass
