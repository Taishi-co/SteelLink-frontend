# Release Checklist: AI采购渐进式确认流程

## 发布基本信息

- Feature ID: SL-FE-AI-PROCUREMENT-GUIDED-WORKFLOW
- 发布负责人: Codex
- 目标环境: buyer-app

## 发布前检查

- [ ] `./harness/release.sh docs/features/SL-FE-AI-PROCUREMENT-GUIDED-WORKFLOW` 已通过
- [ ] `./harness/verify.sh` 已通过
- [ ] `pnpm --filter @steellink/buyer-app build` 已通过
- [ ] 已确认后端 `SL-AI-PROCUREMENT-GUIDED-WORKFLOW` 同步发布
- [ ] 已确认 smoke test 范围: `/ai-procurement`、五个步骤页、参数确认、商品选择、订单生成、融资匹配、审核提交
- [ ] GitHub PR 创建后，已执行 `./harness/lark-pr-doc.sh docs/features/SL-FE-AI-PROCUREMENT-GUIDED-WORKFLOW --pr-url <github-pr-url> --pr-title "<pr-title>"` 并写入共享飞书 PR 记录

## 回滚信息

- 回滚目标版本: 上一版 AI采购渐进式页面
- 回滚步骤: 回滚本 feature 涉及的 AI采购页面、服务封装和 feature 文档
- 回滚后验证: `pnpm --filter @steellink/buyer-app build`

## 发布后验证

- [ ] 第 1-4 步页面展示流程图
- [ ] 审核提交页只展示订单详情和融资详情
- [ ] 提交审核时可选择是否保存历史
