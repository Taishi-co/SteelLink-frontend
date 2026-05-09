# SteelLink 侧边栏菜单及订单归档优化 PRD

## PR Metadata

- Repository: SteelLink (Backend + Frontend)
- Feature ID: sidebar-archive-timeline
- Branch: fix/sidebar-archive-timeline / fix/order-timeline-time

## GitHub PR

- **Backend PR**: [SteelLink-backend#72](https://github.com/Taishi-co/SteelLink-backend/pull/72) - 分支：`fix/order-timeline-time` ✅ 已合并
- **Frontend PR**: [SteelLink-frontend#77](https://github.com/Taishi-co/SteelLink-frontend/pull/77) - 分支：`fix/sidebar-archive-timeline` ✅ 已合并

## 问题描述

1. 物流管理中心无法进入，不在个人工作台侧边栏显示
2. 对账完成后无法归档，卖家端缺少归档按钮
3. 归档时订单时间线所有节点时间被覆盖为归档时间

## 改动内容

### Backend (fix/order-timeline-time)

| 改动点 | 说明 |
|--------|------|
| 时间线时间修复 | 订单时间线使用订单事件的实际时间，归档时不再覆盖历史节点时间 |

### Frontend (fix/sidebar-archive-timeline)

| 改动点 | 说明 |
|--------|------|
| 物流管理菜单 | 为买家/卖家角色添加仓储、物流、融资服务兜底，确保侧边栏菜单显示 |
| 订单归档按钮 | 卖家端订单页面状态19（对账完成）时显示归档按钮 |

## 验证结果

### 后端

```bash
go build ./internal/modules/order/...
go test ./internal/modules/order/...
```

### 前端

```bash
pnpm -C SteelLink-frontend/apps/buyer-app typecheck
pnpm -C SteelLink-frontend/apps/seller-app typecheck
```
