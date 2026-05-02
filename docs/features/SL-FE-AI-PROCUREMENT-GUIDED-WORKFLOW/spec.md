# Feature Spec: AI采购渐进式确认流程

## 基本信息

- Feature ID: SL-FE-AI-PROCUREMENT-GUIDED-WORKFLOW
- Feature 名称: AI采购渐进式确认流程
- 负责人: Codex
- 目标上线环境: buyer-app

## 背景

AI采购需要从展示型五步页面升级为可操作的渐进式流程。用户应在每一步明确知道当前进度，并对大模型解析、商品选择、订单信息、融资需求和审核提交做人工确认。

## 范围

### In Scope

- 指令解析页展示流程图，并允许用户修改大模型解析出的商品、品类、数量、单位、用途和融资意图。
- 用户确认参数后才调用商品召回接口。
- 商品匹配页展示候选商品详情，允许查看详情并选择商品。
- 订单生成页填写真实订单字段，并调用后端生成真实订单。
- 融资匹配页按需召回融资方案；不需要融资时可跳过。
- 审核提交页不展示流程图，只展示订单详情和融资详情，并提交审核后询问是否保存到历史AI采购。

### Out of Scope

- 不新增管理端配置页面。
- 不改其他买家端订单、商城、竞价页面。

## 交互与页面影响

- 受影响页面: `apps/buyer-app/src/pages/AiProcurement/index.tsx`
- 受影响服务: `apps/buyer-app/src/services/aiProcurementService.ts`
- 新增页面: 复用 `/ai-procurement/1` 至 `/ai-procurement/5`
- 路由变化: 无新增，沿用已存在的步骤路由

## 数据与接口影响

- 新增前端调用:
  - `POST /api/v1/ai-procurements/confirm-instruction`
  - `POST /api/v1/ai-procurements/match-products`
  - `POST /api/v1/ai-procurements/generate-order`
  - `POST /api/v1/ai-procurements/:id/match-finance`
- 调整前端调用:
  - `POST /api/v1/ai-procurements/:id/submit-review` 带 `save_history`

## 权限影响

- 受影响角色: 买家企业用户、未登录访客
- 新增/调整权限: 无。业务接口仍要求登录企业用户。

## 验收标准

1. 步骤 1-4 页面展示流程图，审核提交页不展示流程图。
2. 步骤 1 可编辑解析参数，并在确认后才召回商品。
3. 步骤 2 可查看候选商品详情并选择商品。
4. 步骤 3 可填写订单信息并生成真实订单。
5. 步骤 4 按融资需求召回或跳过。
6. 步骤 5 展示订单详情和融资详情，提交时可选择是否保存历史。
