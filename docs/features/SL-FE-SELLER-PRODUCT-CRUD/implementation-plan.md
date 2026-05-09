# Implementation Plan

## Feature 信息

- Feature ID: SL-FE-SELLER-PRODUCT-CRUD
- 开发负责人: Codex

## 变更范围

- 代码文件:
  - `apps/seller-app/src/pages/Products/index.tsx`
  - `apps/seller-app/src/services/productService.ts`
  - `SteelLink-backend/internal/modules/product/**`
- 文档文件:
  - `docs/features/SL-FE-SELLER-PRODUCT-CRUD/*`
- 配置文件: 无
- 脚本文件: 无

## 实施步骤

1. 后端补卖家商品编辑和删除接口，校验企业归属。
2. 前端商品服务增加 update/remove 封装。
3. 商品管理列表增加缩略图，详情抽屉增加完整资料展示。
4. 发布弹窗复用为编辑弹窗，删除操作增加二次确认。

## 验证计划

- `pnpm --filter @steellink/seller-app build`
- `go test ./internal/modules/product/...`
- 需要的人工验证: 登录卖家后台走查 `/seller/products` 创建、编辑、查看、删除。

## 风险与回滚关注点

- 删除接口为软删除，回滚时需要恢复后端路由和前端删除入口。
- 编辑商品会重新进入待审核，可能影响已上架商品的即时可见性。
