# Release Checklist

- [ ] `/products` 商品列表卡片不展示捆包号。
- [ ] `/products/:id` 商品详情页仓储信息不展示捆包号。
- [ ] `Product.bundleNo` 类型和接口映射仍保留，避免影响购物车、订单或履约链路。
- [ ] `pnpm --filter @steellink/buyer-app build` 通过。
