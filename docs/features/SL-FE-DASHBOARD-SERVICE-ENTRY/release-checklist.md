# SL-FE-DASHBOARD-SERVICE-ENTRY Release Checklist

## 发布基本信息

- Feature ID: SL-FE-DASHBOARD-SERVICE-ENTRY
- 发布负责人: Codex
- 目标环境: buyer-app production

## 发布前检查

- [ ] `./harness/release.sh docs/features/SL-FE-DASHBOARD-SERVICE-ENTRY` 已通过
- [ ] `./harness/verify.sh` 已通过
- [ ] `pnpm --filter @steellink/buyer-app lint` 已通过
- [ ] `pnpm --filter @steellink/buyer-app build` 已通过
- [ ] 已确认无新增环境变量、CI 或跨仓依赖
- [ ] 已确认 smoke test 范围: `/dashboard`、`/dashboard/logistics`、`/dashboard/warehouse`、`/dashboard/services/logistics`、`/dashboard/services/warehouse`
- [ ] GitHub PR 创建后，已执行 `./harness/lark-pr-doc.sh docs/features/SL-FE-DASHBOARD-SERVICE-ENTRY --pr-url <github-pr-url> --pr-title "<pr-title>"` 并写入共享飞书 PR 记录

## 回滚信息

- 回滚目标版本: PR 合入前版本
- 回滚步骤: revert 本 feature PR
- 回滚后验证: 访问 `/dashboard` 确认新增物流/仓储管理中心入口消失，原有入口仍可用

## 发布后验证

- [ ] 已开通物流能力账户可看到“进入物流管理中心”
- [ ] 已开通仓储能力账户可看到“进入仓储管理中心”
- [ ] 未开通对应能力账户不展示对应入口
