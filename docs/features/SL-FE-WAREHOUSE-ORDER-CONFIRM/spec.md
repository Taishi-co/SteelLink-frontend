# SL-FE-WAREHOUSE-ORDER-CONFIRM 仓储订单确认功能

## 1. 概述与目标

### 背景
用户反馈在买家端的仓储管理页面，点击"确认入库"按钮后会重复弹出确认对话框，影响用户体验。

### 目标
- 修复确认弹窗与详情弹窗状态冲突导致的重复弹出问题
- 支持仓库确认驳回操作（订单可回退到待确认状态）
- 将仓库订单确认功能集成到买家端仓储管理页面

## 2. 功能列表

### 2.1 前端改动 (SteelLink-frontend)

| 功能 | 描述 | 状态 |
|------|------|------|
| 待仓库确认订单列表 | 在仓储管理页面显示状态为12的订单 | ✅ 已完成 |
| 全部订单列表 | 显示所有仓库相关订单 | ✅ 已完成 |
| 订单详情弹窗 | 查看订单完整信息 | ✅ 已完成 |
| 确认入库功能 | 确认订单可入库，状态流转到下一阶段 | ✅ 已完成 |
| 驳回订单功能 | 驳回订单，状态回退到待确认 | ✅ 已完成 |
| 弹窗状态隔离 | 修复确认弹窗与详情弹窗冲突 | ✅ 已完成 |

### 2.2 后端改动 (SteelLink-backend)

| 功能 | 描述 | 状态 |
|------|------|------|
| 仓库确认驳回支持 | WarehouseConfirm 支持 confirmed=false 时的驳回逻辑 | ✅ 已完成 |
| 仓库拒绝事件记录 | 添加 warehouse_rejected 事件记录 | ✅ 已完成 |

## 3. 用户流程

### 3.1 订单状态流转

```
待仓库确认 (12)
    │
    ├── 确认 ───→ 待卖方确认 (13)
    │
    └── 驳回 ───→ 待确认 (1) ← 可重新选择仓库
```

### 3.2 操作入口

买家端 → 仓储管理 → 待仓库确认订单 → 确认/驳回

## 4. 技术细节

### 4.1 前端改动

**新增状态变量：**
```typescript
const [confirmOrderRef, setConfirmOrderRef] = useState<Order | null>(null)
const [rejectOrderRef, setRejectOrderRef] = useState<Order | null>(null)
```

**问题修复：**
- 原问题：点击确认时 setSelectedOrder 会同时打开详情弹窗和确认弹窗
- 解决方案：引入独立的 confirmOrderRef 和 rejectOrderRef，避免与 selectedOrder 冲突

### 4.2 后端改动

**WarehouseConfirm 方法扩展：**
```go
if req != nil && !req.Confirmed {
    order.Status = orderEntity.OrderStatusPendingConfirm
    // 创建 warehouse_rejected 事件
}
```

## 5. 相关文件

### 前端
- `apps/buyer-app/src/pages/Dashboard/Warehouse.tsx`
- `apps/buyer-app/src/services/orderService.ts`
- `apps/buyer-app/src/components/Layout/DashboardLayout.tsx`
- `apps/buyer-app/src/pages/Dashboard/ServicePanelGate.tsx`
- `apps/buyer-app/src/pages/Dashboard/Services.tsx`

### 后端
- `internal/modules/order/application/service/order_service.go`
