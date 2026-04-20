# SL-FE-PERF-CI-AUTO Implementation Plan

## Feature 信息

- Feature ID: `SL-FE-PERF-CI-AUTO`
- 开发负责人: Codex

## 变更范围

- 代码文件: 无
- 文档文件: 当前 feature 文档目录
- 配置文件: 无
- 脚本文件: `harness/resolve-feature-dir.sh`、`harness/review.sh`、`harness/release.sh`

## 实施步骤

1. 新增 feature 目录自动解析脚本，支持 env、PR body 和默认目录三种来源。
2. 将 review / release 脚本接入自动解析逻辑。
3. 在 feature 文档中补齐脚本行为说明、测试用例和回滚关注点。
4. 为未来 CI 接入保留兼容的 PR body 解析路径。

## 验证计划

- `./harness/resolve-feature-dir.sh`
- `FEATURE_ID=SL-FE-PERF-CI-AUTO ./harness/review.sh`
- `FEATURE_ID=SL-FE-PERF-CI-AUTO ./harness/release.sh`

## 风险与回滚关注点

- PR 模板字段若后续更名，需要同步更新解析脚本
