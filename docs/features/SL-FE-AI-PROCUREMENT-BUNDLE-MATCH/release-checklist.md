# AI Procurement Bundle Match Release Checklist

## 发布基本信息

- Feature ID: SL-FE-AI-PROCUREMENT-BUNDLE-MATCH
- 发布负责人: Codex
- 目标环境: production

## 发布前检查

- [ ] `./harness/release.sh docs/features/SL-FE-AI-PROCUREMENT-BUNDLE-MATCH` 已通过
- [ ] `./harness/verify.sh` 已通过
- [ ] `pnpm --filter @steellink/buyer-app build` 已通过
- [ ] 已确认环境变量、CI 或跨仓依赖
- [ ] 已确认 smoke test 范围
- [ ] GitHub PR 创建后，已执行 `./harness/lark-pr-doc.sh docs/features/SL-FE-AI-PROCUREMENT-BUNDLE-MATCH --pr-url <github-pr-url> --pr-title "<pr-title>"` 并写入共享飞书 PR 记录

## 回滚信息

- 回滚目标版本: 合并前版本。
- 回滚步骤: Revert PR 并重新部署 buyer-app。
- 回滚后验证: 打开 `/ai-procurement`，完成单商品 AI采购流程。

## 发布后验证

- [ ] AI采购商品匹配页可多选商品并输入数量
- [ ] 拼单数量校验生效
- [ ] 订单生成请求成功
