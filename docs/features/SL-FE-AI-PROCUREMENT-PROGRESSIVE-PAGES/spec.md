# Feature Spec: AI采购渐进式页面

## 基本信息

- Feature ID: SL-FE-AI-PROCUREMENT-PROGRESSIVE-PAGES
- Feature 名称: AI采购渐进式页面
- 负责人: Codex
- 目标上线环境: buyer-app

## 背景

买家端现有 `/ai-procurement` 页面把采购对话、流程可视化、五个阶段结果和我的采购记录集中在一个长页面里。实际采购用户需要按步骤推进，先通过对话表达需求，再逐步完成指令解析、商品匹配、订单生成、融资匹配和审核提交。

## 范围

### In Scope

- 调整 `/ai-procurement` 首页，使其承载流程可视化、采购对话、我的AI采购和AI采购例子。
- 将采购流程的 1-5 步分别拆为独立路由页面。
- 保留现有 AI采购接口调用，不修改后端 API 契约。
- 从历史 AI采购记录可进入步骤页面查看真实流程结果。

### Out of Scope

- 不新增后端接口。
- 不修改 AI采购解析、匹配、融资或审核业务规则。
- 不调整顶部导航与其他买家端页面。

## 交互与页面影响

- 受影响页面: `apps/buyer-app/src/pages/AiProcurement/index.tsx`
- 新增页面: `/ai-procurement/1`、`/ai-procurement/2`、`/ai-procurement/3`、`/ai-procurement/4`、`/ai-procurement/5`
- 路由变化: `apps/buyer-app/src/router/index.tsx` 新增 `ai-procurement/:step`
- 菜单变化: 无

## 数据与接口影响

- 受影响 API:
  - `POST /api/v1/ai-procurements/parse`
  - `POST /api/v1/ai-procurements`
  - `GET /api/v1/ai-procurements/mine`
  - `POST /api/v1/ai-procurements/:id/submit-review`
- 请求/响应变化: 无
- 环境变量变化: 无

## 权限影响

- 受影响角色: 买家用户、未登录访客
- 新增/调整权限: 无。未登录访客仍可访问页面结构和例子，但不能调用登录态接口。

## 验收标准

1. 打开 `/ai-procurement` 时，首屏展示采购流程可视化和采购对话框。
2. `/ai-procurement` 对话框下面展示我的AI采购和AI采购例子。
3. 五个流程步骤分别可通过 `/ai-procurement/1` 至 `/ai-procurement/5` 访问。
4. 用户解析采购需求后进入第 1 步，并可通过上一步/下一步按流程查看结果。
5. 创建采购单、提交审核和我的AI采购刷新仍调用现有真实接口。
