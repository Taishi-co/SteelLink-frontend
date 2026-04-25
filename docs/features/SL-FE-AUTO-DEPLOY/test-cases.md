# Test Cases

## 测试范围

- Feature ID: SL-FE-AUTO-DEPLOY
- 测试负责人: AI agent

## Happy Path

| 编号 | 场景 | 前置条件 | 步骤 | 期望结果 |
| --- | --- | --- | --- | --- |
| TC-01 | PR 合并触发生产部署 | PR 通过 review 后合并到 `main`，GitHub Secrets 已配置 | 观察 GitHub Actions `Deploy Production` workflow | workflow 通过 SSH 登录生产服务器并执行 `./deploy_frontend.sh` 或 `PROD_DEPLOY_COMMAND` 指定命令 |
| TC-02 | 手动触发生产部署 | GitHub Secrets 已配置 | 在 Actions 页面手动运行 workflow | workflow 执行同一套 SSH 部署逻辑 |

## Exception Path

| 编号 | 场景 | 前置条件 | 步骤 | 期望结果 |
| --- | --- | --- | --- | --- |
| TC-EX-01 | 缺少服务器认证信息 | `PROD_SSH_KEY` 与 `PROD_PASSWORD` 均未配置 | 运行 workflow | workflow 在 SSH 连接阶段失败，不执行部署脚本 |
| TC-EX-02 | 服务器部署脚本失败 | 远程部署命令返回非 0 | 运行 workflow | workflow 失败，GitHub Actions 日志保留失败阶段 |

## 权限测试

| 编号 | 角色 | 场景 | 期望结果 |
| --- | --- | --- | --- |
| TC-AUTH-01 | GitHub 仓库维护者 | 配置 production environment 与 Actions Secrets | 可保存生产部署所需 Secrets |

## 回归关注点

- 买家端、卖家端页面逻辑未变更。
- 前端部署脚本应在服务器侧完成依赖安装、构建和静态资源发布。
- 如服务器脚本路径或工作目录不同，必须通过 `PROD_DEPLOY_COMMAND` 覆盖。
