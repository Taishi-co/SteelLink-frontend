# SL-FE-DASHBOARD-SERVICE-ENTRY Implementation Plan

## Feature 信息

- Feature ID: SL-FE-DASHBOARD-SERVICE-ENTRY
- 开发负责人: Codex

## 变更范围

- 代码文件:
  - `apps/buyer-app/src/components/Layout/DashboardLayout.tsx`
  - `apps/buyer-app/src/pages/ServiceWorkspace/index.tsx`
- 文档文件:
  - `docs/features/SL-FE-DASHBOARD-SERVICE-ENTRY/spec.md`
  - `docs/features/SL-FE-DASHBOARD-SERVICE-ENTRY/test-cases.md`
  - `docs/features/SL-FE-DASHBOARD-SERVICE-ENTRY/implementation-plan.md`
  - `docs/features/SL-FE-DASHBOARD-SERVICE-ENTRY/release-checklist.md`
- 配置文件: 无
- 脚本文件: 无

## 实施步骤

1. 读取 dashboard 布局中的服务权限集合，复用 `status === 2` 的已开通判断。
2. 在 dashboard 侧栏底部新增物流、仓储管理中心入口，和卖家中心、资金方工作台入口并列。
3. 调整服务能力详情页中物流、仓储已开通后的操作按钮，补充管理中心跳转。
4. 执行 buyer-app lint/build 与仓库 harness gate。

## 验证计划

- `pnpm --filter @steellink/buyer-app lint`
- `pnpm --filter @steellink/buyer-app build`
- `./harness/verify.sh`
- `./harness/review.sh docs/features/SL-FE-DASHBOARD-SERVICE-ENTRY`
- `./harness/release.sh docs/features/SL-FE-DASHBOARD-SERVICE-ENTRY`
- 需要的人工验证: 使用已开通物流/仓储能力账户访问 `/dashboard`，确认入口展示并跳转到对应 dashboard 页面。

## 风险与回滚关注点

- 本次只增加前端入口，不改变后端权限模型。若后端服务权限数据异常，入口会按现有逻辑隐藏。
- 回滚时移除新增入口和服务详情页按钮即可，不涉及数据迁移。
