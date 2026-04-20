# SL-FE-GOV-PILOT Test Cases

## 测试范围

- Feature ID: `SL-FE-GOV-PILOT`
- 测试负责人: Codex

## Happy Path

| 编号 | 场景 | 前置条件 | 步骤 | 期望结果 |
| --- | --- | --- | --- | --- |
| TC-01 | 新 agent 上手 | 仓库已拉取 | 阅读 `AGENTS.md` 与 `docs/ai/entrypoint.md` | 能明确阅读顺序、命令入口、feature 文档要求 |
| TC-02 | 验证工作流 | 仓库结构完整 | 执行 `./harness/verify.sh` | 完成文档存在性检查、harness 脚本语法检查，并根据仓库内容决定是否跳过应用级 lint/build |
| TC-03 | Review gate | 真实 feature 文档存在 | 执行 `./harness/review.sh docs/features/SL-FE-GOV-PILOT` | 文档齐全且验证通过，review gate 通过 |
| TC-04 | Release gate | release 文档完整 | 执行 `./harness/release.sh docs/features/SL-FE-GOV-PILOT` | release gate 通过，并说明当前仓库的上线依赖与交接边界 |
| TC-05 | Deploy gate | 当前为本地或 CI 环境 | 执行 `./harness/deploy.sh staging` | 默认 dry-run，输出治理仓交接说明，不要求本地存在 Docker/Nginx 文件 |

## Exception Path

| 编号 | 场景 | 前置条件 | 步骤 | 期望结果 |
| --- | --- | --- | --- | --- |
| TC-EX-01 | 缺失 feature 目录参数 | 默认 feature 目录存在 | 执行 `./harness/review.sh` | 自动解析到默认 feature 目录并继续执行 |
| TC-EX-02 | 缺少 release 产物 | 临时删除任一 checklist 文件 | 执行 `./harness/release.sh <feature-dir>` | 返回缺失文件提示并退出失败 |
| TC-EX-03 | 非法部署环境 | 无 | 执行 `./harness/deploy.sh qa` | 返回 usage 并退出失败 |

## 权限测试

| 编号 | 角色 | 场景 | 期望结果 |
| --- | --- | --- | --- |
| TC-AUTH-01 | 任意开发角色 | 修改权限相关页面 | 必须同时核对配套前端应用仓的 `src/config/permissions.ts` 与 `docs/domain/role-permission-matrix.md` |

## 回归关注点

- 当前仓库文档不能再误导 agent 去查找不存在的业务页面
- `harness/` 入口与文档描述保持一致
- 若后续接入真实应用仓，需补充应用级构建与权限回归
