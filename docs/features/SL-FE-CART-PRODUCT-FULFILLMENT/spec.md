# SL-FE-CART-PRODUCT-FULFILLMENT

## 背景

买家访问 `/cart` 时，需要在采购清单中直接识别商品缩略图和可发货仓库，避免只看到商品名称后还要跳转详情页确认履约信息。

## 范围

- `apps/buyer-app/src/pages/Cart/index.tsx`
- `apps/buyer-app/src/services/cartService.ts`
- `apps/buyer-app/src/types/index.ts`

## 需求

1. 购物车商品信息列展示商品缩略图。
2. 购物车列表展示商品绑定的可发货仓库名称、仓库编码和地址。
3. 当后端未返回图片或仓库时，页面给出稳定占位，不阻断购物车操作。

## 接口依赖

依赖后端 `/cart/items` 中每个购物车项返回：

- `image_url`
- `warehouse_info`

## 非目标

- 不新增仓库选择或切换动作。
- 不改变结算、库存锁定、下单逻辑。
