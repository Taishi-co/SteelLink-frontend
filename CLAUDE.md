# SteelLink Frontend Claude Guide

本文件保留给 Claude Code 使用，但不再单独维护规则内容。统一规则以仓库内治理文档为准。
当前仓库是治理与协作文档仓，不默认包含完整前端业务代码。

## 必读顺序

1. `AGENTS.md`
2. `docs/ai/entrypoint.md`
3. `docs/ai/project-map.md`
4. `docs/ai/engineering-rules.md`
5. `docs/ai/git-workflow.md`
6. 如处理具体需求，再阅读 `docs/features/<feature-id>/`

## 执行要求

- 不要跳过设计文档直接编码
- 不要绕过 `harness/` 直接拼接验证、发布、部署命令
- 不要直接在 `main` 上开发或发起从非规范分支创建的 PR
- 涉及权限时必须核对配套前端应用仓的 `src/config/permissions.ts` 与 `docs/domain/role-permission-matrix.md`
- 当前目录若不是 Git worktree，不要伪造分支或 PR 状态

## 标准命令

```bash
./harness/bootstrap.sh
./harness/branch-guard.sh local
./harness/verify.sh
./harness/review.sh docs/features/<feature-id>
./harness/release.sh docs/features/<feature-id>
./harness/deploy.sh staging
```
