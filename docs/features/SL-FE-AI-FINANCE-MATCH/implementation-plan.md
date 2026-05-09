# AI Procurement Finance Recommendation UX Implementation Plan

## Feature 信息

- Feature ID: `SL-FE-AI-FINANCE-MATCH`
- 开发负责人: Codex

## 变更范围

- 代码文件: `apps/buyer-app/src/pages/AiProcurement/index.tsx`, `apps/buyer-app/src/pages/OrderDetail/index.tsx`, `apps/buyer-app/src/services/aiProcurementService.ts`, `apps/buyer-app/src/services/orderService.ts`
- 文档文件: `docs/features/SL-FE-AI-FINANCE-MATCH/*`
- 配置文件: 无
- 脚本文件: 无

## 实施步骤

1. 扩展 AI采购前端融资方案类型，支持真实融资产品 ID、AI 推荐、用户预选。
2. 在 AI采购订单生成后自动召回融资产品，并在融资步骤提供单选确认。
3. 在订单详情待支付/融资操作里展示金融产品弹窗，读取 `remark.ai_finance_recommendation` 并置顶标注。
4. 选择融资产品后调用 `createFinancingRequest` 创建真实融资申请。

## 验证计划

- `pnpm --filter @steellink/buyer-app lint`
- `pnpm --filter @steellink/buyer-app build`
- `./harness/verify.sh`
- 人工验证: AI采购融资步骤、订单详情融资产品弹窗和融资申请提交。

## 风险与回滚关注点

- 后端未返回 AI 推荐备注时，订单详情仍展示普通已审核融资产品。
- 回滚前端后，不影响后端订单融资接口。
