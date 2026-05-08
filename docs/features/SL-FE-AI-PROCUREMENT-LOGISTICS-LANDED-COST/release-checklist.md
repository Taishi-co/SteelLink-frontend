# SL-FE-AI-PROCUREMENT-LOGISTICS-LANDED-COST Release Checklist

## 发布基本信息

- Feature ID: SL-FE-AI-PROCUREMENT-LOGISTICS-LANDED-COST
- 发布负责人: Codex
- 目标环境: prod

## 发布前检查

- [ ] `./harness/release.sh docs/features/SL-FE-AI-PROCUREMENT-LOGISTICS-LANDED-COST` 已通过
- [ ] `./harness/verify.sh` 已通过
- [ ] 如涉及配套应用仓，相关 lint/build/测试已通过
- [ ] 已确认环境变量、CI 或跨仓依赖
- [ ] 已确认 smoke test 范围
- [ ] GitHub PR 创建后，已执行 `./harness/lark-pr-doc.sh docs/features/SL-FE-AI-PROCUREMENT-LOGISTICS-LANDED-COST --pr-url <github-pr-url> --pr-title "<pr-title>"` 并写入共享飞书 PR 记录

## 回滚信息

- 回滚目标版本: 合并前前端稳定版本
- 回滚步骤: 回滚本 PR
- 回滚后验证: AI采购恢复旧的解析、匹配、订单生成流程

## 发布后验证

- [ ] `/ai-procurement` 可以加载仓库选项
- [ ] 商品匹配后新增物流仓储匹配步骤，并可显示多个物流方案、改选物流、无匹配时发布需求/协商解决
