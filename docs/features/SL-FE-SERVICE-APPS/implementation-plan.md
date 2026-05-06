# Implementation Plan

## Feature 信息

- Feature ID: SL-FE-SERVICE-APPS
- 开发负责人: Codex

## 变更范围

- 代码文件:
  - `apps/buyer-app/src/services/serviceFulfillmentService.ts`
  - `apps/buyer-app/src/services/serviceOfferService.ts`
  - `apps/seller-app/src/services/serviceOfferService.ts`
  - `apps/buyer-app/src/pages/ServiceMarket/index.tsx`
  - `apps/buyer-app/src/pages/Dashboard/Services.tsx`
  - `apps/buyer-app/src/pages/Dashboard/ServicePanelGate.tsx`
  - `apps/buyer-app/src/pages/Dashboard/serviceAccess.ts`
  - `apps/buyer-app/src/pages/Dashboard/ServiceIconBadge.tsx`
  - `apps/buyer-app/src/pages/Dashboard/Finance.tsx`
  - `apps/buyer-app/src/pages/Dashboard/Logistics.tsx`
  - `apps/buyer-app/src/pages/Dashboard/Warehouse.tsx`
  - `apps/buyer-app/src/pages/Checkout/index.tsx`
  - `apps/buyer-app/src/pages/OrderDetail/index.tsx`
  - `apps/seller-app/src/pages/Products/index.tsx`
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
5. 补充仓储平台仓库管理、商品绑定关系、入库/出库记录和作业待办，并切换到后端接口。
6. 补充物流平台物流商管理、运输跟踪、估价、发单/接单和履约保障，并切换到后端接口。
7. 调整买家订单确认页，展示有仓库商品的推荐物流和无仓库商品的物流平台找车入口。
8. 调整订单详情，展示仓库到物流再到买家的追踪链路和履约保障。
9. 调整卖家商品发布，支持选择平台登记仓库并回填 `warehouse_info`。
10. 执行应用级 build 验证，并按耗时情况执行 harness gate。
11. 对服务器真实接口执行 smoke test，确认仓库、物流订单、出入库和价格估算可返回联调数据。

## 验证计划

- `pnpm --filter @steellink/buyer-app build`
- `pnpm --filter @steellink/seller-app build`
- `./harness/verify.sh`
- 真实接口 smoke: `/warehouse-services`、`/logistics/orders`、`/warehouse-movements`、`/logistics/estimate`
- 需要的人工验证: 后续浏览器登录走查 `/dashboard/services`、`/dashboard/logistics`、`/dashboard/warehouse`、`/dashboard/finance`、`/checkout`、`/orders/:id`、seller-app 商品发布弹窗

## 风险与回滚关注点

- 当前物流仓储数据已接后端接口，仍需在部署后用真实登录态走查权限模型。
- 本地开通状态只用于前端验证，不能作为真实权限或计费依据。
- 卖家商品发布仍受现有后端 `warehouse_info` 必填约束影响；“暂不绑定”目前是前端业务讨论状态，后端放开前不能作为真实无仓商品提交路径。
