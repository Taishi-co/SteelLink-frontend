# AI Procurement Inquiry Flow Fix Release Checklist

## 发布基本信息

- Feature ID: SL-AI-PROCUREMENT-INQUIRY-FLOW-FIX
- 发布负责人: Codex
- 目标环境: buyer-app

## 发布前检查

- [ ] `./harness/release.sh docs/features/SL-AI-PROCUREMENT-INQUIRY-FLOW-FIX` 已通过
- [ ] `./harness/verify.sh` 已通过
- [ ] `pnpm --filter @steellink/buyer-app typecheck` 已通过
- [ ] `pnpm --filter @steellink/buyer-app build` 已通过
- [ ] 已确认环境变量、CI 或跨仓依赖
- [ ] 已确认 smoke test 范围: AI采购首页、参数确认、商品选择、物流匹配、订单生成、融资匹配、审核提交
- [ ] GitHub PR 创建后，已执行 `./harness/lark-pr-doc.sh docs/features/SL-AI-PROCUREMENT-INQUIRY-FLOW-FIX --pr-url <github-pr-url> --pr-title "<pr-title>"` 并写入共享飞书 PR 记录

## 回滚信息

- 回滚目标版本: 修复前 AI采购页面和服务封装
- 回滚步骤: 回退 `apps/buyer-app/src/pages/AiProcurement/index.tsx`、`apps/buyer-app/src/services/aiProcurementService.ts` 和本 feature 文档
- 回滚后验证: AI采购首页和历史记录仍可打开

## 发布后验证

- [ ] AI采购完整链路可正常完成
- [ ] 无真实商品时不会进入订单生成
