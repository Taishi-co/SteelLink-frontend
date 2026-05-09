# SteelLink 合同签署问题修复及订单闭环优化 PRD / PR Record

## PR Metadata

- Repository: SteelLink (Backend + Frontend)
- Feature ID: contract-sign-role-cors
- Branch: fix/contract-sign-role-cors / fix/contract-sign-ux-cors

## GitHub PR

- **Backend PR**: [SteelLink-backend#71](https://github.com/Taishi-co/SteelLink-backend/pull/71) - 分支：`fix/contract-sign-role-cors`
- **Frontend PR**: [SteelLink-frontend#76](https://github.com/Taishi-co/SteelLink-frontend/pull/76) - 分支：`fix/contract-sign-ux-cors`

## 问题描述

1. 同企业同时存在买家和卖家身份时，合同签署角色混乱；浏览器预检请求因 CORS 限制失败
2. 物流管理中心无法进入，不在个人工作台侧边栏显示
3. 对账完成后无法归档，卖家端缺少归档按钮
4. 归档时订单时间线所有节点时间被覆盖为归档时间

## 改动内容

### Backend (SteelLink-backend#71)

| 改动点 | 说明 |
|--------|------|
| X-Trade-Role 区分 | 合同签署时通过请求头 `X-Trade-Role: buyer/seller` 明确当前交易身份 |
| 签署人角色修正 | 后端按当前交易身份记签署人，避免同企业双身份时落错角色 |
| CORS 放行 | 放行 `X-Trade-Role` 响应头，修掉浏览器预检导致的 network error |
| 时间线时间修复 | 订单时间线使用订单事件的实际时间，归档时不再覆盖历史节点时间 |

### Frontend (SteelLink-frontend#76)

| 改动点 | 说明 |
|--------|------|
| 签署状态显示 | 买家/卖家页明确显示"谁已签、谁未签" |
| 签约流程优化 | 卖家签约改成先看详情再签 |
| 请求头统一 | 买卖端请求统一带上 `X-Trade-Role` |
| 侧边栏兜底 | 买家侧边栏加兜底，避免能力接口空时菜单消失 |
| 物流管理菜单 | 为买家/卖家角色添加仓储、物流、融资服务兜底，确保侧边栏菜单显示 |
| 订单归档按钮 | 卖家端订单页面状态19（对账完成）时显示归档按钮 |

## 验证结果

### 后端

```bash
go build ./internal/modules/order/...
go test ./internal/modules/order/... ./internal/pkg/middleware
```

### 前端

```bash
pnpm -C SteelLink-frontend/apps/buyer-app typecheck
pnpm -C SteelLink-frontend/apps/seller-app typecheck
```
