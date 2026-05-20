# Implementation Plan

## Feature 信息

- Feature ID: `SL-FE-WORKBENCH-FLOW-BASELINE`
- 开发负责人: Codex

## 变更范围

- 代码文件:
  - `apps/buyer-app/src/pages/Dashboard/Overview.tsx`
  - `apps/buyer-app/src/pages/Orders/index.tsx`
  - `apps/buyer-app/src/pages/OrderDetail/index.tsx`
  - `apps/seller-app/src/pages/Orders/index.tsx`
  - `apps/warehouse-app/src/App.tsx`
  - `apps/finance-app/src/App.tsx`
- 文档文件:
  - `docs/features/SL-FE-WORKBENCH-FLOW-BASELINE/*`
- 配置文件: 无
- 部署/脚本文件: 无

## 实施步骤

1. 对照后端 `OrderStatus` 枚举梳理五个工作台的状态展示映射。
2. 修正买家、卖家、仓储、资金方工作台中的错位或缺失状态。
3. 保持现有接口和 UI 结构不变，降低本轮变更范围。
4. 执行治理校验和受影响应用构建。

## 验证计划

- `./harness/verify.sh`
- `pnpm --filter @steellink/buyer-app build`
- `pnpm --filter @steellink/seller-app build`
- `pnpm --filter @steellink/warehouse-app build`
- `pnpm --filter @steellink/finance-app build`
- 需要的人工验证: 使用联调数据查看五个工作台订单状态展示。

## 风险与回滚关注点

- 风险: 本轮只修正展示口径，如果接口本身缺少状态或筛选条件，页面仍可能没有对应数据。
- 回滚: 回退本 feature 修改的状态映射和文档即可，不涉及数据库或接口迁移。
