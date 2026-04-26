# Frontend AI Entrypoint

本目录是 SteelLink 主服务前端应用仓给 AI agent 的统一上手入口，目标是让新 agent 在 5 分钟内获得足够上下文，并进入同一套开发工作流。
当前工作区包含 `apps/buyer-app`、`apps/seller-app`、`packages/shared`、治理文档与 `harness/` 脚本。

## 阅读顺序

1. `AGENTS.md`
2. `docs/ai/project-map.md`
3. `docs/ai/engineering-rules.md`
4. `docs/ai/git-workflow.md`
5. `docs/ai/review-rules.md`
6. `docs/ai/release-rules.md`
7. 具体需求对应的 `docs/features/<feature-id>/`

## 本项目的单一事实源

- 当前仓库结构与边界：`docs/ai/project-map.md`
- 工程规范与命令入口：`docs/ai/engineering-rules.md`
- Review 阻断条件：`docs/ai/review-rules.md`
- 上线与部署规则：`docs/ai/release-rules.md`
- 分支与 PR 规则：`docs/ai/git-workflow.md`
- 角色权限约束：`docs/domain/role-permission-matrix.md`

## 新需求执行协议

收到需求后不要立即写代码，先确认以下四件事：

1. 是否已经存在 feature 文档目录
2. 是否已有 `spec.md`
3. 是否已有 `test-cases.md`
4. 当前需求是仅修改治理文档，还是会影响 `apps/`、`packages/` 中的权限、路由、API 或部署
5. 当前工作区是否为 Git 仓库，以及分支是否符合 Git 合并规范

若缺少 feature 文档，请基于 `docs/features/_template/` 新建一个目录后再开始开发。

## 标准命令

```bash
./harness/bootstrap.sh
./harness/branch-guard.sh local
./harness/verify.sh
./harness/review.sh docs/features/<feature-id>
./harness/release.sh docs/features/<feature-id>
./harness/deploy.sh staging
```

## 默认原则

- 先确认当前工作区里真实存在什么，再写文档或脚本
- 当前仓库优先复用现有应用结构、治理文档、feature 模板和 `harness/` 入口
- 若引用其他仓库的文件，必须显式标注那是外部依赖，不要假装它们在本仓
- 先让验证路径可执行，再宣称功能完成
- 所有部署动作必须可由脚本重放，不能依赖个人记忆
