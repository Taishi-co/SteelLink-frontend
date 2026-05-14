# Route Lazy Layout Release Checklist

## 发布基本信息

- Feature ID: SL-FE-ROUTE-LAZY-LAYOUT
- 发布负责人: Codex
- 目标环境: Frontend production

## 发布前检查

- [x] `./harness/release.sh docs/features/SL-FE-ROUTE-LAZY-LAYOUT` 已通过
- [x] `./harness/verify.sh` 已通过
- [x] `pnpm --filter @steellink/buyer-app build` 已通过
- [x] `pnpm --filter @steellink/seller-app build` 已通过
- [x] 已确认环境变量、CI 或跨仓依赖: 本次无环境变量、CI 或跨仓依赖变化
- [x] 已确认 smoke test 范围: buyer-app 与 seller-app 的后台页面切换
- [x] GitHub PR 创建后，已执行 `./harness/lark-pr-doc.sh docs/features/SL-FE-ROUTE-LAZY-LAYOUT --pr-url https://github.com/Taishi-co/SteelLink-frontend/pull/92 --pr-title "[codex] fix route lazy layout fallback"` 并写入共享飞书 PR 记录
- [x] 飞书 PR 文档: https://www.feishu.cn/wiki/CuWzwGARji8uDPk8JdycAqGInFf

## 回滚信息

- 回滚目标版本: 本 feature 合入前版本
- 回滚步骤: 回滚 router 中的 `lazyPage` helper 与页面级 `Suspense` 包裹
- 回滚后验证: 重新执行 buyer-app 与 seller-app build

## 发布后验证

- [ ] 买家后台侧边栏在页面切换时保持显示
- [ ] 卖家后台侧边栏和顶部栏在页面切换时保持显示
- [ ] 首页与商城布局导航仍正常
