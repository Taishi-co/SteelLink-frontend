# Release Checklist

## 发布基本信息

- Feature ID: SL-FE-BUYER-DEPLOY-BUILD
- 发布负责人: Codex
- 目标环境: production

## 发布前检查

- [x] `./harness/release.sh docs/features/SL-FE-BUYER-DEPLOY-BUILD` 已通过
- [x] `./harness/verify.sh` 已通过
- [x] `pnpm --filter @steellink/buyer-app build` 已通过
- [x] 已确认无环境变量、CI 或跨仓依赖变化
- [x] 已确认 smoke test 范围: buyer-app 采购清单页、企业入驻介绍页、Docker 构建 buyer-app 阶段
- [ ] Docker 镜像构建已在可用 Docker daemon 的环境重跑。本地执行 `docker build -t steellink-frontend:buyer-deploy-build-fix .` 时 Docker daemon 未启动，需在 CI 或服务器环境复验。

## 回滚信息

- 回滚目标版本: 上一个 production 可部署版本
- 回滚步骤: 回滚本次 PR 或重新部署上一镜像版本
- 回滚后验证: 重新执行 buyer-app build，并检查采购清单页可正常进入

## 发布后验证

- [ ] buyer-app Docker 构建通过 `pnpm --filter @steellink/buyer-app build`
- [ ] 采购清单页总价、总重量和结算按钮状态正常
- [ ] 企业入驻介绍页可正常渲染
