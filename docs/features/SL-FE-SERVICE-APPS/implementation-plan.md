# Implementation Plan

## Feature 信息

- Feature ID: SL-FE-SERVICE-APPS
- 开发负责人: Codex

## 变更范围

- 代码文件:
  - `apps/buyer-app/src/pages/ServiceMarket/index.tsx`
  - `apps/buyer-app/src/pages/Dashboard/Services.tsx`
  - `apps/buyer-app/src/pages/Dashboard/ServicePanelGate.tsx`
  - `apps/buyer-app/src/pages/Dashboard/serviceAccess.ts`
  - `apps/buyer-app/src/pages/Dashboard/ServiceIconBadge.tsx`
  - `apps/buyer-app/src/pages/Dashboard/Finance.tsx`
  - `apps/buyer-app/src/pages/Dashboard/Logistics.tsx`
  - `apps/buyer-app/src/pages/Dashboard/Warehouse.tsx`
  - `apps/buyer-app/src/router/index.tsx`
  - `apps/buyer-app/src/components/Layout/HomeHeader.tsx`
  - `apps/buyer-app/src/components/Layout/DashboardLayout.tsx`
- 文档文件:
  - `docs/features/SL-FE-SERVICE-APPS/*`
- 配置文件: 无
- 脚本文件: 无

## 实施步骤

1. 补齐 feature 文档四件套，明确买家侧合并展示和服务方独立后台边界。
2. 在 buyer-app 增加物流仓储服务市场页面和主导航入口。
3. 新增 dashboard 服务入口与本地开通状态，按开通状态显示侧边栏菜单。
4. 将物流、仓储、资金面板放入 `/dashboard/logistics`、`/dashboard/warehouse`、`/dashboard/finance`。
5. 执行应用级 build 验证，并按耗时情况执行 harness gate。

## 验证计划

- `pnpm --filter @steellink/buyer-app build`
- `./harness/verify.sh`
- 需要的人工验证: 后续浏览器走查 `/dashboard/services`、`/dashboard/logistics`、`/dashboard/warehouse`、`/dashboard/finance`

## 风险与回滚关注点

- 当前是前端静态原型，后续接后端时要收敛 API 契约、企业服务订阅与权限模型。
- 本地开通状态只用于前端验证，不能作为真实权限或计费依据。
