# Release Checklist

## 发布基本信息

- Feature ID: SL-FE-CROSS-APP-MANUAL-AUTH
- 发布负责人: Codex
- 目标环境: Web 前端

## 发布前检查

- [ ] `./harness/release.sh docs/features/SL-FE-CROSS-APP-MANUAL-AUTH` 已通过
- [ ] `./harness/verify.sh` 已通过
- [ ] `pnpm --filter @steellink/seller-app build` 已通过
- [ ] `pnpm --filter @steellink/buyer-app build` 已通过
- [ ] 已确认环境变量、CI 或跨仓依赖
- [ ] 已确认 smoke test 范围
- [ ] GitHub PR 创建后，已执行 `./harness/lark-pr-doc.sh docs/features/SL-FE-CROSS-APP-MANUAL-AUTH --pr-url <github-pr-url> --pr-title "<pr-title>"` 并写入共享飞书 PR 记录

## 回滚信息

- 回滚目标版本: 本 feature 合入前的前端版本。
- 回滚步骤: 回滚本 feature 对买家端和卖家端 auth 存储键的修改并重新发布前端。
- 回滚后验证: 卖家端登录、买家端登录、卖家中心“买家首页”入口。

## 发布后验证

- [ ] 卖家登录后点击“买家首页”不自动展示买家登录态
- [ ] 买家登录后访问卖家中心仍需卖家端登录
- [ ] 买家端和卖家端受保护页面可正常调用 API
