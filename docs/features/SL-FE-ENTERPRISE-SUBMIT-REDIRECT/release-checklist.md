# 企业认证提交后返回个人工作台发布检查

## 发布基本信息

- Feature ID: SL-FE-ENTERPRISE-SUBMIT-REDIRECT
- 发布负责人: Codex
- 目标环境: buyer-app 生产环境

## 发布前检查

- [ ] `./harness/release.sh docs/features/SL-FE-ENTERPRISE-SUBMIT-REDIRECT` 已通过
- [ ] `./harness/verify.sh` 已通过
- [ ] `pnpm --filter @steellink/buyer-app build` 已通过
- [ ] 已确认无环境变量、CI 或跨仓依赖变化
- [ ] 已确认 smoke test 范围: `/dashboard/enterprise` 提交成功、失败留页、返回 `/dashboard`
- [ ] GitHub PR 创建后，已执行 `./harness/lark-pr-doc.sh docs/features/SL-FE-ENTERPRISE-SUBMIT-REDIRECT --pr-url <github-pr-url> --pr-title "<pr-title>"` 并写入共享飞书 PR 记录

## 回滚信息

- 回滚目标版本: 上一版 buyer-app 前端镜像或提交
- 回滚步骤: 回退 `apps/buyer-app/src/pages/Enterprise/index.tsx` 中成功后的跳转逻辑并重新构建发布
- 回滚后验证: 企业认证提交成功后不自动返回个人工作台，失败提示仍正常

## 发布后验证

- [ ] `/dashboard/enterprise` 提交企业认证成功后显示成功提示
- [ ] 成功后浏览器地址回到 `/dashboard`
- [ ] 提交失败时仍停留在认证页
