# SL-FE-GOV-PILOT Implementation Plan

## Feature 信息

- Feature ID: `SL-FE-GOV-PILOT`
- 开发负责人: Codex

## 变更范围

- 代码文件: 无
- 文档文件: `AGENTS.md`、`CLAUDE.md`、`docs/ai/*`、`docs/domain/*`、`docs/features/*`
- 脚本文件: `harness/bootstrap.sh`、`harness/verify.sh`、`harness/review.sh`、`harness/release.sh`、`harness/deploy.sh`

## 实施步骤

1. 识别并清理复制残留，把所有错误假设当前仓库包含完整应用代码的描述改掉。
2. 对齐 AI 入口文档、项目地图、工程规则、Git/Review/Release 规则。
3. 修正 feature 示例与模板，使其描述当前治理仓可执行的流程。
4. 调整 `harness/` 入口脚本，让 verify / review / release / deploy 在本仓内可闭环。

## 验证计划

- `./harness/bootstrap.sh`
- `./harness/verify.sh`
- `./harness/review.sh docs/features/SL-FE-GOV-PILOT`
- `./harness/release.sh docs/features/SL-FE-GOV-PILOT`
- `./harness/deploy.sh staging`
- 需要的人工验证:
  - 与配套前端应用仓的权限、路由、部署依赖是否描述清楚
  - 后续接入真实 Git/CI 环境时流程是否仍然成立

## 风险与回滚关注点

- 当前仓库不是 Git worktree，无法在本地验证真实分支保护流程
- 权限、路由、部署相关检查仍依赖配套前端应用仓配合验证
