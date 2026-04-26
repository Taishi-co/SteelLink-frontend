# Implementation Plan: AI采购流程

## Feature 信息

- Feature ID: SL-FE-AI-PROCUREMENT
- 开发负责人: AI agent

## 变更范围

- 代码文件:
  - `apps/buyer-app/src/components/Layout/HomeHeader.tsx`
  - `apps/buyer-app/src/components/Layout/HomeFooter.tsx`
  - `apps/buyer-app/src/pages/Home/index.tsx`
  - `apps/buyer-app/src/pages/Matching/index.tsx`
  - `apps/buyer-app/src/pages/AiProcurement/index.tsx`
  - `apps/buyer-app/src/router/index.tsx`
- 文档文件:
  - `docs/features/SL-FE-AI-PROCUREMENT/spec.md`
  - `docs/features/SL-FE-AI-PROCUREMENT/test-cases.md`
  - `docs/features/SL-FE-AI-PROCUREMENT/implementation-plan.md`
  - `docs/features/SL-FE-AI-PROCUREMENT/release-checklist.md`
  - `docs/features/SL-FE-MATCHING-TAG/*`
- 配置文件: 无
- 脚本文件: 无

## 实施步骤

1. 创建 `SL-FE-AI-PROCUREMENT` feature 文档四件套。
2. 调整买家端导航，去掉旧 `/supply` 的“供求信息”tag，将 `/matching` 展示为“供求信息”。
3. 新增 `/ai-procurement` 页面和路由。
4. 在 AI采购页实现对话示例、五阶段步骤条和阶段详情卡片。
5. 同步首页服务区与 footer 平台服务入口。
6. 更新上一轮供求信息页面文档中的展示命名。
7. 执行买家端 lint/build 与 harness review/release。

## 验证计划

- `pnpm --filter @steellink/buyer-app lint`
- `pnpm --filter @steellink/buyer-app build`
- `./harness/review.sh docs/features/SL-FE-AI-PROCUREMENT`
- `./harness/release.sh docs/features/SL-FE-AI-PROCUREMENT`
- 需要的人工验证: 打开首页、`/matching`、`/ai-procurement`，确认入口命名、路由跳转和五阶段可视化。

## 风险与回滚关注点

- 风险: 当前 AI采购仅为静态流程演示，后续接入真实 AI/订单/融资接口时需要补充 loading、empty、失败和权限状态。
- 风险: 顶部导航新增 AI采购后在窄屏桌面上仍可能拥挤，需要后续响应式优化。
- 回滚: 移除 `/ai-procurement` 页面、路由和入口，并恢复 `/matching` 展示文案即可。
