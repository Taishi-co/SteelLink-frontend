# Seller Warehouse Binding Frontend Implementation Plan

## Feature 信息

- Feature ID: SL-FE-SELLER-WAREHOUSE-BINDING
- 开发负责人: Codex

## 变更范围

- 代码文件:
  - `apps/seller-app/src/pages/Warehouses/index.tsx`
  - `apps/seller-app/src/pages/Products/index.tsx`
  - `apps/seller-app/src/services/serviceOfferService.ts`
  - `apps/seller-app/src/router/index.tsx`
  - `apps/seller-app/src/components/Layout/SellerLayout.tsx`
- 文档文件: `docs/features/SL-FE-SELLER-WAREHOUSE-BINDING/*`
- 配置文件: 无
- 脚本文件: 无

## 实施步骤

1. 扩展 seller-app 仓库服务封装，支持自有仓库 CRUD。
2. 新增卖家“仓库管理”页面和路由菜单。
3. 商品发布页合并公共已审核仓库和卖家自有仓库，并阻止选择未审核仓库。
4. 选择已审核仓库时自动写入 `warehouseServiceId` 和仓库快照字段。
5. 执行 seller-app lint/build 和 harness gate。

## 验证计划

- `./harness/verify.sh`
- `./harness/review.sh docs/features/SL-FE-SELLER-WAREHOUSE-BINDING`
- `./harness/release.sh docs/features/SL-FE-SELLER-WAREHOUSE-BINDING`
- `pnpm --filter @steellink/seller-app lint`
- `pnpm --filter @steellink/seller-app build`
- 需要的人工验证: 登录卖家端创建仓库，待审核通过后在商品发布页选择该仓库并提交商品审核。

## 风险与回滚关注点

- 依赖后端允许销售企业访问仓库资源自有 CRUD。
- 未审核仓库仅展示不可选；如需回滚，移除 `/warehouses` 路由和商品页自有仓库合并逻辑。
