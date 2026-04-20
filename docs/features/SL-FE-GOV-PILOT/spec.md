# SL-FE-GOV-PILOT Spec

## 基本信息

- Feature ID: `SL-FE-GOV-PILOT`
- Feature 名称: 前端治理工作流试点
- 负责人: Codex
- 目标上线环境: frontend repo governance baseline

## 背景

当前仓库中的治理文档和 feature 示例来自其他项目副本，仍保留了大量对 `src/`、`package.json`、CI workflow 与 Docker 文件的默认假设。新 agent 进入后会被误导去寻找并不存在的业务代码与构建入口，导致流程无法执行。

## 范围

### In Scope

- 建立统一 AI 入口文档与项目地图
- 建立 feature 文档模板与真实示例
- 建立 `harness/` 统一命令入口
- 让 `AGENTS.md`、`CLAUDE.md`、`docs/ai/*` 与 `harness/` 的描述和当前仓库一致
- 让 `./harness/verify.sh`、`./harness/review.sh`、`./harness/release.sh`、`./harness/deploy.sh` 在当前仓库内可执行

### Out of Scope

- 修改配套前端应用仓的真实业务页面
- 引入新的测试框架
- 构建完整 CI/CD 或 Docker 发布链路

## 交互与页面影响

- 受影响页面: 无，当前仓库不包含业务页面
- 新增页面: 无
- 路由变化: 无
- 菜单变化: 无

## 数据与接口影响

- 受影响 API: 无
- 请求/响应变化: 无
- 环境变量变化: 无

## 权限影响

- 受影响角色: 全部角色，因治理文档会约束未来权限相关改动流程
- 新增/调整权限: 无

## 验收标准

1. 新 agent 可按 `AGENTS.md -> docs/ai -> docs/features` 的顺序快速完成上手。
2. `./harness/bootstrap.sh`、`./harness/verify.sh`、`./harness/review.sh`、`./harness/release.sh`、`./harness/deploy.sh` 可执行。
3. 文档不再把当前仓库描述成包含 `src/`、`package.json`、Docker/CI 文件的完整应用代码仓。
4. 任何仍指向配套前端应用仓的描述，都明确标注为外部依赖。
