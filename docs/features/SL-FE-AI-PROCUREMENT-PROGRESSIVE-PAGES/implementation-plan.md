# Implementation Plan: AI采购渐进式页面

## Feature 信息

- Feature ID: SL-FE-AI-PROCUREMENT-PROGRESSIVE-PAGES
- 开发负责人: Codex

## 变更范围

- 代码文件:
  - `apps/buyer-app/src/pages/AiProcurement/index.tsx`
  - `apps/buyer-app/src/router/index.tsx`
- 文档文件:
  - `docs/features/SL-FE-AI-PROCUREMENT-PROGRESSIVE-PAGES/spec.md`
  - `docs/features/SL-FE-AI-PROCUREMENT-PROGRESSIVE-PAGES/test-cases.md`
  - `docs/features/SL-FE-AI-PROCUREMENT-PROGRESSIVE-PAGES/implementation-plan.md`
  - `docs/features/SL-FE-AI-PROCUREMENT-PROGRESSIVE-PAGES/release-checklist.md`
- 配置文件: 无
- 脚本文件: 无

## 实施步骤

1. 在 router 中保留 `/ai-procurement` 首页并新增 `ai-procurement/:step` 步骤路由。
2. 重构 AI采购页面，按是否存在步骤参数展示首页或单步页面。
3. 首页保留流程可视化和采购对话，并新增我的AI采购和AI采购例子布局。
4. 将指令解析、商品匹配、订单生成、融资匹配、审核提交拆成五个独立步骤视图。
5. 复用现有接口封装和状态处理，确保解析、创建、提交审核和历史记录仍使用真实 API。

## 验证计划

- `pnpm --filter @steellink/buyer-app build`
- `./harness/verify.sh`
- `./harness/review.sh docs/features/SL-FE-AI-PROCUREMENT-PROGRESSIVE-PAGES`
- `./harness/release.sh docs/features/SL-FE-AI-PROCUREMENT-PROGRESSIVE-PAGES`
- 需要的人工验证: 打开 `/ai-procurement` 与 `/ai-procurement/1` 至 `/ai-procurement/5`，确认首页结构、步骤跳转和历史记录进入流程。

## 风险与回滚关注点

- 风险: 步骤页面刷新后前端内存中的解析结果会丢失，直接访问时展示空状态；后续如需深链恢复，需要增加按采购单 ID 拉取详情的接口。
- 风险: 未登录用户可查看步骤页面结构，但不能执行登录态接口。
- 回滚: 移除 `ai-procurement/:step` 路由并恢复 AI采购单页布局。
