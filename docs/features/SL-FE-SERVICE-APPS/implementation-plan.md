# Implementation Plan

## Feature 信息

- Feature ID: SL-FE-SERVICE-APPS
- 开发负责人: Codex

## 变更范围

- 代码文件:
  - `apps/buyer-app/src/pages/ServiceMarket/index.tsx`
  - `apps/buyer-app/src/router/index.tsx`
  - `apps/buyer-app/src/components/Layout/HomeHeader.tsx`
  - `apps/logistics-app/**`
  - `apps/warehouse-app/**`
  - `apps/finance-app/**`
- 文档文件:
  - `docs/features/SL-FE-SERVICE-APPS/*`
- 配置文件:
  - `package.json`
  - 新应用 package、tsconfig、vite、tailwind、postcss 配置
- 脚本文件: 无

## 实施步骤

1. 补齐 feature 文档四件套，明确买家侧合并展示和服务方独立后台边界。
2. 在 buyer-app 增加物流仓储服务市场页面和主导航入口。
3. 新增 logistics-app、warehouse-app、finance-app，先用静态业务数据搭出工作后台。
4. 更新根 scripts，纳入新应用 dev/build 入口。
5. 执行应用级 build 验证，并按耗时情况执行 harness gate。

## 验证计划

- `pnpm --filter @steellink/buyer-app build`
- `pnpm --filter @steellink/logistics-app build`
- `pnpm --filter @steellink/warehouse-app build`
- `pnpm --filter @steellink/finance-app build`
- `./harness/verify.sh`
- 需要的人工验证: 后续浏览器走查 `/service-market`、`/logistics`、`/warehouse`、`/finance`

## 风险与回滚关注点

- 新应用当前是前端静态原型，后续接后端时要收敛 API 契约与权限模型。
- 根 `pnpm -r build` 会新增三个 build 目标，CI 时间会增加。
- 部署侧如果只发布 buyer/seller，需要单独决定新应用域名、base path 和 nginx 入口。
