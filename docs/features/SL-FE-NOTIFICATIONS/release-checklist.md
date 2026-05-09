# Release Checklist

## 发布基本信息

- Feature ID: SL-FE-NOTIFICATIONS
- 发布负责人: Codex
- 目标环境: staging / prod

## 发布前检查

- [x] `pnpm --filter @steellink/buyer-app build` 已通过
- [x] `pnpm --filter @steellink/seller-app build` 已通过
- [ ] `./harness/release.sh docs/features/SL-FE-NOTIFICATIONS` 已通过
- [ ] 已确认后端通知接口已发布

## 回滚信息

- 回滚目标版本: 合入前版本
- 回滚步骤: 回滚前端页面、路由和菜单入口
- 回滚后验证: 买家/卖家应用正常构建
