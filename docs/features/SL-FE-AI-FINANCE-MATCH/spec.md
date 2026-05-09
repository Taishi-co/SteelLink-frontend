# AI Procurement Finance Recommendation UX Spec

## 基本信息

- Feature ID: `SL-FE-AI-FINANCE-MATCH`
- Feature 名称: AI采购融资产品预选与订单融资选择
- 负责人: Codex
- 目标上线环境: production

## 背景

AI采购阶段只能推荐融资产品，真实融资申请必须在订单生成、双方签署合同并进入支付/融资节点后执行。买家需要在 AI采购里先选择心仪融资产品，并在订单详情真正申请融资时看到该产品置顶且标注 AI推荐。

## 范围

### In Scope

- AI采购融资匹配页展示真实融资产品，支持单选预选并确认。
- AI采购审核页展示已预选融资产品和 AI 推荐标记。
- 订单详情待支付/融资节点打开融资产品选择弹窗，置顶订单备注中的 AI 推荐产品。
- 调用既有订单融资申请接口创建真实融资申请。

### Out of Scope

- 不改资金方独立工作台。
- 不新增路由或菜单。
- 不实现融资风控审批页面。

## 交互与页面影响

- 受影响页面: `/ai-procurement/:step`, `/orders/:id`
- 新增页面: 无
- 路由变化: 无
- 菜单变化: 无

## 数据与接口影响

- 受影响 API: `POST /ai-procurements/:id/match-finance`, `GET /finance-services`, `POST /orders/:id/financing-requests`
- 请求/响应变化: `match-finance` 新增 `selected_finance_service_id`；融资方案响应新增真实金融产品字段和推荐标记
- 环境变量变化: 无

## 权限影响

- 受影响角色: 买家企业用户
- 新增/调整权限: 无

## 验收标准

1. AI采购订单生成后自动召回融资产品，用户可选择一个融资产品并确认进入审核。
2. 订单详情待支付/融资节点的融资产品弹窗会把 AI 预选产品置顶并标注 `AI推荐`。
3. 用户确认融资产品后调用真实订单融资申请接口，订单进入融资审批流程。
