# AI Procurement Bundle Match Spec

## 基本信息

- Feature ID: SL-FE-AI-PROCUREMENT-BUNDLE-MATCH
- Feature 名称: AI采购拼单商品选择
- 负责人: Codex
- 目标上线环境: production

## 背景

AI采购商品匹配阶段原本只能选择一个商品。业务希望用户采购 100 吨钢材时，可以按召回商品拆分数量，例如 A 商品 30 吨、B 商品 70 吨，再进入订单生成。

## 范围

### In Scope

- AI采购商品匹配阶段支持多选商品。
- 每个已选商品可录入本次采购数量。
- 前端校验拼单总量必须等于解析出的采购数量。
- 订单生成请求向后端提交 `selected_products`。

### Out of Scope

- 跨订单统一支付、统一合同和父订单聚合履约。
- 购物车结算页重构。
- 后台配置页变化。

## 交互与页面影响

- 受影响页面: `apps/buyer-app/src/pages/AiProcurement/index.tsx`
- 新增页面: 无。
- 路由变化: 无。
- 菜单变化: 无。

## 数据与接口影响

- 受影响 API: `POST /api/v1/ai-procurements/generate-order`
- 请求/响应变化:
  - 请求新增 `selected_products?: MatchedProduct[]`
  - 保留 `selected_product` 兼容旧单选调用
- 环境变量变化: 无。

## 权限影响

- 受影响角色: buyer enterprise。
- 新增/调整权限: 无。

## 验收标准

1. 商品匹配阶段可以选择多个商品并填写各自数量。
2. 已选商品数量合计不等于采购数量时不能进入订单生成。
3. 订单生成阶段展示拼单明细并提交 `selected_products`，审核页可展示后端返回的多订单摘要。
