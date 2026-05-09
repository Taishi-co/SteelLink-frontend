# Revert 910b486 Release Checklist

## 发布基本信息

- Feature ID: SL-FE-REVERT-910B486
- 发布负责人: Codex
- 目标环境: production

## 发布前检查

- [ ] `./harness/release.sh docs/features/SL-FE-REVERT-910B486` 已通过
- [ ] `./harness/verify.sh` 已通过
- [ ] buyer-app 相关 lint/build 已通过或由 harness 覆盖
- [ ] 已确认环境变量、CI 或跨仓依赖
- [ ] 已确认 smoke test 范围
- [ ] GitHub PR 创建后，已执行 `./harness/lark-pr-doc.sh docs/features/SL-FE-REVERT-910B486 --pr-url <github-pr-url> --pr-title "<pr-title>"` 并写入共享飞书 PR 记录

## 回滚信息

- 回滚目标版本: 本次 revert commit
- 回滚步骤: 对本次 revert commit 再执行一次 `git revert`
- 回滚后验证: 重新执行 `./harness/verify.sh` 并检查 buyer-app 受影响页面

## 发布后验证

- [ ] buyer-app AI 采购页可正常打开
- [ ] buyer-app 购物车、商品列表、Dashboard 服务入口可正常打开
- [ ] PR 合入后 CI checks 通过
