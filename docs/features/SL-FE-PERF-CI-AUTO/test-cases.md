# SL-FE-PERF-CI-AUTO Test Cases

## 测试范围

- Feature ID: `SL-FE-PERF-CI-AUTO`
- 测试负责人: Codex

## Happy Path

| 编号 | 场景 | 前置条件 | 步骤 | 期望结果 |
| --- | --- | --- | --- | --- |
| TC-01 | 自动解析 feature 目录 | 存在有效 feature 文档目录 | 执行 `./harness/resolve-feature-dir.sh` | 输出有效的 `docs/features/<feature-id>` 路径 |
| TC-02 | Review 自动解析 | 已设置 `FEATURE_ID` 或默认 feature 存在 | 执行 `./harness/review.sh` | 能自动解析 feature 目录并通过 review gate |
| TC-03 | Release 自动解析 | 同上 | 执行 `./harness/release.sh` | 能自动解析 feature 目录并通过 release gate |
| TC-04 | PR 描述驱动解析 | PR 描述包含 Feature 文档或 Feature ID | 在 CI 中运行解析脚本 | 能解析对应 feature 目录 |
| TC-05 | 默认值兜底 | 无 env、无 PR body，默认 feature 目录存在 | 执行 `./harness/resolve-feature-dir.sh` | 返回默认 feature 目录 |

## Exception Path

| 编号 | 场景 | 前置条件 | 步骤 | 期望结果 |
| --- | --- | --- | --- | --- |
| TC-EX-01 | `FEATURE_ID` 指向不存在目录 | 设置不存在的 `FEATURE_ID` | 执行 `./harness/resolve-feature-dir.sh` | 继续尝试 PR body 或默认目录 |
| TC-EX-02 | 全部来源都无效 | 无 env、无 PR body、默认目录不存在 | 执行解析脚本 | 返回错误并退出失败 |

## 权限测试

| 编号 | 角色 | 场景 | 期望结果 |
| --- | --- | --- | --- |
| TC-AUTH-01 | 任意开发角色 | 使用统一 review/release 流程 | 不需要额外权限即可从文档解析 feature 目录 |

## 回归关注点

- PR 模板字段名称与解析脚本保持一致
- `review.sh` / `release.sh` 与解析脚本的默认目录保持一致
- 未来接入 GitHub Actions 时无需改动解析核心逻辑
