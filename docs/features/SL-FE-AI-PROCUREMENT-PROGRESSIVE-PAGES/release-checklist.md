# Release Checklist: AI采购渐进式页面

## 发布基本信息

- Feature ID: SL-FE-AI-PROCUREMENT-PROGRESSIVE-PAGES
- 发布负责人: Codex
- 目标环境: buyer-app

## 发布前检查

- [ ] `./harness/release.sh docs/features/SL-FE-AI-PROCUREMENT-PROGRESSIVE-PAGES` 已通过
- [ ] `./harness/verify.sh` 已通过
- [ ] `pnpm --filter @steellink/buyer-app build` 已通过
- [ ] 已确认环境变量、CI 或跨仓依赖
- [ ] 已确认 smoke test 范围: `/ai-procurement`、`/ai-procurement/1`、`/ai-procurement/2`、`/ai-procurement/3`、`/ai-procurement/4`、`/ai-procurement/5`
- [ ] GitHub PR 创建后，已执行 `./harness/lark-pr-doc.sh docs/features/SL-FE-AI-PROCUREMENT-PROGRESSIVE-PAGES --pr-url <github-pr-url> --pr-title "<pr-title>"` 并写入共享飞书 PR 记录

## 回滚信息

- 回滚目标版本: 上一版 buyer-app AI采购页面
- 回滚步骤: 回滚本 feature 涉及的 AI采购页面、路由和 feature 文档变更
- 回滚后验证: 打开 `/ai-procurement` 并执行 buyer-app build

## 发布后验证

- [ ] `/ai-procurement` 首页展示流程可视化、采购对话、我的AI采购和AI采购例子
- [ ] 五个步骤路由均可访问
- [ ] 已登录用户可解析需求、创建采购单并提交审核
- [ ] 未登录用户访问时不会触发登录态接口
