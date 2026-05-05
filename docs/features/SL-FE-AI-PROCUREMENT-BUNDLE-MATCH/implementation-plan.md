# AI Procurement Bundle Match Implementation Plan

## Feature 信息

- Feature ID: SL-FE-AI-PROCUREMENT-BUNDLE-MATCH
- 开发负责人: Codex

## 变更范围

- 代码文件:
  - `apps/buyer-app/src/pages/AiProcurement/index.tsx`
  - `apps/buyer-app/src/services/aiProcurementService.ts`
- 文档文件:
  - `docs/features/SL-FE-AI-PROCUREMENT-BUNDLE-MATCH/*`
- 配置文件: 无。
- 脚本文件: 无。

## 实施步骤

1. 扩展 AI采购 service 类型，允许 `selected_products` 请求字段。
2. 将商品匹配阶段从单选改为多选，并支持各商品数量输入。
3. 在确认商品时校验拼单数量合计等于采购数量。
4. 订单生成阶段展示多商品明细并提交后端。

## 验证计划

- `pnpm exec eslint apps/buyer-app/src/pages/AiProcurement/index.tsx apps/buyer-app/src/services/aiProcurementService.ts`
- `pnpm --filter @steellink/buyer-app build`
- `./harness/verify.sh`
- `./harness/review.sh docs/features/SL-FE-AI-PROCUREMENT-BUNDLE-MATCH`
- `./harness/release.sh docs/features/SL-FE-AI-PROCUREMENT-BUNDLE-MATCH`
- 需要的人工验证: 浏览器完成 AI采购 30+70 拼单下单。

## 风险与回滚关注点

- 后端当前限制同一订单内商品必须来自同一卖家；跨卖家拼单会由后端明确拒绝。
- 回滚可撤回前端多选逻辑，恢复单商品提交。
