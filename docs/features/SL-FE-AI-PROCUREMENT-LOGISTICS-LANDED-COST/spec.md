# SL-FE-AI-PROCUREMENT-LOGISTICS-LANDED-COST Spec

## 基本信息

- Feature ID: SL-FE-AI-PROCUREMENT-LOGISTICS-LANDED-COST
- Feature 名称: AI采购收货地址与到手价前端联调
- 负责人: Codex
- 目标上线环境: prod

## 背景

AI采购需要把用户收货地址、平台仓储服务、卖家发货仓库和物流服务串起来，辅助用户选择总成本最低的采购方案，并继续支持 A 店 + B 店拼单。

## 范围

### In Scope

- AI采购第 1 步增加收货地址类型、平台仓库选择和收货地址输入。
- `match-products` 只负责候选商品召回，商品选择汇总展示已选数量和商品金额。
- 商品匹配和订单生成中间新增“物流仓储匹配”步骤，调用后端推荐发货仓库、物流商、预估运费和到手价。
- 生成真实订单时自动带入卖家发货仓库与用户收货地址。

### Out of Scope

- 不新增地址簿管理页面。
- 不改变购物车/普通下单页。
- 不实现地图距离可视化。

## 交互与页面影响

- 受影响页面: `/ai-procurement`, `/ai-procurement/:step`
- 新增页面: 无
- 路由变化: 无
- 菜单变化: 无

## 数据与接口影响

- 受影响 API:
  - `POST /ai-procurements/confirm-instruction`
  - `POST /ai-procurements/match-products`
  - `POST /ai-procurements/match-logistics-warehouse`
  - `POST /ai-procurements/generate-order`
  - `GET /warehouse-services`
- 请求/响应变化: `ParsedInstruction` 新增收货地址字段；`MatchedProduct` 新增物流估算字段。
- 环境变量变化: 无

## 权限影响

- 受影响角色: 买家用户
- 新增/调整权限: 无

## 验收标准

1. 用户可在第 1 步手动输入收货地址，或选择平台仓库自动填入地址。
2. 第 2 步只展示候选商品、库存、单价、商品金额和拼单数量选择。
3. 第 3 步调用物流仓储匹配并展示发货仓库、推荐物流、预估运费、到手单价和到手总价。
4. 多选商品拼单时，合计数量在商品匹配阶段校验，到手金额在物流仓储匹配阶段汇总。
5. 第 4 步生成订单表单自动带入卖家发货仓库和收货地址。
