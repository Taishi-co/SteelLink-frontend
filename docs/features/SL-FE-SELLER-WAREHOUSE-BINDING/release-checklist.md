# Seller Warehouse Binding Frontend Release Checklist

## 发布基本信息

- Feature ID: SL-FE-SELLER-WAREHOUSE-BINDING
- 发布负责人: Codex
- 目标环境: seller-app production

## 发布前检查

- [ ] `./harness/release.sh docs/features/SL-FE-SELLER-WAREHOUSE-BINDING` 已通过
- [ ] `./harness/verify.sh` 已通过
- [ ] `pnpm --filter @steellink/seller-app lint` 已通过
- [ ] `pnpm --filter @steellink/seller-app build` 已通过
- [ ] 已确认环境变量、CI 或跨仓依赖
- [ ] 已确认 smoke test 范围
- [ ] GitHub PR 创建后，已执行 `./harness/lark-pr-doc.sh docs/features/SL-FE-SELLER-WAREHOUSE-BINDING --pr-url <github-pr-url> --pr-title "<pr-title>"` 并写入共享飞书 PR 记录

## 回滚信息

- 回滚目标版本: 合并前主干版本
- 回滚步骤: revert 本 feature PR
- 回滚后验证: 卖家商品发布页仍可手动填写仓库信息

## 发布后验证

- [ ] 卖家后台可进入“仓库管理”
- [ ] 卖家可新增、编辑、停用自有仓库
- [ ] 商品发布页可选择已审核仓库并自动回填仓库字段
- [ ] 未审核仓库不可绑定商品
