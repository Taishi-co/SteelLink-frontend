# Implementation Plan

## Feature 信息

- Feature ID: SL-FE-WEB-APPS-NGINX
- 开发负责人: Codex

## 变更范围

- 代码文件: 无
- 文档文件: `docs/features/SL-FE-WEB-APPS-NGINX/*`、`docs/ai/entrypoint.md`、`docs/ai/project-map.md`
- 配置文件: `Dockerfile`、`docker/nginx.conf`
- 脚本文件: 无

## 实施步骤

1. 修正 Dockerfile 中 pnpm install 的参数写法。
2. 在 Docker build stage 纳入 `logistics-app`、`warehouse-app`、`finance-app` 的 package/source copy 与 build 命令。
3. 在生产镜像中复制三个新增应用的 dist 到 `/usr/share/nginx/html/<app>`。
4. 在 nginx 模板中新增 `/logistics`、`/warehouse`、`/finance` 的 SPA fallback。
5. 同步 AI 入口文档中的应用拓扑。
6. 执行 harness 与新增应用 build 验证。

## 验证计划

- `./harness/verify.sh`
- `./harness/review.sh docs/features/SL-FE-WEB-APPS-NGINX`
- `./harness/release.sh docs/features/SL-FE-WEB-APPS-NGINX`
- `pnpm --filter @steellink/logistics-app build`
- `pnpm --filter @steellink/warehouse-app build`
- `pnpm --filter @steellink/finance-app build`
- 需要的人工验证: 部署后访问 `/logistics`、`/warehouse`、`/finance` 并刷新页面。

## 风险与回滚关注点

- 镜像构建时间会增加，因为生产镜像现在构建 5 个应用。
- 如任一服务商应用构建失败，会阻断生产镜像构建；回滚方式是恢复 Dockerfile 与 nginx 模板到上一版本。
