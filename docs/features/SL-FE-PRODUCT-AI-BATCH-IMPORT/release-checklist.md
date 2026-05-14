# Product AI Batch Import Release Checklist

## 发布基本信息

- Feature ID: SL-FE-PRODUCT-AI-BATCH-IMPORT
- 发布负责人: Codex
- 目标环境: seller-app

## 发布前检查

- [ ] `./harness/release.sh docs/features/SL-FE-PRODUCT-AI-BATCH-IMPORT` 已通过
- [ ] `pnpm --filter @steellink/seller-app build` 已通过
- [ ] 已确认 backend API 契约同步上线
- [ ] 已确认 smoke test 范围: `/seller/products` AI 批量导入入口、识别、确认添加
- [ ] GitHub PR 创建后，已执行 `./harness/lark-pr-doc.sh docs/features/SL-FE-PRODUCT-AI-BATCH-IMPORT --pr-url <github-pr-url> --pr-title "<pr-title>"` 并写入共享飞书 PR 记录

## 回滚信息

- 回滚目标版本: 上一版 frontend 镜像
- 回滚步骤: 回滚 seller-app 前端代码。
- 回滚后验证: `/seller/products` 商品管理页可正常发布、编辑商品。
