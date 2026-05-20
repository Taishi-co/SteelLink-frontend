# Implementation Plan

## Feature 信息

- Feature ID: SL-FE-CROSS-APP-MANUAL-AUTH
- 开发负责人: Codex

## 变更范围

- 代码文件: `apps/seller-app/src/services/auth.ts`, `apps/buyer-app/src/services/auth.ts`
- 文档文件: `docs/features/SL-FE-CROSS-APP-MANUAL-AUTH/*`
- 配置文件: 无
- 脚本文件: 无

## 实施步骤

1. 将卖家端 token 存储键从共享 `token` 改为 `seller_token`，保留旧共享 token 的一次性兼容读取。
2. 删除卖家登录和用户刷新时对 `buyer_user` 的写入。
3. 删除买家登录和用户刷新时对 `seller_user` 与 `seller_enterprise_role` 的写入。
4. 保持卖家中心“买家首页”入口为普通链接，不发起 switch-session 或登录接口。

## 验证计划

- `pnpm --filter @steellink/seller-app build`
- `pnpm --filter @steellink/buyer-app build`
- 人工验证: 登录卖家后点击“买家首页”，确认买家首页未自动登录。

## 风险与回滚关注点

- 已登录用户在上线后可能需要重新登录卖家端一次，以便写入新的 `seller_token`。
- 若业务以后仍需要“一键切换身份”，应做成显式按钮和后端接口，而不是隐藏在“买家首页”普通导航中。
