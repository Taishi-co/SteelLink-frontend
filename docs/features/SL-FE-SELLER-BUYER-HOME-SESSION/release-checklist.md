# Release Checklist

## 发布基本信息

- Feature ID: SL-FE-SELLER-BUYER-HOME-SESSION
- 发布负责人: Codex
- 目标环境: Web 前端

## 发布前检查

- [ ] `./harness/release.sh docs/features/SL-FE-SELLER-BUYER-HOME-SESSION` 已通过
- [ ] `./harness/verify.sh` 已通过
- [ ] `pnpm --filter @steellink/seller-app build` 已通过
- [ ] 已确认环境变量、CI 或跨仓依赖
- [ ] 已确认 smoke test 范围
- [ ] GitHub PR 创建后，已执行 `./harness/lark-pr-doc.sh docs/features/SL-FE-SELLER-BUYER-HOME-SESSION --pr-url <github-pr-url> --pr-title "<pr-title>"` 并写入共享飞书 PR 记录

## 回滚信息

- 回滚目标版本: 当前变更前版本
- 回滚步骤: 回退 `apps/seller-app/src/services/auth.ts` 与 `apps/seller-app/src/services/api.ts` 对应变更
- 回滚后验证: 重新执行 seller-app build 并验证卖家端登录/退出

## 发布后验证

- [ ] 卖家中心点击“买家首页”后买家端仍保持登录态
- [ ] 卖家端退出登录仍清空完整会话
