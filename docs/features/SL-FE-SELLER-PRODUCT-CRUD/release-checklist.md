# Release Checklist

## 发布基本信息

- Feature ID: SL-FE-SELLER-PRODUCT-CRUD
- 发布负责人: Codex
- 目标环境: seller-app 生产环境

## 发布前检查

- [ ] `./harness/release.sh docs/features/SL-FE-SELLER-PRODUCT-CRUD` 已通过
- [ ] `./harness/verify.sh` 已通过
- [ ] `pnpm --filter @steellink/seller-app build` 已通过
- [ ] `go test ./internal/modules/product/...` 已通过
- [ ] 已确认环境变量、CI 或跨仓依赖
- [ ] 已确认 smoke test 范围: `/seller/products` 列表、详情、创建、编辑、删除
- [ ] GitHub PR 创建后，已执行 `./harness/lark-pr-doc.sh docs/features/SL-FE-SELLER-PRODUCT-CRUD --pr-url <github-pr-url> --pr-title "<pr-title>"` 并写入共享飞书 PR 记录

## 回滚信息

- 回滚目标版本: 发布前版本
- 回滚步骤: 回滚前端商品页、商品服务封装和后端商品编辑/删除接口
- 回滚后验证: 卖家商品发布和补充展示资料仍可使用

## 发布后验证

- [ ] `/seller/products` 列表展示商品缩略图
- [ ] 商品详情抽屉展示商品图片和审核资料
- [ ] 卖家可创建、编辑、删除自有商品
