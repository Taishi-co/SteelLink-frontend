# AGENTS.md

本文件为 Codex、Claude Code 以及新接入 agent 在 `SteelLink-frontend` 中工作的统一入口。
当前仓库是 SteelLink 主服务前端应用仓，包含买家端、卖家端、共享包、治理文档与 `harness/`。真实业务代码位于 `apps/` 与 `packages/`。

## 1. 启动协议

进入仓库后按以下顺序建立上下文：

1. 阅读 `AGENTS.md`
2. 阅读 `docs/ai/entrypoint.md`
3. 阅读 `docs/ai/project-map.md`
4. 阅读 `docs/ai/engineering-rules.md`
5. 阅读 `docs/ai/git-workflow.md`
6. 如处理具体需求，再阅读对应 `docs/features/<feature-id>/`

如果以上文档与当前工作区不一致，应先更新文档或在结果中明确指出差异，不要自行假设。
若文档描述与 `apps/`、`packages/` 中的实际工程不一致，应以当前代码为准并同步修正文档。

## 2. 标准工作流

所有变更必须按以下阶段推进：

1. 设计阶段：先补齐 `spec.md` 与 `test-cases.md`
2. 开发阶段：按 `implementation-plan.md` 实施
3. Review 阶段：执行 `./harness/review.sh`
4. 准备上线阶段：执行 `./harness/release.sh`
5. 部署阶段：统一通过 `./harness/deploy.sh <staging|prod>`

禁止跳过设计产物直接编码，禁止在未执行 `verify` 的情况下宣称“已完成测试”。
禁止直接在 `main` 上开发或绕过 PR 合并。

## 3. 必用命令入口

不要直接拼接零散命令，优先使用以下入口：

- `./harness/bootstrap.sh`
- `./harness/branch-guard.sh local`
- `./harness/verify.sh`
- `./harness/review.sh docs/features/<feature-id>`
- `./harness/release.sh docs/features/<feature-id>`
- `./harness/lark-pr-doc.sh docs/features/<feature-id> --pr-url <github-pr-url> --pr-title "<pr-title>"`
- `./harness/deploy.sh staging`
- `./harness/deploy.sh prod`

## 4. 质量底线

- 必须通过 `./harness/verify.sh`
- 若当前工作区存在 `package.json`，还必须通过 `npm run lint` 与 `npm run build`
- 涉及权限逻辑时，必须核对配套前端应用仓的 `src/config/permissions.ts` 与 `docs/domain/role-permission-matrix.md`
- 涉及路由、角色菜单、API 契约的改动，必须在 feature 文档中写明影响范围，并注明实际改动所在仓库
- 不要修改与当前任务无关的文档、脚本或业务页面
- 当前目录若不是 Git worktree，必须在结果中明确说明，不能伪造分支、PR、CI 结论
- 分支命名规范仍为 `feat|fix|docs|chore|refactor|test|hotfix/<feature-id>-<slug>`，并在实际 Git 仓库中执行
- 提交 GitHub PR 后必须用 `./harness/lark-pr-doc.sh` 基于 feature PRD 产物创建飞书文档，并把链接写入共享 PR 记录的 `Frontend` 段落

## 5. 输出要求

提交结果时至少说明：

- 当前对应的 feature 文档路径
- 飞书 PRD/PR 记录文档链接，或说明为什么未能写入共享 PR 记录
- 已执行的 harness 命令
- 是否完成 `./harness/verify.sh`
- 是否完成 lint/build 验证，或说明因当前仓库不含应用工程而跳过
- 是否存在遗留风险、人工验证点或部署前依赖
