# Implementation Plan

## Feature 信息

- Feature ID: SL-FE-NOTIFICATIONS
- 开发负责人: Codex

## 变更范围

- 代码文件: `apps/buyer-app/src/pages/Notifications/*`、`apps/seller-app/src/pages/Notifications/*`、相关 router/layout/service
- 文档文件: `docs/features/SL-FE-NOTIFICATIONS/*`
- 配置文件: 无
- 脚本文件: 无

## 实施步骤

1. 新增买家/卖家 notification service。
2. 新增站内信列表页面。
3. 注册买家/卖家路由和菜单入口。
4. 执行买家/卖家 build 验证。

## 验证计划

- `pnpm --filter @steellink/buyer-app build`
- `pnpm --filter @steellink/seller-app build`
- 需要的人工验证: 登录后访问站内信页面，执行已读操作。

## 风险与回滚关注点

- 后端未发布前页面会显示接口错误。
