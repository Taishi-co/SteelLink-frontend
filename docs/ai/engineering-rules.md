# Engineering Rules

## 开发原则

- 设计先于编码：没有 `spec.md` 与 `test-cases.md` 的需求，不应直接开始开发
- 小步提交：每次变更聚焦一个 feature 或一个子问题
- 影响可追溯：涉及权限、路由、API、部署或治理流程时，必须写入 feature 文档
- 统一入口：验证、评审、发布、部署统一走 `harness/`
- 分支规范：所有开发分支必须从最新 `main` 拉出，并通过 PR 合入 `main`

## 文档与脚本约束

- 当前仓库包含真实前端应用；修改 `apps/` 或 `packages/` 时必须同步 feature 文档并执行应用级验证
- 权限改动必须同步核对 `docs/domain/role-permission-matrix.md`，并注明配套前端应用仓中的落点文件
- 新增脚本、配置、流程变更时优先更新文档再改脚本
- 修改真实应用工程时，补充对应 `pnpm --filter <app> build`、lint 或测试验证

## 命令约束

本地开发与 CI 均以如下入口为准：

```bash
./harness/bootstrap.sh
./harness/branch-guard.sh local
./harness/verify.sh
./harness/review.sh docs/features/<feature-id>
./harness/release.sh docs/features/<feature-id>
./harness/deploy.sh <staging|prod>
```

## 通过标准

默认最低通过标准：

1. `./harness/verify.sh`
2. feature 文档四件套完整
3. 变更说明覆盖影响范围、外部依赖与回滚关注点
4. 若当前工作区存在 `package.json`，补充对应 pnpm workspace 的 lint/build 验证
5. 分支名、PR base branch 与 merge 方式符合 `docs/ai/git-workflow.md`

## 禁止事项

- 禁止跳过 `verify` 直接发起 review
- 禁止直接向 `main` push 业务改动
- 禁止只在对话中描述测试结果而不运行命令
- 禁止手工拼装与 CI 不一致的部署步骤
- 禁止把上线前检查放在个人记忆里
