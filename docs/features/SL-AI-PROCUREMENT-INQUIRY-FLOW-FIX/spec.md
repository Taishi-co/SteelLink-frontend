# AI Procurement Inquiry Flow Fix Spec

## 基本信息

- Feature ID: SL-AI-PROCUREMENT-INQUIRY-FLOW-FIX
- Feature 名称: AI采购询价链路通畅性修复
- 负责人: Codex
- 目标上线环境: buyer-app

## 背景

AI采购询价链路需要稳定支持“解析参数、召回商品、匹配物流、生成订单、融资匹配、提交审核”的渐进式流程。当前前端对后端历史数据中的空数组/null 缺少归一化，对未命中真实商品时生成的参考方案仍允许选择，容易让用户走到下一步后才收到后端错误。

## 范围

### In Scope

- AI采购接口响应在前端统一归一化，历史记录中的空匹配结果、空融资方案和空审核项按空列表处理。
- 无真实 `product_id` 的参考采购方案不允许进入下单链路，并在页面上明确展示参考方案状态。
- AI采购长耗时接口使用更长请求超时，并在失败时展示后端真实错误消息。
- 物流仓储匹配返回后同步刷新页面结果，避免后退/前进时展示旧匹配数据。

### Out of Scope

- 不新增 AI 模型供应商配置。
- 不改变后端 AI采购接口路径。
- 不改变企业采购权限要求。

## 交互与页面影响

- 受影响页面: `apps/buyer-app/src/pages/AiProcurement/index.tsx`
- 新增页面: 无
- 路由变化: 无
- 菜单变化: 无

## 数据与接口影响

- 受影响 API:
  - `POST /api/v1/ai-procurements/parse`
  - `POST /api/v1/ai-procurements/confirm-instruction`
  - `POST /api/v1/ai-procurements/match-products`
  - `POST /api/v1/ai-procurements/match-logistics-warehouse`
  - `POST /api/v1/ai-procurements/generate-order`
  - `POST /api/v1/ai-procurements/:id/match-finance`
  - `GET /api/v1/ai-procurements/mine`
- 请求/响应变化: 前端兼容 `null` 列表和缺省订单草稿，不要求后端新增字段。
- 环境变量变化: 无

## 权限影响

- 受影响角色: 买家企业用户、未登录访客
- 新增/调整权限: 无

## 验收标准

1. 打开历史 AI采购记录时，空数组/null 数据不会导致页面报错。
2. 未命中真实商品时，参考采购方案不可被选中进入订单生成。
3. AI采购接口耗时较长时前端不会在 30 秒默认超时处提前中断。
4. 后端返回业务错误时页面展示可理解的错误消息。
