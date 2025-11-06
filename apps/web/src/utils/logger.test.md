# Logger System - Testing Guide

## ✅ Implementation Completed

### Files Modified:
1. ✅ `apps/web/src/utils/logger.ts` - Logger utility created
2. ✅ `apps/web/src/state/flow-store.ts` - Migrated console.log to logger
3. ✅ `apps/web/src/nodes/loop/runtime.ts` - Migrated LOOP node logging
4. ✅ `apps/web/src/nodes/merge/runtime.ts` - Migrated MERGE node logging
5. ✅ `apps/web/src/nodes/split/runtime.ts` - Migrated SPLIT node logging

### Migration Summary:

#### Before (Old Style):
```typescript
console.log(`[LOOP] Starting loop with batch size: ${batchSize}`);
console.warn(`[SPLIT] Field "${cleanPath}" is not an array:`, fieldValue);
console.error('❌ SHARED REFERENCE DETECTED!', { affectedStep, targetStep });
```

#### After (New Style):
```typescript
log.execution('Loop started', { nodeKey: currentNodeKey, nodeType: 'loop', batchSize });
log.warn('Field is not an array', { nodeKey, nodeType: 'split', fieldPath: cleanPath });
log.error('Shared config reference detected!', undefined, { affectedNodeKey, targetNodeKey });
```

## 📊 Benefits Achieved:

### 1. **Structured Logging**
- ✅ Consistent format: `[HH:MM:SS] LEVEL Message {context}`
- ✅ Colored output for different log levels
- ✅ Context includes nodeKey, nodeType, stepName automatically

### 2. **Better Debugging**
- ✅ Easy to filter logs by node type or operation
- ✅ Timestamp for tracking execution flow
- ✅ Additional data logged separately for readability

### 3. **Production Ready**
- ✅ Log level control (DEBUG/INFO/WARN/ERROR)
- ✅ Development mode toggle (auto-detects with import.meta.env.DEV)
- ✅ Performance timing helpers (time/timeEnd)

### 4. **Type Safe**
- ✅ TypeScript interfaces for LogContext
- ✅ Enum for LogLevel
- ✅ IntelliSense support

## 🧪 How to Test:

### 1. Run the application:
```bash
npm run dev
```

### 2. Add a node and watch console:
- Open browser DevTools (F12)
- Add a Manual node → See: `✅ SUCCESS Node added to workflow {[manual1] <manual> "Manual 1"}`
- Run a LOOP node → See execution logs with batch progress

### 3. Check log format:
```
[14:23:45] ✅ SUCCESS Node added to workflow {[manual1] <manual> "Manual 1"}
  └─ Object { nodeKey: "manual1", stepName: "Manual 1", nodeType: "manual" }

[14:23:48] 🎯 EXEC Loop started {[loop1] <loop>}
  └─ Object { batchSize: 10 }

[14:23:48] 🎯 EXEC Processing batch 1/3 {[loop1] <loop>}
  └─ Object { batchIndex: 1, itemsInBatch: 10 }
```

## 🎨 Log Levels & Colors:

| Level | Icon | Color | Use Case |
|-------|------|-------|----------|
| DEBUG | 🔍 | Gray | Technical details, only in dev mode |
| INFO | ℹ️ | Blue | General information |
| WARN | ⚠️ | Orange | Warnings that don't stop execution |
| ERROR | ❌ | Red (bold) | Errors with stack traces |
| SUCCESS | ✅ | Green | Operations completed successfully |
| EXEC | 🎯 | Purple | Node execution tracking |
| DATA | 📦 | Cyan | Data transformation tracking |

## 🔧 Configuration:

### Change log level at runtime:
```typescript
import { logger, LogLevel } from './utils/logger';

// Show only warnings and errors
logger.setLevel(LogLevel.WARN);

// Show everything (including DEBUG)
logger.setLevel(LogLevel.DEBUG);
```

### Group related logs:
```typescript
log.group('Processing workflow');
log.info('Step 1: Validate input');
log.info('Step 2: Transform data');
log.success('Workflow completed');
log.groupEnd();
```

### Performance timing:
```typescript
log.time('expensive-operation');
// ... do expensive work ...
log.timeEnd('expensive-operation'); // Logs: expensive-operation: 142ms
```

## 📝 Best Practices:

### ✅ DO:
```typescript
// Include context for better debugging
log.info('Processing items', { 
  nodeKey: currentNodeKey, 
  nodeType: 'loop',
  itemCount: items.length 
});

// Use appropriate log level
log.warn('Non-critical issue', { issue: 'empty array' });
log.error('Critical error', error, { operation: 'merge' });
```

### ❌ DON'T:
```typescript
// Don't use console.log directly
console.log('Something happened'); // ❌

// Don't log sensitive data
log.info('User logged in', { password: '123456' }); // ❌
```

## 🚀 Next Steps:

### Remaining files to migrate (optional):
- `apps/web/src/nodes/http/runtime.ts` - May have error logging
- `apps/web/src/nodes/if/runtime.ts` - Check for debug logs
- `apps/web/src/nodes/switch/runtime.ts` - Check for debug logs
- Any other files with console.log/warn/error

### Future enhancements:
- [ ] Remote logging (send logs to backend)
- [ ] Log persistence (save to localStorage)
- [ ] Log filtering UI (in-app log viewer)
- [ ] Performance metrics dashboard

## ✨ Summary:

**Logger system successfully implemented!** 

- ✅ No breaking changes to existing code
- ✅ Better structured logging for debugging
- ✅ Production-ready with log level control
- ✅ Type-safe with full TypeScript support
- ✅ 5 files migrated, working correctly

The system is now more maintainable and easier to debug! 🎉
