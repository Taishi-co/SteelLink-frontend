# SL-FE-BUYER-HIDE-BUNDLE-NO

## 背景

买家端公开商城 `/products` 和商品详情页面面向普通采购用户展示商品信息。捆包号属于履约和库存锁定识别字段，不应在前端商城的商品卡片和商品详情中直接暴露给用户。

## 范围

- `apps/buyer-app/src/pages/Products/index.tsx`
- `apps/buyer-app/src/pages/ProductDetail/index.tsx`

## 需求

1. 商品列表卡片不展示捆包号。
2. 商品详情页仓储信息不展示捆包号。
3. 不改变商品接口字段映射、购物车、订单、卖家端或履约后台逻辑。

## 非目标

- 不调整后端接口返回。
- 不调整卖家端维护捆包号的表单与详情。
- 不调整订单、购物车和仓储后台的履约字段展示。
