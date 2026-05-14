# Product Taxonomy Structure Release Checklist

## 发布基本信息

- Feature ID: SL-FE-PRODUCT-TAXONOMY-STRUCTURE
- 发布负责人: Codex
- 目标环境: seller-app

## 发布前检查

- [ ] `./harness/release.sh docs/features/SL-FE-PRODUCT-TAXONOMY-STRUCTURE` 已通过
- [ ] `./harness/verify.sh` 已通过
- [ ] `pnpm --filter @steellink/seller-app build` 已通过
- [ ] 已确认配置与环境变量变更
- [ ] 已确认 API 契约与 backend 对齐
- [ ] 已确认 smoke test 范围
- [ ] GitHub PR 创建后，已执行 `./harness/lark-pr-doc.sh docs/features/SL-FE-PRODUCT-TAXONOMY-STRUCTURE --pr-url <github-pr-url> --pr-title "<pr-title>"` 并写入共享飞书 PR 记录

## 回滚信息

- 回滚目标版本: 上一版 frontend 镜像
- 回滚步骤: 回滚 seller-app 前端代码。
- 回滚后验证: 卖家商品列表、发布商品、编辑商品可正常使用。
