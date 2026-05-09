# Revert 910b486 Implementation Plan

## Feature 信息

- Feature ID: SL-FE-REVERT-910B486
- 开发负责人: Codex

## 变更范围

- 代码文件: `git revert 910b4861137e4d10ddbd4fb4cd2d9bdaf0bbb760` 生成的 buyer-app 代码恢复
- 文档文件: `docs/features/SL-FE-REVERT-910B486/*`
- 配置文件: 无
- 脚本文件: 无

## 实施步骤

1. 从最新 `origin/main` 新建 `fix/SL-FE-REVERT-910b486` 独立 worktree 分支。
2. 执行 `git revert --no-edit 910b4861137e4d10ddbd4fb4cd2d9bdaf0bbb760`。
3. 补齐 feature 文档并运行仓库验证、review 与 release 入口。

## 验证计划

- `./harness/branch-guard.sh local`
- `./harness/verify.sh`
- `./harness/review.sh docs/features/SL-FE-REVERT-910B486`
- `./harness/release.sh docs/features/SL-FE-REVERT-910B486`
- 需要的人工验证: PR 合入后在买家端 smoke test AI 采购、购物车、商品列表和 Dashboard 服务入口

## 风险与回滚关注点

- 本次 revert 会恢复 `910b486` 删除的旧实现；若后续需求依赖这些删除，应在业务确认后单独提交替代实现。
- 若需要回滚本次修复，可 revert 本次 revert commit。
