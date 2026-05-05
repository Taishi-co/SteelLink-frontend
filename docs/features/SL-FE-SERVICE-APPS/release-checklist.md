# Release Checklist

## 发布基本信息

- Feature ID: SL-FE-SERVICE-APPS
- 发布负责人: Codex
- 目标环境: 前端预览环境

## 发布前检查

- [x] `./harness/release.sh docs/features/SL-FE-SERVICE-APPS` 已通过
- [x] `./harness/verify.sh` 已通过
- [x] buyer-app、logistics-app、warehouse-app、finance-app build 已通过
- [ ] 已确认生产部署是否要纳入新应用
- [x] 已确认 smoke test 范围
- [ ] GitHub PR 创建后，已执行 `./harness/lark-pr-doc.sh docs/features/SL-FE-SERVICE-APPS --pr-url <github-pr-url> --pr-title "<pr-title>"` 并写入共享飞书 PR 记录

## 回滚信息

- 回滚目标版本: 合并前版本
- 回滚步骤: 回滚新增应用目录、买家端服务市场入口和根 scripts
- 回滚后验证: `pnpm --filter @steellink/buyer-app build`

## 发布后验证

- [ ] 买家端 `/service-market` 可访问
- [ ] 物流后台 `/logistics` 可访问
- [ ] 仓储后台 `/warehouse` 可访问
- [ ] 资金服务后台 `/finance` 可访问
