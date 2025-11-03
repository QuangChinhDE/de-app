# ⏱️ WAIT Node

Pause workflow execution for a specified duration.

## 📋 Chức năng

**Wait Node** tạm dừng workflow trong một khoảng thời gian nhất định trước khi tiếp tục đến node tiếp theo. Node này hữu ích cho:
- Rate limiting khi gọi API
- Delay giữa các batch processing
- Chờ external service xử lý
- Tạo delay cho testing

## 🎨 UI Components (Custom Form)

**Form Component**: `WaitForm.tsx` (~140 lines)

**Features**:
- ✅ Duration number input
- ✅ Unit selector dropdown: ms / seconds / minutes / hours
- ✅ Time preview calculation (e.g., "5.0m" for 5 minutes)
- ✅ Visual time indicator
- ✅ TokenizedInput integration cho duration

**Dependencies**:
- React Hook Form + Zod validation
- Design system primitives (Input, Select, Button)
- TokenizedInput component (optional for dynamic duration)

## 🎯 Khi nào sử dụng

- **Rate Limiting**: Delay giữa API calls để tránh hit rate limit
- **Polling**: Chờ giữa các lần check status
- **Batch Processing**: Pause giữa các batch trong LOOP
- **Testing**: Simulate slow operations

## ⚙️ Cấu hình

### 1. Duration
Số lượng time units để chờ.

**Type**: Number (positive integer)
**Example**: 5, 10, 30

### 2. Unit
Đơn vị thời gian.

**Options**:
- `ms` - Milliseconds (1/1000 second)
- `seconds` - Seconds
- `minutes` - Minutes (60 seconds)
- `hours` - Hours (3600 seconds)

**Preview**: Form tự động tính và hiển thị tổng thời gian (e.g., "Duration: 5.0m")

## 📖 Ví dụ

### Ví dụ 1: Rate Limiting API Calls
```
HTTP (get users) → LOOP → HTTP (process each) → WAIT (1 second) → Continue
```

**Config**:
```
Duration: 1
Unit: seconds
```

**Result**: Pause 1 second giữa mỗi API call

---

### Ví dụ 2: Batch Processing với Delay
```
Manual (100 items) → LOOP (batch=10) → Process → WAIT (2 seconds)
```

**Config**:
```
Duration: 2
Unit: seconds
```

**Result**: Pause 2 seconds giữa mỗi batch (10 items)

---

### Ví dụ 3: Polling với Retry
```
HTTP (submit job) → WAIT (5 minutes) → HTTP (check status) → IF (complete)
```

**Config**:
```
Duration: 5
Unit: minutes
```

**Result**: Wait 5 minutes trước khi check job status

---

### Ví dụ 4: Short Delay (Milliseconds)
```
SPLIT → LOOP → Transform → WAIT (100 ms) → HTTP
```

**Config**:
```
Duration: 100
Unit: ms
```

**Result**: Pause 100ms giữa mỗi item

## 💡 Tips & Best Practices

1. **Unit Selection**:
   - `ms`: Cho very short delays (< 1 second)
   - `seconds`: Cho short to medium delays (1-60 seconds)
   - `minutes`: Cho longer delays (1-60 minutes)
   - `hours`: Cho very long delays (rare use case)

2. **Rate Limiting**:
   - Check API docs cho rate limit (e.g., "100 requests/minute")
   - Calculate wait time: 60 seconds / 100 = 0.6 seconds per request
   - Add buffer: Use 1 second to be safe

3. **Batch Processing**:
   - Use with LOOP node's batch size
   - Example: Process 10 items, wait 1 second, repeat

4. **Token Support**:
   - Duration có thể dùng token: `{{steps.manual1.delay}}`
   - Unit phải là static (không support token)

## ⚠️ Lưu ý

- **Blocking Operation**: Workflow sẽ PAUSE hoàn toàn trong thời gian wait
- **Max Duration**: Không nên wait quá lâu (> 1 hour) - có thể timeout
- **Non-skippable**: Không thể skip wait time sau khi started
- **Pass-through**: Output = Input (data không thay đổi)

## 🔧 Development Guide

### Cách Update Node

#### 1. Thay đổi Schema (`schema.ts`)
```typescript
export const waitConfigSchema = z.object({
  duration: z.number().positive(),
  unit: z.enum(["ms", "seconds", "minutes", "hours"]),
});

export type WaitConfig = z.infer<typeof waitConfigSchema>;
```

#### 2. Thêm Unit Mới (`WaitForm.tsx`)
```typescript
// Add new unit option
<Select label="Unit" {...register("unit")}>
  <option value="ms">Milliseconds</option>
  <option value="seconds">Seconds</option>
  <option value="minutes">Minutes</option>
  <option value="hours">Hours</option>
  <option value="days">Days</option> {/* NEW */}
</Select>

// Update preview calculation
const calculateDuration = (duration: number, unit: string) => {
  switch (unit) {
    case "ms": return `${duration}ms`;
    case "seconds": return `${duration}s`;
    case "minutes": return `${duration / 60}m`;
    case "hours": return `${duration / 3600}h`;
    case "days": return `${duration / 86400}d`; // NEW
    default: return `${duration}`;
  }
};
```

#### 3. Update Runtime Logic (`runtime.ts`)
```typescript
export const waitRuntime: NodeRuntime<WaitConfig> = {
  async execute(config, context) {
    const { duration, unit } = config;
    
    // Convert to milliseconds
    const multipliers = {
      ms: 1,
      seconds: 1000,
      minutes: 60000,
      hours: 3600000,
      days: 86400000, // NEW
    };
    
    const delayMs = duration * multipliers[unit];
    
    // Actual wait/sleep
    await new Promise(resolve => setTimeout(resolve, delayMs));
    
    // Pass through input data
    return {
      success: true,
      data: context.previousOutput,
    };
  },
};
```

#### 4. Testing Checklist
- [ ] Test với all 4 units (ms/seconds/minutes/hours)
- [ ] Test time preview calculation accuracy
- [ ] Test với duration = 0 (should skip wait)
- [ ] Test với very small duration (1ms)
- [ ] Test với large duration (verify timeout behavior)
- [ ] Test token resolution trong duration field
- [ ] Verify pass-through behavior (output = input)
- [ ] Test inside LOOP với pauseBetweenBatches

## 🐛 Troubleshooting

**Wait time không chính xác**:
- Check unit selection (ms vs seconds)
- Verify duration value (positive number)
- Browser performance may add small overhead

**Timeout errors**:
- Reduce wait duration (< 5 minutes recommended)
- Split long waits into multiple shorter waits

**Data loss**:
- Wait node should always pass through input data
- Check runtime logic preserves `context.previousOutput`
