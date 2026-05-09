# Implementation Plan

## 步骤

1. 定位买家端 `/products` 商品列表中捆包号渲染位置并移除展示文案。
2. 定位买家端 `/products/:id` 商品详情中捆包号渲染位置并移除描述项。
3. 执行买家端构建或仓库 harness 验证，确认前端代码仍可编译。

## 风险控制

- 保留 `Product.bundleNo` 类型和 `productService` 映射，避免影响购物车、订单或后续履约链路。
- 仅移除买家商城展示，不触碰卖家端商品发布/管理字段。
