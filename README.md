# ⚡ Node Playground

> **Visual Workflow Builder** - Low-code platform để xây dựng data pipelines phức tạp với giao diện drag-and-drop trực quan

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.10-purple?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.13-blue?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

<div align="center">
  <img src="./docs/screenshot.png" alt="Node Playground Screenshot" width="800">
  <p><em>Visual workflow builder với real-time execution và smart data flow</em></p>
</div>

---

## 🎯 Tổng Quan

**Node Playground** là một **low-code visual workflow platform** cho phép bạn xây dựng data transformation pipelines phức tạp mà không cần viết code. Hệ thống được thiết kế dựa trên kiến trúc pluggable executor pattern với clean separation of concerns, giúp dễ dàng maintain và mở rộng.

### 💡 Giải Quyết Vấn Đề Gì?

- ❌ **Before**: Viết scripts thủ công để transform data, API integration → khó maintain, khó test
- ✅ **After**: Visual workflow với 14+ pre-built nodes → drag-drop, configure, run
- ❌ **Before**: Testing data pipelines đòi hỏi deploy và run production code
- ✅ **After**: Real-time testing trong UI với sample data và instant feedback
- ❌ **Before**: Complex branching logic (IF/SWITCH) khó visualize và debug
- ✅ **After**: Visual branches với per-branch output tracking và token access

### ✨ Tính Năng Nổi Bật

#### 🎨 **Visual Workflow Builder**
- Drag-and-drop interface với ReactFlow
- Auto-layout algorithm cho clean canvas
- Visual node connections với colored handles
- Real-time status indicators (idle/running/success/error)

#### 🔗 **Smart Auto-Connection**
- Tự động kết nối nodes theo thứ tự thêm vào
- Intelligent data flow với `__previousOutput`
- Multi-input support cho MERGE node (2-5 inputs)
- Click-to-delete edges

#### 📦 **Advanced Data Flow**
- **Token Resolution**: `{{steps.nodeKey.fieldPath}}` syntax
- **Auto-unwrap Arrays**: Smart per-item processing
- **Branch-specific Access**: `{{steps.if1-TRUE.field}}`
- **Loop Context**: `{{$item}}`, `{{$index}}`, `{{$total}}`

#### 🎛️ **14+ Pre-built Nodes**
- **Triggers**: Manual (JSON/Form modes)
- **Actions**: HTTP (REST API với 4 body modes)
- **Logic**: IF, SWITCH (conditional branching)
- **Utilities**: SET, SPLIT, MERGE, FILTER, LOOP
- **Transform**: SORT, LIMIT, WAIT, CODE, AGGREGATE

#### 🏷️ **Drag-and-Drop Field Mapping**
- Run node để see output → Click **📦 ▼** button
- Drag fields vào config inputs → Auto-generate tokens
- Visual drop zones với hover feedback
- Type-aware field suggestions

#### ⚡ **Real-time Execution & Preview**
- Run individual nodes hoặc entire flow
- Live output preview trong ResultPanel
- Tabs: Request/Response/Logs/Data/Execution Timeline
- Per-item execution data với lineage tracking

---

## 📚 Documentation

- 📖 **[README.md](./README.md)** - Tổng quan sản phẩm và hướng dẫn sử dụng
- 🛠️ **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Hướng dẫn development chi tiết cho developers
- 📦 **[OUTPUT_FORMAT_STANDARD.md](./apps/web/src/nodes/OUTPUT_FORMAT_STANDARD.md)** - Node output format standard
- 📝 **[Node READMEs](./apps/web/src/nodes/)** - Chi tiết từng node type

---

## 🏗️ Kiến Trúc Hệ Thống

### � Core Architecture

Node Playground được xây dựng trên **Execution Layer Architecture** với 3 core components:

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer (React)                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │ FlowCanvas │  │ConfigPanel │  │ResultPanel │        │
│  └────────────┘  └────────────┘  └────────────┘        │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              State Management (Zustand)                  │
│                   flow-store.ts                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ runStep() → Build ExecutionContext              │   │
│  │           → Call executeWithRegistry()          │   │
│  │           → Post-process & Store Results        │   │
│  └─────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│           Execution Layer (Pluggable Executors)          │
│  ┌─────────────────┐  ┌──────────────┐  ┌─────────┐   │
│  │SingleOutputExec │  │BranchExecutor│  │LoopExec │   │
│  │ (manual, http,  │  │  (if, switch)│  │ (loop)  │   │
│  │  set, split...) │  └──────────────┘  └─────────┘   │
│  └─────────────────┘                                    │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              Node Runtime Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  manual  │  │   http   │  │    if    │   ... (14+) │
│  │ /runtime │  │ /runtime │  │ /runtime │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

**Lợi ích của architecture này**:
- ✅ **Separation of Concerns**: Mỗi layer có responsibility rõ ràng
- ✅ **Testability**: Test executors độc lập với store và UI
- ✅ **Extensibility**: Thêm node type mới = thêm executor mới
- ✅ **Maintainability**: Bug ở layer nào fix ở đó, không ảnh hưởng layer khác

### 🎨 3-Layer Form Architecture

Frontend sử dụng **3-layer form architecture** để đảm bảo consistency và reusability:

```
Layer 1: Design System Primitives
  ├── Input.tsx           - Text input với error states
  ├── Select.tsx          - Dropdown selector  
  ├── Textarea.tsx        - Multiline text input
  ├── Checkbox.tsx        - Boolean checkbox
  └── Button.tsx          - Action buttons

Layer 2: Form System Components (Shared)
  ├── TokenizedInput.tsx           - Token parsing & chip display
  ├── KeyValueEditor.tsx           - Key-value pairs với type support
  ├── FilterConditionsEditor.tsx   - Complex condition builder
  └── CasesEditor.tsx              - Multi-case editor với drag-drop

Layer 3: Node-Specific Custom Forms (14 nodes)
  ├── manual/ManualForm.tsx        - JSON/Form input modes
  ├── http/HttpForm.tsx            - Full HTTP với 4 body modes
  ├── set/SetForm.tsx              - KeyValueEditor integration
  ├── if/IfForm.tsx                - FilterConditions với AND/OR
  ├── filter/FilterForm.tsx        - Array filtering với modes
  ├── switch/SwitchForm.tsx        - CasesEditor integration
  ├── wait/WaitForm.tsx            - Duration với time preview
  ├── limit/LimitForm.tsx          - Pagination với range preview
  ├── sort/SortForm.tsx            - Array sorting với toggles
  ├── code/CodeForm.tsx            - JavaScript editor với tips
  ├── aggregate/AggregateForm.tsx  - Conditional fields by operation
  ├── merge/MergeForm.tsx          - 3 modes với conditional options
  ├── split/SplitForm.tsx          - Auto/field modes với info
  └── loop/LoopForm.tsx            - Batch processing với tips
```

**Nguyên tắc thiết kế:**
- ✅ **Mỗi node PHẢI có custom form riêng** - không dùng generic/fallback
- ✅ **Tái sử dụng components** từ Layer 1 & 2 cho consistency
- ✅ **React Hook Form + Zod** cho validation trong tất cả forms
- ✅ **TokenizedInput integration** cho mọi field hỗ trợ expressions
- ✅ **Type-safe** với `NodeFormProps<TConfig>` interface

### 📁 Cấu Trúc Thư Mục

```
node-playground/
├── apps/
│   ├── web/                    # React Frontend (Vite + TypeScript)
│   │   ├── src/
│   │   │   ├── components/     # React Components
│   │   │   │   ├── FlowCanvas.tsx       # ReactFlow canvas chính
│   │   │   │   ├── WorkflowNode.tsx     # Custom node component
│   │   │   │   ├── ConfigPanel.tsx      # Panel cấu hình node (dynamic form loader)
│   │   │   │   ├── ResultPanel.tsx      # Panel hiển thị kết quả
│   │   │   │   ├── DataFieldsPanel.tsx  # Panel drag-drop fields
│   │   │   │   └── form-system/         # 🆕 Shared Form Components (Layer 2)
│   │   │   │       ├── TokenizedInput.tsx
│   │   │   │       ├── KeyValueEditor.tsx
│   │   │   │       ├── FilterConditionsEditor.tsx
│   │   │   │       └── CasesEditor.tsx
│   │   │   ├── design-system/  # 🆕 Design System (Layer 1)
│   │   │   │   └── primitives/
│   │   │   │       ├── Input.tsx
│   │   │   │       ├── Select.tsx
│   │   │   │       ├── Textarea.tsx
│   │   │   │       ├── Checkbox.tsx
│   │   │   │       ├── Button.tsx
│   │   │   │       └── index.ts
│   │   │   ├── nodes/          # Node definitions & runtimes (Layer 3)
│   │   │   │   ├── index.ts    # Central node registry
│   │   │   │   ├── types.ts    # Shared node types
│   │   │   │   ├── utils.ts    # Runtime utilities
│   │   │   │   ├── manual/     # Manual trigger node
│   │   │   │   │   ├── ManualForm.tsx    # 🆕 Custom form
│   │   │   │   │   ├── schema.ts
│   │   │   │   │   ├── runtime.ts
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── README.md         # 🆕 Node documentation
│   │   │   │   ├── http/       # HTTP request node  
│   │   │   │   │   ├── HttpForm.tsx      # 🆕 Custom form
│   │   │   │   │   ├── schema.ts
│   │   │   │   │   ├── runtime.ts
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── README.md
│   │   │   │   ├── filter/     # Array filtering node
│   │   │   │   ├── if/         # Conditional branching
│   │   │   │   ├── switch/     # Multi-case routing
│   │   │   │   ├── merge/      # Multiple input merger ⭐
│   │   │   │   ├── set/        # Data manipulation
│   │   │   │   ├── split/      # Array splitting
│   │   │   │   ├── sort/       # Array sorting
│   │   │   │   ├── limit/      # Array pagination
│   │   │   │   ├── loop/       # Batch processing
│   │   │   │   ├── wait/       # Delay execution
│   │   │   │   ├── code/       # JavaScript execution
│   │   │   │   └── aggregate/  # Array aggregation
│   │   │   ├── state/          # Zustand store
│   │   │   └── utils/          # Utility functions
│   │   └── package.json
│   └── server/                 # Node.js Backend (Express + TypeScript)
├── packages/
│   └── types/                  # Shared TypeScript definitions
│       └── src/
│           └── index.ts        # Includes NodeFormProps<TConfig>
└── package.json               # Workspace configuration
```

### 🔧 Tech Stack

#### Frontend (apps/web)
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.3.1 | UI framework với hooks và functional components |
| **TypeScript** | 5.4.0 | Type safety và superior DX |
| **Vite** | 5.4.10 | Lightning-fast build tool với HMR |
| **TailwindCSS** | 3.4.13 | Utility-first CSS framework |
| **ReactFlow** | @xyflow/react | Visual node-based flow builder |
| **Zustand** | 4.5.4 | Lightweight state management |
| **React Hook Form** | 7.53.0 | Performant form library với validation |
| **Zod** | 3.23.8 | TypeScript-first schema validation |
| **React DnD** | 16.0.1 | Drag-and-drop functionality |

#### Backend (apps/server)
| Technology | Purpose |
|-----------|---------|
| **Node.js** | Runtime environment |
| **Express** | Web framework |
| **TypeScript** | Type-safe backend |

#### Development Tools
| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting and quality enforcement |
| **Prettier** | Code formatting |
| **npm workspaces** | Monorepo management |
| **Concurrently** | Run multiple dev servers in parallel |

#### Key Libraries & Utilities
- **lodash** - Utility functions cho data transformation
- **dayjs** - Date/time manipulation
- **axios** - HTTP client cho node runtimes

## 🚀 Cài Đặt & Chạy

### Yêu Cầu Hệ Thống
- **Node.js** >= 18.0.0
- **npm** >= 8.0.0

### 1️⃣ Clone Repository
```bash
git clone https://github.com/QuangChinhDE/de-app.git
cd de-app
```

### 2️⃣ Cài Đặt Dependencies
```bash
# Cài đặt tất cả dependencies cho workspace
npm install
```

### 3️⃣ Chạy Development Server
```bash
# Chạy cả frontend và backend
npm run dev

# Hoặc chạy riêng lẻ:
npm run dev:web      # Chỉ frontend (port 5173)
npm run dev:server   # Chỉ backend (port 3000)
```

### 4️⃣ Build Production
```bash
npm run build
```

### 🌐 Truy Cập Ứng Dụng
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

---

## 🎮 Hướng Dẫn Sử Dụng

### 🏃‍♂️ Quick Start Guide

#### 1️⃣ **Add Nodes to Canvas**
1. Click node từ **Sidebar** (hoặc drag vào canvas)
2. Node được tự động add vào canvas với auto-layout
3. Các nodes được auto-connect theo thứ tự thêm vào
4. Visual indicators: 🟡 Idle → 🔵 Running → 🟢 Success / 🔴 Error

#### 2️⃣ **Configure Nodes**
1. Click chọn node để open **Config Panel** (right sidebar)
2. Điền config fields:
   - **Simple values**: Nhập text/number trực tiếp
   - **Tokens**: Use `{{steps.nodeKey.field}}` syntax
   - **Drag-drop**: Kéo fields từ Data Panel vào inputs
3. Click **💡 Fuzz** button để generate test data (available cho một số nodes)
4. Form validation real-time với error messages

#### 3️⃣ **Run & View Results**
1. **Run single node**: Click **▶ RUN** button trên node hoặc trong config panel
2. **Run entire flow**: Click **▶ Run Flow** button (toolbar)
3. **View results** trong **Result Panel** (bottom):
   - **📄 Output**: Formatted JSON output
   - **📊 Data**: Structured data tree view
   - **📋 Logs**: Execution logs và debugging info
   - **⏱️ Timeline**: Execution timeline với duration
4. **Access fields**: Click **📦 ▼** button để show draggable fields

### 🎓 Common Workflows

#### Workflow 1: Fetch & Transform API Data

```
MANUAL → HTTP → SET → FILTER
  ↓       ↓      ↓       ↓
 [id:1]  GET    Add     Keep
         /api  field   active
         
Result: Transformed & filtered API data
```

**Steps**:
1. **MANUAL**: Provide initial data hoặc empty trigger
2. **HTTP**: GET request to API endpoint
3. **SET**: Add computed fields (e.g., `fullName` = `firstName + lastName`)
4. **FILTER**: Keep only active users (`status === 'active'`)

#### Workflow 2: Conditional Branching

```
MANUAL → IF → SET (TRUE branch)
         ↓ 
         └→ SET (FALSE branch)
         
Result: Different transformations based on condition
```

**Steps**:
1. **MANUAL**: Sample data với mixed conditions
2. **IF**: Condition: `age > 18`
3. **SET (TRUE)**: Add field `category = 'adult'`
4. **SET (FALSE)**: Add field `category = 'minor'`

#### Workflow 3: Multi-Case Routing

```
MANUAL → SWITCH → SET (case 0)
                ↓
                ├→ SET (case 1)
                └→ SET (default)
                
Result: Route data theo category/status
```

**Steps**:
1. **MANUAL**: Data với field `category`
2. **SWITCH**: Switch on field `category`
   - Case 0: `category === 'A'`
   - Case 1: `category === 'B'`
   - Default: All others
3. **SET nodes**: Different transformations per case

#### Workflow 4: Merge Multiple Sources

```
HTTP (API 1) ──┐
               ├→ MERGE → SET → FILTER
HTTP (API 2) ──┘
               
Result: Combined data from multiple APIs
```

**Steps**:
1. **HTTP (API 1)**: Fetch users from API 1
2. **HTTP (API 2)**: Fetch orders from API 2
3. **MERGE**: JOIN mode với key `userId`
4. **SET**: Add computed fields
5. **FILTER**: Keep valid records

#### Workflow 5: Batch Processing

```
MANUAL → LOOP → SET (executed per-item)
         ↓
       Items processed in batches
       
Result: Per-item transformation với batch control
```

**Steps**:
1. **MANUAL**: Array of items
2. **LOOP**: Config batch size = 10, pause = 100ms
3. **SET**: Transform using `{{$item.field}}` tokens
4. Result: All items processed với rate limiting

### 🎯 Các Loại Node Chính (14 Nodes)

| Node Type | Mô Tả | Config Options | Use Case |
|-----------|-------|----------------|----------|
| **Manual** | Trigger thủ công với test data | JSON/Form modes, fields editor | Khởi tạo workflow với data mẫu |
| **HTTP** | Gọi REST API | Method, URL, headers, query, 4 body modes | Lấy data từ external services |
| **Set** | Manipulate data fields | Key-value-type pairs, includeOtherFields | Transform, rename, calculate fields |
| **Filter** | Lọc array với nhiều điều kiện | Conditions (AND/OR), include/exclude mode | Lọc users active, age > 18, city = "HN" |
| **IF** | Điều kiện TRUE/FALSE | Conditions (AND/OR logic) | Branch logic đơn giản |
| **Switch** | Multi-case routing | Single/Filter modes, cases, defaultCase | Route theo category, status, v.v. |
| **Merge** ⭐ | Kết hợp multiple inputs (2-5) | Append/Merge/Join modes, join keys | JOIN data, APPEND arrays, MERGE objects |
| **Split** | Tách array thành items | Auto/Field modes, fieldPath | Xử lý từng item trong array |
| **Sort** | Sắp xếp array | Field, direction, dataType | Sort theo field, asc/desc |
| **Limit** | Giới hạn số lượng items | Skip, limit với range preview | Pagination, top N items |
| **Loop** | Iterate với batch processing | BatchSize, pauseBetweenBatches | Xử lý từng batch với rate limiting |
| **Wait** | Pause execution | Duration, unit (ms/s/m/h) | Delay giữa các API calls |
| **Code** | Execute JavaScript | Code editor, inputData | Custom logic với JavaScript |
| **Aggregate** | Array aggregation | Sum/Avg/Count/Min/Max/GroupBy | Tính tổng, trung bình, group data |

**📖 Chi tiết mỗi node**: Xem `README.md` trong thư mục node tương ứng (`apps/web/src/nodes/<node-type>/README.md`)

### 🏷️ Smart Features

#### **🔗 Auto Connection**
- Tự động tạo edges giữa các node theo thứ tự thêm vào
- Không cần kéo thả connection thủ công
- Hỗ trợ delete edge bằng click vào nút ✕ trên edge

#### **📦 Data Flow & Token Resolution**
- Tự động truyền output của node trước vào node sau qua `__previousOutput`
- Smart unwrapping cho IF/SWITCH node outputs
- Token format: `{{steps.nodeKey.fieldPath}}`
- Auto-unwrap arrays: `{{steps.http1.users.name}}` thay vì `{{steps.http1.users[0].name}}`

#### **🎨 Drag & Drop Fields**
- Chạy node để có output → Click **📦 ▼** button
- Popup hiển thị tất cả fields có thể kéo
- Kéo field vào input để tự động tạo token
- Visual feedback với drop zones

#### **⭐ MERGE Node - Multiple Inputs**
- Hỗ trợ 2-5 inputs cùng lúc với handles màu sắc khác nhau
- 3 modes: **JOIN** (SQL-like), **APPEND** (concat arrays), **MERGE** (merge objects)
- JOIN types: INNER, LEFT, RIGHT, FULL OUTER
- Conflict resolution strategies cho MERGE mode

## 🧪 Testing & Development

### 🔍 Workflow Testing Example
```yaml
Test Scenario: E-commerce Order Processing
├── Manual Trigger: 5 orders với status khác nhau
├── HTTP Node: Sync orders lên API  
├── Filter Node: Lọc orders hợp lệ (status != "cancelled")
├── IF Node: Phân chia high-value orders (amount > $1000)  
├── Set Node: Add priority flags
└── Results: Categorized orders với metadata
```

### 🐛 Debugging Features
- **Logs tab**: Chi tiết execution logs mỗi node
- **Data tab**: Preview input/output data structure
- **Visual indicators**: Node status (idle/running/success/error)
- **Error handling**: Clear error messages với context

## 🔮 Roadmap & Future Plans

### 🎯 Phase 1 ✅ (Completed)
- [x] Visual workflow builder với ReactFlow
- [x] Basic node types (Manual, HTTP, Filter, IF, Switch)
- [x] Auto connection & data flow
- [x] Drag-and-drop field mapping
- [x] MERGE node với multiple inputs

### 🎯 Phase 2 🚧 (In Progress)
- [ ] Advanced loop constructs với batch processing
- [ ] Custom node creation interface  
- [ ] Workflow templates & sharing
- [ ] Performance optimization cho large workflows

### 🎯 Phase 3 🔄 (Planning)
- [ ] Real-time collaboration
- [ ] Version control cho workflows
- [ ] Plugin system cho custom nodes
- [ ] Cloud deployment & scaling

## 🤝 Contributing

### 🐛 Bug Reports
Nếu bạn gặp bug, vui lòng tạo issue với:
- Mô tả chi tiết steps để reproduce
- Screenshots hoặc GIFs nếu có thể
- Environment info (OS, Node version, Browser)

### 💡 Feature Requests  
- Mô tả rõ ràng tính năng mong muốn
- Explain use case và lợi ích
- Mockups hoặc wireframes nếu có

### 🔧 Development Setup
```bash
# Fork repository
# Clone your fork
git clone https://github.com/your-username/de-app.git

# Create feature branch
git checkout -b feature/amazing-feature

# Make changes và test
npm run dev
npm run build

# Commit với clear message
git commit -m "Add amazing feature"

# Push và create PR
git push origin feature/amazing-feature
```

## 📊 Technical Highlights

### 🏗️ Architecture Decisions
- **Monorepo structure** với npm workspaces cho scalability
- **3-layer form architecture** - Design System → Form Components → Node Forms
- **Component-based architecture** với clear separation of concerns  
- **Type-safe** development với TypeScript trong toàn bộ stack
- **Reactive state management** với Zustand cho predictable updates
- **Functional programming** patterns cho data transformations
- **No generic fallbacks** - mỗi node có custom form riêng để ensure flexibility

### ⚡ Performance Optimizations
- **Code splitting** với dynamic imports
- **Memoization** cho expensive computations
- **Virtualization** cho large datasets
- **Bundle optimization** với Vite's rollup integration

### 🔒 Code Quality
- **ESLint rules** enforced across codebase
- **Type safety** với strict TypeScript configuration
- **Component testing** setup với modern testing utilities
- **Clean code practices** sau comprehensive cleanup process

## �️ Hướng Dẫn Tạo Node Mới

### 📝 Quy Trình 5 Bước

#### 1️⃣ **Tạo Thư Mục & Files**
```bash
cd apps/web/src/nodes
mkdir my-node
cd my-node

# Tạo các files bắt buộc:
# - index.ts       (Node definition + export)
# - schema.ts      (Zod schema + TypeScript types)
# - runtime.ts     (Execution logic)
# - MyNodeForm.tsx (Custom React form)
# - README.md      (Documentation)
```

#### 2️⃣ **Định Nghĩa Schema** (`schema.ts`)
```typescript
import { z } from "zod";

// Zod schema cho validation
export const myNodeConfigSchema = z.object({
  myField: z.string().min(1, "Field is required"),
  myOption: z.enum(["option1", "option2"]),
});

// TypeScript type inference
export type MyNodeConfig = z.infer<typeof myNodeConfigSchema>;
```

#### 3️⃣ **Tạo Custom Form** (`MyNodeForm.tsx`)
```typescript
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NodeFormProps } from "@repo/types";
import { Input, Select, Button } from "../../../design-system/primitives";
import { TokenizedInput } from "../../../components/form-system/TokenizedInput";
import { MyNodeConfig, myNodeConfigSchema } from "./schema";

export const MyNodeForm: React.FC<NodeFormProps<MyNodeConfig>> = ({
  value,
  onChange,
  onRun,
  isRunning,
  stepOutputs,
}) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<MyNodeConfig>({
    resolver: zodResolver(myNodeConfigSchema),
    defaultValues: value,
  });

  React.useEffect(() => {
    const subscription = watch((data) => onChange(data as MyNodeConfig));
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  return (
    <form onSubmit={handleSubmit(onRun)} className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-sm font-medium text-gray-700">My Node Config</h3>
      </div>

      {/* Fields */}
      <TokenizedInput
        label="My Field"
        value={watch("myField") || ""}
        onChange={(val) => setValue("myField", val)}
        error={errors.myField?.message}
        stepOutputs={stepOutputs}
      />

      <Select
        label="My Option"
        {...register("myOption")}
        error={errors.myOption?.message}
      >
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
      </Select>

      {/* Footer */}
      <Button type="submit" disabled={isRunning} fullWidth>
        {isRunning ? "Running..." : "Run"}
      </Button>
    </form>
  );
};
```

#### 4️⃣ **Implement Runtime Logic** (`runtime.ts`)
```typescript
import type { NodeRuntime } from "../types";
import type { MyNodeConfig } from "./schema";

export const myNodeRuntime: NodeRuntime<MyNodeConfig> = {
  async execute(config, context) {
    const { myField, myOption } = config;
    
    // Access previous step output
    const previousData = context.previousOutput;
    
    // Your logic here
    const result = {
      processed: true,
      field: myField,
      option: myOption,
    };
    
    return {
      success: true,
      data: result,
    };
  },
};
```

#### 5️⃣ **Register Node** (`index.ts` + `nodes/index.ts`)
```typescript
// apps/web/src/nodes/my-node/index.ts
import type { NodeSchema } from "@repo/types";
import { MyNodeForm } from "./MyNodeForm";
import { myNodeRuntime } from "./runtime";
import { myNodeConfigSchema } from "./schema";

export const myNodeDefinition: NodeSchema = {
  type: "my-node",
  label: "My Node",
  description: "Description of what this node does",
  category: "data",
  icon: "⚡",
  color: "#3B82F6",
  configSchema: myNodeConfigSchema,
  formComponent: MyNodeForm, // ✅ REQUIRED
  runtime: myNodeRuntime,
  inputs: [{ key: "in", label: "Input" }],
  outputs: [{ key: "out", label: "Output" }],
};
```

```typescript
// apps/web/src/nodes/index.ts
import { myNodeDefinition } from "./my-node";

export const nodeDefinitionsArray: NodeSchema[] = [
  // ... existing nodes
  myNodeDefinition, // Add here
];
```

### ⚠️ Lưu Ý Quan Trọng

1. **Custom Form là BẮT BUỘC**: Mọi node PHẢI có `formComponent` - không dùng generic fallback
2. **Sử dụng Design System**: Import components từ `design-system/primitives` để consistency
3. **TokenizedInput cho expressions**: Dùng `TokenizedInput` thay vì `Input` cho fields hỗ trợ `{{tokens}}`
4. **React Hook Form + Zod**: Pattern chuẩn cho validation và form handling
5. **Documentation**: Luôn tạo `README.md` cho mỗi node

## �📞 Liên Hệ & Support

- **GitHub**: [QuangChinhDE/de-app](https://github.com/QuangChinhDE/de-app)
- **Issues**: [GitHub Issues](https://github.com/QuangChinhDE/de-app/issues)

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Made with ❤️ by QuangChinhDE**

*"Building workflows should be as intuitive as drawing a flowchart"*