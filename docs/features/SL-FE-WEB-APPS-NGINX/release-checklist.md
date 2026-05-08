# Release Checklist

## 发布基本信息

- Feature ID: SL-FE-WEB-APPS-NGINX
- 发布负责人: Codex
- 目标环境: production

## 发布前检查

- [x] `./harness/release.sh docs/features/SL-FE-WEB-APPS-NGINX` 已通过
- [x] `./harness/verify.sh` 已通过
- [x] 新增服务商应用 build 已通过
- [x] 已确认环境变量、CI 或跨仓依赖: 继续使用 `API_UPSTREAM`
- [x] 已确认 smoke test 范围: `/logistics`、`/warehouse`、`/finance`、`/seller`、`/api`
- [ ] GitHub PR 创建后，已执行 `./harness/lark-pr-doc.sh docs/features/SL-FE-WEB-APPS-NGINX --pr-url <github-pr-url> --pr-title "<pr-title>"` 并写入共享飞书 PR 记录

## 回滚信息

- 回滚目标版本: 合并前的生产前端镜像配置
- 回滚步骤: 回滚本 PR 中 `Dockerfile`、`docker/nginx.conf` 与文档变更后重新构建发布
- 回滚后验证: 访问 `/`、`/seller`、`/api`，确认原有入口恢复

## 发布后验证

- [ ] 入口文档与脚本输出一致
- [ ] 访问 `/logistics`、`/warehouse`、`/finance` 并刷新页面，确认返回对应应用
