# AI Procurement Inquiry Flow Fix Implementation Plan

## Feature 信息

- Feature ID: SL-AI-PROCUREMENT-INQUIRY-FLOW-FIX
- 开发负责人: Codex

## 变更范围

- 代码文件:
  - `apps/buyer-app/src/services/aiProcurementService.ts`
  - `apps/buyer-app/src/pages/AiProcurement/index.tsx`
- 文档文件:
  - `docs/features/SL-AI-PROCUREMENT-INQUIRY-FLOW-FIX/*`
- 配置文件: 无
- 脚本文件: 无

## 实施步骤

1. 在 AI采购服务层增加响应归一化，兜底空数组和订单草稿默认值。
2. AI采购长耗时接口增加单次请求超时配置。
3. 页面层拦截无真实商品 ID 的参考方案选择，并展示明确提示。
4. 物流仓储匹配后同步更新 `result.matched_products`。
5. 页面错误提示优先透出后端业务消息。

## 验证计划

- `pnpm --filter @steellink/buyer-app typecheck`
- `pnpm --filter @steellink/buyer-app build`
- `./harness/branch-guard.sh local`
- 需要的人工验证: 登录买家企业后走一遍 AI采购询价链路。

## 风险与回滚关注点

- 风险: 前端响应归一化需要保持与后端 snake_case 字段一致。
- 回滚: 回退本 feature 涉及的 AI采购服务封装、页面防御逻辑和文档。
