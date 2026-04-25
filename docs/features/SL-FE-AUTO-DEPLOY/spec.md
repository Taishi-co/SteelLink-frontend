# Feature Spec

## 基本信息

- Feature ID: SL-FE-AUTO-DEPLOY
- Feature 名称: main 分支合并后自动部署主服务前端
- 负责人: AI agent
- 目标上线环境: production

## 背景

SteelLink-admin 已通过 GitHub Actions 在 PR 合并到 `main` 后触发生产部署。主服务前端仓库需要采用同类流程，让买家端、卖家端与共享前端包的生产部署在合并后由 GitHub Actions 统一触发，并由服务器侧部署脚本负责拉取代码、构建和发布静态资源。

## 范围

### In Scope

- 新增 `.github/workflows/deploy-prod.yml`。
- workflow 在 `main` 分支 push 后自动运行，并支持 `workflow_dispatch` 手动触发。
- workflow 通过 SSH 登录生产服务器，执行前端部署命令。
- 部署命令默认使用 `./deploy_frontend.sh`，可通过 GitHub Actions Secret `PROD_DEPLOY_COMMAND` 覆盖。
- 补齐本 feature 的 spec、test cases、implementation plan 与 release checklist。

### Out of Scope

- 不新增或修改服务器上的部署脚本。
- 不改变买家端、卖家端、共享包业务代码或页面路由。
- 不在 GitHub Actions 内重复实现服务器部署脚本中的依赖安装、构建或静态资源发布逻辑。

## 交互与页面影响

- 受影响页面: 无。
- 新增页面: 无。
- 路由变化: 无。
- 菜单变化: 无。

## 数据与接口影响

- 受影响 API: 无。
- 请求/响应变化: 无。
- 环境变量变化: 需要在 GitHub Actions Secrets 中配置 `PROD_HOST`、`PROD_USER`，并配置 `PROD_SSH_KEY` 或 `PROD_PASSWORD` 其中之一；如服务器脚本不是 `./deploy_frontend.sh`，需配置 `PROD_DEPLOY_COMMAND`。

## 权限影响

- 受影响角色: 无业务角色影响。
- 新增/调整权限: 需要 GitHub 仓库 production environment 或 Actions Secrets 的维护权限。

## 验收标准

1. `.github/workflows/deploy-prod.yml` 存在，并仅在 `main` 分支 push 或手动触发时运行生产部署。
2. workflow 使用 `appleboy/ssh-action@v1.2.0` 通过 GitHub Secrets 登录生产服务器。
3. workflow 默认执行 `./deploy_frontend.sh`，并允许通过 `PROD_DEPLOY_COMMAND` 覆盖。
4. `./harness/review.sh docs/features/SL-FE-AUTO-DEPLOY` 通过。
5. `./harness/release.sh docs/features/SL-FE-AUTO-DEPLOY` 通过。
