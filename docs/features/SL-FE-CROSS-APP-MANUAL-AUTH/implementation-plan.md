# Implementation Plan

## Feature 信息

- Feature ID: SL-FE-CROSS-APP-MANUAL-AUTH
- 开发负责人: Codex

## 变更范围

- 代码文件: `apps/seller-app/src/services/auth.ts`, `apps/seller-app/src/components/Layout/SellerLayout.tsx`, `apps/buyer-app/src/services/auth.ts`
- 文档文件: `docs/features/SL-FE-CROSS-APP-MANUAL-AUTH/*`
- 配置文件: 无
- 脚本文件: 无

## 实施步骤

1. 将卖家端 token/user 存储键从共享 `token/user` 改为 `seller_token/seller_user`。
2. 将买家端 token/user 存储键从共享 `token/user` 改为 `buyer_token/buyer_user`。
3. 将卖家中心“买家首页”入口改为普通链接，不发起 `switch-session` 或登录接口。
4. 保留买家端已有的显式“进入卖家中心”切换逻辑。

## 验证计划

- `pnpm --filter @steellink/seller-app build`
- `pnpm --filter @steellink/buyer-app build`
- 人工验证: 登录卖家后点击“买家首页”，确认买家首页未自动登录。

## 风险与回滚关注点

- 已登录用户在上线后可能需要按目标端重新登录一次，以便写入新的 `buyer_token` 或 `seller_token`。
- 若业务以后仍需要“一键切换身份”，应做成显式按钮和后端接口，而不是隐藏在“买家首页”普通导航中。
