# 🎯 Test Drag-Drop: Từ Results DATA Lên Configuration

## ✅ Setup Hoàn Tất

### 🔧 Cải Tiến Đã Làm

1. **Visual Indicators:**
   - ⬆️ Sticky banner "KÉO FIELDS LÊN CONFIGURATION" trong DATA tab
   - 👆 Badge "KÉO LÊN TRÊN" trên mỗi field (hover)
   - 🎯 Instructions box với 4 bước rõ ràng

2. **Z-index Fix:**
   - Fields có `z-index: 9999` khi dragging
   - Inline style để override mọi restrictions
   - CSS class `.dragging-field` để force z-index

3. **Drop Zone Enhancements:**
   - Ring 4px indigo khi hover
   - Label "⬇️ DROP HERE" animation pulse
   - Background xanh nhạt
   - Animation `drop-pulse` custom

4. **Layout Labels:**
   - Configuration header: "(Drop zone - Thả data vào đây)"
   - Results header: "(Drag zone - Kéo data từ đây)"

---

## 🧪 Test Workflow

### Step 1️⃣: Chạy Node HTTP

```bash
# Dev server đang chạy: http://localhost:5173/
```

1. Mở browser → http://localhost:5173/
2. Click node **HTTP** trên canvas (hoặc add từ sidebar)
3. Config:
   - URL: `https://jsonplaceholder.typicode.com/users/1`
   - Method: `GET`
4. Click **RUN** button

### Step 2️⃣: Xem Data

1. Trong **Results Panel** (dưới), chuyển sang tab **🗂️ DATA**
2. Bạn sẽ thấy:
   - Banner sticky màu indigo: "⬆️ KÉO FIELDS LÊN CONFIGURATION"
   - Instructions box với 4 bước
   - Tree data từ HTTP response
3. Expand node `http_xxx` → `body`
4. Bạn thấy các fields: `id`, `name`, `username`, `email`, etc.

### Step 3️⃣: Add Node Thứ 2

1. Click **Formatter** trong Sidebar (dark panel bên trái)
2. Node mới xuất hiện trên canvas
3. Click node Formatter → Config Panel bên phải hiện form

### Step 4️⃣: Kéo Data

**Thao tác:**

1. Trong tab DATA, **hover** vào field `name` (🏷️)
   - Badge "👆 KÉO LÊN TRÊN" xuất hiện
   - Border chuyển indigo
   - Shadow tăng

2. **Click và giữ chuột** trên field `name`
   - Cursor đổi thành ✋ grab
   - Field scale 110%
   - Opacity 70%
   - Z-index 9999

3. **Kéo lên trên** (drag upward)
   - Field follow chuột
   - Di chuyển qua Configuration Panel

4. **Hover vào input field** của Formatter
   - Ring 4px indigo xuất hiện
   - Label "⬇️ DROP HERE" pulse
   - Background xanh nhạt
   - Animation drop-pulse

5. **Thả chuột** (drop)
   - Token inserted: `{{steps.http_xxx.body.name}}`
   - Ring biến mất
   - Input hiển thị token

### Step 5️⃣: Run & Verify

1. Click **RUN** button trên node Formatter
2. Xem Results Panel → tab RESPONSE
3. Output hiển thị: `"Leanne Graham"` ✅
4. Token đã resolve đúng!

---

## 🎨 Visual Cues

### 🏷️ Draggable Field States

**Normal:**
```
┌────────────────────────────────┐
│ 🏷️ name    "Leanne Graham"    │
└────────────────────────────────┘
```

**Hover:**
```
┌────────────────────────────────┐
│ 🏷️ name    "Leanne Graham"  ◄──┤ 👆 KÉO LÊN TRÊN
└────────────────────────────────┘
Border: indigo-400
Shadow: xl
```

**Dragging:**
```
┌────────────────────────────────┐
│ 🏷️ name    "Leanne Graham"    │
└────────────────────────────────┘
Scale: 110%
Opacity: 70%
Z-index: 9999
Border: indigo-500 solid
```

### 🎯 Drop Zone States

**Normal Input:**
```
┌──────────────────────────────┐
│ [text input field]           │
└──────────────────────────────┘
```

**Hover with Drag (isOver):**
```
    ⬇️ DROP HERE (pulse)
┌══════════════════════════════┐
║  [text input field]          ║  ← Ring 4px indigo
╚══════════════════════════════╝
Background: indigo-50
Animation: drop-pulse
```

**After Drop:**
```
┌──────────────────────────────┐
│ {{steps.http_xxx.body.name}} │
└──────────────────────────────┘
```

---

## 🐛 Troubleshooting

### ❌ Problem: Không kéo được field

**Solutions:**
1. ✅ Kiểm tra field là **leaf** (🏷️, không phải 📦)
2. ✅ Cursor phải đổi thành **grab** (✋)
3. ✅ Field phải có `canDrag: true` (isLeaf check)

### ❌ Problem: Kéo được nhưng không thả được

**Solutions:**
1. ✅ Input phải **support token drop** (string/textarea/json)
2. ✅ Phải thấy **ring xanh** + "DROP HERE" label
3. ✅ Check z-index không bị panel khác block
4. ✅ Verify `wrapIfDroppable` có `ref={dropRef}`

### ❌ Problem: Field bị mất khi kéo qua panel

**Solutions:**
1. ✅ Check `z-index: 9999` trong inline style
2. ✅ Verify `position: relative` khi dragging
3. ✅ CSS `.dragging-field` class applied
4. ✅ Không có `overflow: hidden` block drag layer

### ❌ Problem: Token không inserted sau khi drop

**Solutions:**
1. ✅ Check `onToken` callback được gọi
2. ✅ Verify `controllerField.onChange` hoạt động
3. ✅ Token syntax đúng: `{{steps.xxx.path}}`
4. ✅ Console log để debug drop event

---

## 📊 Technical Details

### DnD Configuration

```tsx
// main.tsx
<DndProvider backend={HTML5Backend}>
  <App />
</DndProvider>

// DataFieldsPanel.tsx
const [{ isDragging }, dragRef] = useDrag({
  type: "DATA_FIELD",
  item: { token },
  canDrag: isLeaf,
  collect: (monitor) => ({ isDragging: monitor.isDragging() })
});

// SchemaForm.tsx
const [{ isOver }, dropRef] = useDrop({
  accept: "DATA_FIELD",
  drop: (item) => onToken(item.token),
  collect: (monitor) => ({ isOver: monitor.isOver() })
});
```

### Z-Index Hierarchy

```
Canvas: z-0
Sidebar: z-10
Config Panel: z-20
Results Panel: z-20
Dragging Field: z-9999  ← Highest!
Drop Label: z-50
```

### CSS Animations

```css
@keyframes drop-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); }
  50% { box-shadow: 0 0 0 8px rgba(99, 102, 241, 0); }
}
```

---

## ✅ Checklist

- [x] DndProvider setup in main.tsx
- [x] Draggable fields in DataFieldsPanel
- [x] Drop zones in SchemaForm
- [x] Z-index fixes for cross-panel drag
- [x] Visual indicators (banner, badges, instructions)
- [x] Drop zone animations
- [x] Token insertion logic
- [x] CSS enhancements
- [x] Header labels for guidance
- [x] Hover states with feedback

---

## 🎉 Kết Quả

✅ **Kéo từ Results DATA Panel lên Configuration Panel hoạt động tốt!**

**Demo:** http://localhost:5173/

**Try it now!** 🚀
