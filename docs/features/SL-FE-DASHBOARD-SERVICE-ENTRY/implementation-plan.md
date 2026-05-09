# SL-FE-DASHBOARD-SERVICE-ENTRY Implementation Plan

## Feature 信息

- Feature ID: SL-FE-DASHBOARD-SERVICE-ENTRY
- 开发负责人: Codex

## 变更范围

- 代码文件:
  - `apps/buyer-app/src/components/Layout/DashboardLayout.tsx`
  - `apps/buyer-app/src/pages/ServiceWorkspace/index.tsx`
  - `apps/logistics-app/src/App.tsx`
  - `apps/warehouse-app/src/App.tsx`
- 文档文件:
  - `docs/features/SL-FE-DASHBOARD-SERVICE-ENTRY/spec.md`
  - `docs/features/SL-FE-DASHBOARD-SERVICE-ENTRY/test-cases.md`
  - `docs/features/SL-FE-DASHBOARD-SERVICE-ENTRY/implementation-plan.md`
  - `docs/features/SL-FE-DASHBOARD-SERVICE-ENTRY/release-checklist.md`
- 配置文件: 无
- 脚本文件: 无

## 实施步骤

1. 读取 dashboard 布局中的服务权限集合，复用 `status === 2` 的已开通判断。
2. 在 dashboard 侧栏底部新增物流、仓储管理中心入口，和卖家中心、资金方工作台入口并列，并跳转到独立 `/logistics/`、`/warehouse/` 应用。
3. 为 `logistics-app` 和 `warehouse-app` 增加默认工作台概览，聚合对应订单、资源、待办和快捷入口。
4. 调整服务能力详情页中物流、仓储已开通后的操作按钮，补充独立管理中心跳转。
5. 执行 buyer/logistics/warehouse app lint/build 与仓库 harness gate。

## 验证计划

- `pnpm --filter @steellink/buyer-app lint`
- `pnpm --filter @steellink/buyer-app build`
- `pnpm --filter @steellink/logistics-app lint`
- `pnpm --filter @steellink/logistics-app build`
- `pnpm --filter @steellink/warehouse-app lint`
- `pnpm --filter @steellink/warehouse-app build`
- `./harness/verify.sh`
- `./harness/review.sh docs/features/SL-FE-DASHBOARD-SERVICE-ENTRY`
- `./harness/release.sh docs/features/SL-FE-DASHBOARD-SERVICE-ENTRY`
- 需要的人工验证: 使用已开通物流/仓储能力账户访问 `/dashboard`，确认入口展示并跳转到 `/logistics/`、`/warehouse/`，且两个独立应用默认展示工作台概览。

## 风险与回滚关注点

- 本次不改变后端权限模型。若后端服务权限数据异常，buyer 入口会按现有逻辑隐藏，独立 app 继续展示自身权限提示。
- 回滚时移除新增入口、服务详情页按钮和独立 app 概览 tab 即可，不涉及数据迁移。
