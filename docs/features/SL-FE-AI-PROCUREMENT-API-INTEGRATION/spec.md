# Feature Spec

## 基本信息

- Feature ID: SL-FE-AI-PROCUREMENT-API-INTEGRATION
- Feature 名称: AI采购前端接口对接
- 负责人: Codex
- 目标上线环境: buyer-app

## 背景

买家端 AI采购页面已提供流程展示，但页面仍使用静态假数据。后端主干已经提供 `/api/v1/ai-procurements` 系列接口，需要前端切换到真实接口，确保解析、商品匹配、订单草稿、融资方案、审核提交和我的采购单均来自后端。

## 范围

### In Scope

- 新增 AI采购服务封装。
- 对接采购指令解析接口。
- 对接创建 AI采购单接口。
- 对接我的 AI采购列表接口。
- 对接提交审核接口。
- 页面无结果时展示空状态，不预置假采购结果。
- 生产库核验 `ai_procurements` 表结构。

### Out of Scope

- 不修改后端 AI采购接口契约。
- 不新增正式订单创建能力。
- 不新增金融产品管理能力。

## 交互与页面影响

- 受影响页面: `apps/buyer-app/src/pages/AiProcurement/index.tsx`
- 新增服务: `apps/buyer-app/src/services/aiProcurementService.ts`
- 路由变化: 无
- 菜单变化: 无

## 数据与接口影响

- 受影响 API:
  - `POST /api/v1/ai-procurements/parse`
  - `POST /api/v1/ai-procurements`
  - `GET /api/v1/ai-procurements/mine`
  - `POST /api/v1/ai-procurements/:id/submit-review`
- 请求/响应变化: 无，复用后端现有契约。
- 环境变量变化: 无。
- 生产环境检查: 已通过 SSH 核验 `steellink.ai_procurements` 存在，字段与后端 GORM 实体匹配。

## 权限影响

- AI采购接口均需要买家登录态。
- 未登录用户可以看到页面说明，但不能解析、创建、查看我的采购或提交审核。

## 验收标准

1. 页面初始不展示静态采购结果。
2. 登录后输入采购需求并点击解析，页面展示后端返回的解析、匹配、订单、融资和审核数据。
3. 登录后发起 AI采购可创建采购单并刷新我的 AI采购。
4. 选择我的 AI采购记录可回填真实流程结果。
5. 已创建采购单可提交审核。
