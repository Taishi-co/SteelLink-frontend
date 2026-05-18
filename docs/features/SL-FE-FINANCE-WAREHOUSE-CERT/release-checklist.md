# SL-FE-FINANCE-WAREHOUSE-CERT Release Checklist

## 发布基本信息

- Feature ID: SL-FE-FINANCE-WAREHOUSE-CERT
- 发布负责人: Codex
- 目标环境: staging

## 发布前检查

- [ ] `./harness/release.sh docs/features/SL-FE-FINANCE-WAREHOUSE-CERT` 已通过
- [ ] `./harness/verify.sh` 已通过
- [ ] `pnpm --filter @steellink/finance-app build` 已通过
- [ ] GitHub PR 创建后已执行飞书 PRD/PR 记录同步

## 回滚信息

- 回滚目标版本: 上一稳定版本
- 回滚步骤: 回滚本 feature 前端变更。
- 回滚后验证: finance-app 金融产品管理仍可访问。
