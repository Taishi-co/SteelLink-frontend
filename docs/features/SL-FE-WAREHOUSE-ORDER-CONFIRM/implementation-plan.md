# SL-FE-WAREHOUSE-ORDER-CONFIRM 实现计划

## 实施时间
2026-05-09

## 人员
Agent (AI Assistant)

## 实施步骤

### Step 1: 问题定位
- **日期:** 2026-05-09
- **操作:** 分析点击"确认"按钮后重复弹出确认弹窗的原因
- **发现:** `setSelectedOrder(record)` 会同时打开详情弹窗（visible={!!selectedOrder}），导致详情弹窗和确认弹窗同时出现

### Step 2: 前端修复 - 状态隔离
- **日期:** 2026-05-09
- **文件:** `apps/buyer-app/src/pages/Dashboard/Warehouse.tsx`
- **改动:**
  - 新增 `confirmOrderRef` 和 `rejectOrderRef` 状态变量
  - 确认/驳回按钮使用独立 ref，避免与 selectedOrder 冲突
  - Modal 显示使用新的 ref 数据

### Step 3: 后端修复 - 支持驳回
- **日期:** 2026-05-09
- **文件:** `internal/modules/order/application/service/order_service.go`
- **改动:**
  - WarehouseConfirm 方法支持 `confirmed=false` 时驳回订单
  - 订单状态从12回退到1（待确认）
  - 创建 `warehouse_rejected` 事件记录

### Step 4: API 类型修正
- **日期:** 2026-05-09
- **文件:** `apps/buyer-app/src/services/orderService.ts`
- **改动:**
  - `warehouseConfirm` 参数类型从 `{ condition_ok, remark }` 改为 `{ confirmed, condition_note }`
  - 与后端 API 保持一致

### Step 5: 构建验证
- **日期:** 2026-05-09
- **操作:** 执行 `pnpm --filter buyer-app build` 验证构建成功

### Step 6: 功能测试
- **日期:** 2026-05-09
- **操作:** 手动测试确认入库、驳回订单等流程

### Step 7: Git 提交
- **日期:** 2026-05-09
- **操作:**
  - 后端提交: `git commit -m "feat(order): 支持仓库确认驳回操作"`
  - 前端提交: `git commit -m "feat(buyer): 仓储管理页面集成仓库订单确认功能"`

## 相关 Pull Requests

| 仓库 | 分支 | 状态 |
|------|------|------|
| SteelLink-backend | main | ✅ 已提交 |
| SteelLink-frontend | main | ✅ 已提交 |

## 备注

- 飞书CLI未正确安装，无法自动创建飞书文档
- 已手动创建 feature 文档目录 `SL-FE-WAREHOUSE-ORDER-CONFIRM`
- 需要手动在飞书 Wiki 中创建 PR 记录文档
