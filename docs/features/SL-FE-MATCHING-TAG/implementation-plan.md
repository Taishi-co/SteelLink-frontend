# Implementation Plan: 供求信息工作台

## Feature 信息

- Feature ID: SL-FE-MATCHING-TAG
- 开发负责人: AI agent

## 变更范围

- 代码文件:
  - `apps/buyer-app/src/components/Layout/HomeHeader.tsx`
  - `apps/buyer-app/src/components/Layout/HomeFooter.tsx`
  - `apps/buyer-app/src/pages/Home/index.tsx`
  - `apps/buyer-app/src/pages/Matching/index.tsx`
  - `apps/buyer-app/src/router/index.tsx`
- 文档文件:
  - `docs/features/SL-FE-MATCHING-TAG/spec.md`
  - `docs/features/SL-FE-MATCHING-TAG/test-cases.md`
  - `docs/features/SL-FE-MATCHING-TAG/implementation-plan.md`
  - `docs/features/SL-FE-MATCHING-TAG/release-checklist.md`
- 配置文件: 无
- 脚本文件: 无

## 实施步骤

1. 按规范创建 feature 文档四件套，明确范围、测试和上线检查。
2. 在买家端顶部导航中新增 `/matching` 对应的“供求信息”入口。
3. 新增 `/matching` 供求信息工作台页面。
4. 在页面中实现数据看板、AI 智能撮合推荐、我的发布、发布与服务入口、对应信息板块。
5. 在首页 hero 文案、平台服务卡片与 footer 平台服务列表中同步新增供求信息入口。
6. 执行 harness review/release/verify 与买家端构建验证。

## 验证计划

- `./harness/review.sh docs/features/SL-FE-MATCHING-TAG`
- `./harness/release.sh docs/features/SL-FE-MATCHING-TAG`
- `./harness/verify.sh`
- `pnpm --filter @steellink/buyer-app build`
- 需要的人工验证: 打开买家端首页和 `/matching`，确认顶部导航、平台服务区、footer 入口顺序，以及撮合工作台各板块展示。

## 风险与回滚关注点

- 风险: `/matching` 当前使用静态展示数据，后续接入真实接口时需要补充 loading、empty 和异常状态。
- 风险: 顶部导航项增加后在窄屏桌面上可能更拥挤，需要后续结合响应式设计优化。
- 回滚: 移除 `/matching` 页面、路由、导航项、首页服务卡片和 footer 入口即可恢复原入口结构。
