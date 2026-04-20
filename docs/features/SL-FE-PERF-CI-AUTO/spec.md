# SL-FE-PERF-CI-AUTO Spec

## 基本信息

- Feature ID: `SL-FE-PERF-CI-AUTO`
- Feature 名称: feature 文档目录自动识别与 gate 收口
- 负责人: Codex
- 目标上线环境: frontend performance and workflow baseline

## 背景

当前治理仓中的 `review.sh` / `release.sh` 需要依赖 feature 文档目录，但调用方不一定总会显式传参。为减少脚本入口摩擦，需要支持从环境变量、PR 描述或默认值中自动识别 feature 目录，并让 gate 脚本统一复用。

## 范围

### In Scope

- 新增 `harness/resolve-feature-dir.sh`
- 让 `review.sh`、`release.sh` 在未传参时自动解析 feature 目录
- 为未来 CI 接入保留从 PR 模板内容、环境变量或默认值中解析 feature 目录的能力

### Out of Scope

- 修改业务路由结构
- 调整部署架构
- 优化应用构建产物体积

## 交互与页面影响

- 受影响页面: 无
- 新增页面: 无
- 路由变化: 无
- 菜单变化: 无

## 数据与接口影响

- 受影响 API: 无
- 请求/响应变化: 无
- 环境变量变化: 可选支持 `FEATURE_DIR` 或 `FEATURE_ID`

## 权限影响

- 受影响角色: 无直接权限变化
- 新增/调整权限: 无

## 验收标准

1. `./harness/resolve-feature-dir.sh` 可基于 env、PR body 或默认值解析 feature 目录。
2. `./harness/resolve-feature-dir.sh` 可在本地与 CI 中返回有效 feature 目录。
3. `./harness/review.sh` 和 `./harness/release.sh` 在未显式传参时也可工作。
4. 脚本行为与 feature 示例、模板和规则文档保持一致。
