# Route Lazy Layout Implementation Plan

## Feature 信息

- Feature ID: SL-FE-ROUTE-LAZY-LAYOUT
- 开发负责人: Codex

## 变更范围

- 代码文件:
  - `apps/buyer-app/src/router/index.tsx`
  - `apps/seller-app/src/router/index.tsx`
- 文档文件:
  - `docs/features/SL-FE-ROUTE-LAZY-LAYOUT/spec.md`
  - `docs/features/SL-FE-ROUTE-LAZY-LAYOUT/test-cases.md`
  - `docs/features/SL-FE-ROUTE-LAZY-LAYOUT/implementation-plan.md`
  - `docs/features/SL-FE-ROUTE-LAZY-LAYOUT/release-checklist.md`
- 配置文件: 无
- 脚本文件: 无

## 实施步骤

1. 移除 buyer-app 和 seller-app 路由树外层的顶层 `Suspense`。
2. 新增页面级 `lazyPage` helper，给每个 `React.lazy` 页面元素单独包裹 fallback。
3. 保持固定布局组件和认证/权限 Route wrapper 直接渲染。
4. 执行 buyer-app 与 seller-app 构建验证。

## 验证计划

- `pnpm --filter @steellink/buyer-app build`
- `pnpm --filter @steellink/seller-app build`
- `./harness/review.sh docs/features/SL-FE-ROUTE-LAZY-LAYOUT`
- `./harness/release.sh docs/features/SL-FE-ROUTE-LAZY-LAYOUT`
- 需要的人工验证: 在浏览器中切换后台页面，确认固定侧边栏和顶部栏不闪烁。

## 风险与回滚关注点

- 风险: 若个别页面依赖全局 fallback 覆盖整屏，调整后只会在页面内容区展示加载态。
- 回滚: 恢复 router 顶层 `Suspense` 并移除 `lazyPage` helper。
