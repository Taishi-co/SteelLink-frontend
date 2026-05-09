# Implementation Plan

## Feature 信息

- Feature ID: SL-FE-SELLER-BUYER-HOME-SESSION
- 开发负责人: Codex

## 变更范围

- 代码文件: `apps/seller-app/src/components/Layout/SellerLayout.tsx`
- 文档文件: `docs/features/SL-FE-SELLER-BUYER-HOME-SESSION/*`
- 配置文件: 无
- 脚本文件: 无

## 实施步骤

1. 复用卖家端已有 `sellerAuthService.createSwitchSession()`。
2. 将“买家首页”按钮改为异步生成 `switch_token` 后跳转 `/login?switch_token=...&redirect=/`。
3. 为按钮增加加载态，并保留失败后的直接跳转兜底。

## 验证计划

- `pnpm --filter @steellink/seller-app build`
- `./harness/review.sh docs/features/SL-FE-SELLER-BUYER-HOME-SESSION`
- `./harness/release.sh docs/features/SL-FE-SELLER-BUYER-HOME-SESSION`
- 人工验证: 登录后进入卖家中心，点击“买家首页”，确认买家首页仍展示登录用户。

## 风险与回滚关注点

- 若后端切换会话接口不可用，会回退到直接跳转买家首页，用户可能仍需手动登录。
