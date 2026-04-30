# Git Workflow

本文件定义 SteelLink 前端治理仓及其配套应用仓的分支、PR、review 与合并规范。

## 主干规则

- `main` 是唯一受保护主干
- 禁止任何人或 agent 直接向 `main` 提交业务改动
- 所有需求必须从最新 `main` 拉出分支开发
- 所有代码必须通过 PR 合入 `main`
- PR 通过 review、CI 和必要的 CODEOWNERS 审核后，才允许合并

## 标准开发流程

1. `git fetch origin`
2. `git switch main`
3. `git pull --ff-only`
4. `git switch -c <type>/<feature-id>-<slug>`
5. 补齐 `docs/features/<feature-id>/`
6. 开发并执行 `./harness/verify.sh`
7. 发起指向 `main` 的 PR，并取得 GitHub PR URL
8. 执行 `./harness/lark-pr-doc.sh docs/features/<feature-id> --pr-url <github-pr-url> --pr-title "<pr-title>"`，将 feature PRD 产物同步为飞书文档并写入共享 PR 记录的 `Frontend` 段落
9. 通过 `./harness/branch-guard.sh ci`、review gate、CI checks
10. 使用 `Squash merge` 合入 `main`

如果当前工作区只是文档快照而非 Git worktree：

- 不要伪造当前分支名、PR 状态或 CI 结果
- 仍按本规范编写文档与脚本
- 在实际 Git 仓库中再执行分支保护与 PR 流程

## 分支命名规范

允许的前缀：

- `feat/`
- `fix/`
- `docs/`
- `chore/`
- `refactor/`
- `test/`
- `hotfix/`

推荐格式：

```text
feat/SL-FE-024-order-risk-banner
fix/SL-FE-024-order-risk-banner
docs/SL-FE-024-governance-note
```

## PR 规则

- base branch 必须是 `main`
- head branch 不能是 `main`
- PR 描述必须包含 `Feature ID`、`Feature 文档`、验证结果、风险与回滚说明
- PR 完成创建后必须补充飞书 PRD/PR 记录链接；如飞书写入失败，必须在 PR 或最终交付说明中写明失败原因和重试命令
- 所有 review comments 必须处理或解释
- 合并前必须保证 CI checks 全绿

## 保护策略

- GitHub 仓库应开启 branch protection
- 要求至少 1 个 reviewer
- 要求 status checks 通过后才能 merge
- 禁止 bypass review 直接 merge

## 工具入口

- 本地分支检查：`./harness/branch-guard.sh local`
- CI PR 检查：`./harness/branch-guard.sh ci`
- 飞书 PRD/PR 记录同步：`./harness/lark-pr-doc.sh docs/features/<feature-id> --pr-url <github-pr-url> --pr-title "<pr-title>"`

## 说明

仓库内脚本和 CI 只能尽量阻断违规流程，真正的 branch protection 仍需要在 GitHub 仓库设置中开启。
