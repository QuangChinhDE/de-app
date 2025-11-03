# ⚡ Node Playground

> **Visual Workflow Builder** - Xây dựng và test các workflow phức tạp thông qua giao diện kéo thả trực quan

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.10-purple?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.13-blue?logo=tailwindcss)](https://tailwindcss.com/)

## 🎯 Tổng Quan

**Node Playground** là một ứng dụng workflow builder cho phép người dùng tạo ra các luồng xử lý dữ liệu phức tạp thông qua giao diện drag-and-drop trực quan. Hệ thống hỗ trợ nhiều loại node khác nhau và tích hợp tính năng tự động kết nối, xử lý dữ liệu thông minh.

### ✨ Tính Năng Nổi Bật

- **🎨 Visual Workflow Builder**: Xây dựng workflow bằng cách kéo thả các node
- **🔗 Auto Connection**: Tự động kết nối các node theo thứ tự logic
- **📦 Smart Data Flow**: Truyền dữ liệu tự động giữa các node với token resolution
- **🎛️ Multiple Input Support**: Hỗ trợ MERGE node với nhiều input (2-5 inputs)
- **🔄 Real-time Preview**: Xem kết quả ngay lập tức khi chạy workflow
- **🏷️ Drag-and-Drop Fields**: Kéo thả fields từ output để tạo tokens tự động

## 🏗️ Kiến Trúc Hệ Thống

### 🎨 3-Layer Form Architecture

Hệ thống sử dụng **kiến trúc 3 tầng** để tối ưu hóa việc quản lý forms:

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

### 🔧 Stack Công Nghệ

#### Frontend (Web App)
- **React 18.3.1** - UI framework với hooks và functional components
- **TypeScript 5.4.0** - Type safety và development experience  
- **Vite 5.4.10** - Build tool với HMR và ESM support
- **TailwindCSS 3.4.13** - Utility-first CSS framework
- **ReactFlow (@xyflow/react)** - Visual flow builder library
- **Zustand 4.5.4** - State management
- **React Hook Form 7.53.0** - Form handling với validation
- **Zod 3.23.8** - Schema validation
- **React DnD 16.0.1** - Drag and drop functionality

#### Backend (Server App)  
- **Node.js** với **Express**
- **TypeScript** cho type safety

#### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting  
- **npm workspaces** - Monorepo management
- **Concurrently** - Parallel script execution

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

## 🎮 Hướng Dẫn Sử Dụng

### 🏃‍♂️ Quick Start - 3 Bước Đơn Giản

#### 1️⃣ **Thêm Node**
- Kéo node từ **Sidebar** vào **Canvas**
- Hệ thống tự động kết nối theo thứ tự
- Các node được auto-layout thông minh

#### 2️⃣ **Cấu Hình Node**
- Click chọn node để mở **Config Panel**
- Điền các thông tin cần thiết (URL, điều kiện, v.v.)
- Sử dụng **Fuzz button** để generate test data

#### 3️⃣ **Chạy & Xem Kết Quả**
- Click **RUN** button trên node hoặc **Run Flow**
- Xem kết quả real-time trong **Results Panel**
- Tabs: Request/Response/Logs/Data

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