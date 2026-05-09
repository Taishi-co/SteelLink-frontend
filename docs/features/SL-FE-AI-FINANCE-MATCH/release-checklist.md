# AI Procurement Finance Recommendation UX Release Checklist

## 发布基本信息

- Feature ID: `SL-FE-AI-FINANCE-MATCH`
- 发布负责人: Codex
- 目标环境: production

## 发布前检查

- [ ] `./harness/release.sh docs/features/SL-FE-AI-FINANCE-MATCH` 已通过
- [ ] `./harness/verify.sh` 已通过
- [ ] `pnpm --filter @steellink/buyer-app lint` 已通过
- [ ] `pnpm --filter @steellink/buyer-app build` 已通过
- [ ] 已确认环境变量、CI 或跨仓依赖: 依赖后端 `SL-BE-AI-FINANCE-MATCH`
- [ ] 已确认 smoke test 范围: `/ai-procurement/5`, `/ai-procurement/6`, `/orders/:id` 待支付/融资操作
- [ ] GitHub PR 创建后，已执行 `./harness/lark-pr-doc.sh docs/features/SL-FE-AI-FINANCE-MATCH --pr-url <github-pr-url> --pr-title "<pr-title>"` 并写入共享飞书 PR 记录

## 回滚信息

- 回滚目标版本: 合并前 `main`
- 回滚步骤: revert PR
- 回滚后验证: AI采购非融资流程、订单支付凭证上传仍可用

## 发布后验证

- [ ] AI采购融资步骤可显示真实金融产品
- [ ] 订单详情融资弹窗可读取 AI推荐标记
