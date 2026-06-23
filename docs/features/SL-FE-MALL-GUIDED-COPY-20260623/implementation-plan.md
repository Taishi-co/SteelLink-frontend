# Implementation Plan

## Feature 信息

- Feature ID: SL-FE-MALL-GUIDED-COPY-20260623
- 开发负责人: Codex

## 变更范围

- 代码文件: `apps/buyer-app/src/pages/Home/index.tsx`、`apps/buyer-app/src/pages/Mall/index.tsx`、`apps/buyer-app/src/components/Layout/HomeFooter.tsx`、`apps/buyer-app/src/pages/Login/index.tsx`
- 文档文件: `docs/features/SL-FE-MALL-GUIDED-COPY-20260623/*`
- 配置文件: 无
- 脚本文件: 无

## 实施步骤

1. 补齐本次 feature 文档，明确公开页文案优化范围和验收标准。
2. 调整首页公开文案与服务说明，突出平台定位、用户路径和履约金融能力。
3. 调整商城页首屏与导购区块，强化“如何开始采购”的指引。
4. 统一页脚和登录页的公开口径，确保对外描述正式一致。
5. 执行仓库级 verify 与 buyer-app lint/build。

## 验证计划

- `./harness/verify.sh`
- `pnpm --filter @steellink/buyer-app lint`
- `pnpm --filter @steellink/buyer-app build`
- 需要的人工验证: 打开首页、商城页、登录页，确认文案更正式且关键入口清晰

## 风险与回滚关注点

- 变更集中在公开页展示层，接口和权限逻辑不变，回滚风险较低。
- 需关注文案调整不要影响现有按钮跳转和响应式布局。
