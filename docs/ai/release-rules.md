# Release Rules

## 目标

确保“准备上线”和“部署执行”是标准化、可复现、可回滚的同一套流程。

## 准备上线阶段必须完成

1. 执行 `./harness/release.sh docs/features/<feature-id>`
2. 完成 `release-checklist.md`
3. 确认是否依赖配套前端应用仓、CI/CD 或环境变量变更
4. 明确 smoke test 范围与回滚点
5. 确认变更已通过 PR 合入 `main`，或在非 Git 快照场景中记录该依赖

## 部署原则

- staging 与 production 统一走 `./harness/deploy.sh`
- 不允许直接在服务器上手工拼装命令替代脚本
- 若当前仓库只包含治理文档，真实应用部署由配套前端应用仓或其 CI/CD 执行
- 部署命令应与 CI 中调用的命令保持一致

## 上线前最少检查项

- `./harness/release.sh` 可通过
- 变更影响范围与外部依赖已写入 `release-checklist.md`
- 若涉及应用工程，构建产物、环境变量来源和部署入口明确

## 上线后最少验证项

- 目标仓库的变更已按 checklist 执行验证
- 当前治理仓的入口文档与脚本可被下一个执行者复用
- 若涉及应用工程，补充首页、关键路由、静态资源和 API 读数验证

## 回滚要求

任何涉及构建、容器、CI、环境变量或跨仓协作的改动，必须在 `release-checklist.md` 中标明：

- 回滚目标版本
- 回滚操作步骤
- 回滚后验证项
