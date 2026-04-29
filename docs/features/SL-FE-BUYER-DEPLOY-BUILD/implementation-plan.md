# Implementation Plan

## Feature 信息

- Feature ID: SL-FE-BUYER-DEPLOY-BUILD
- 开发负责人: Codex

## 变更范围

- 代码文件:
  - `apps/buyer-app/src/pages/Cart/index.tsx`
  - `apps/buyer-app/src/pages/EnterpriseIntro/index.tsx`
- 文档文件:
  - `docs/features/SL-FE-BUYER-DEPLOY-BUILD/*`
- 配置文件: 无
- 脚本文件: 无

## 实施步骤

1. 从最新 `origin/main` 复现 `pnpm --filter @steellink/buyer-app build` 失败。
2. 移除 buyer-app 页面中的未使用导入和未使用 store 字段。
3. 将购物车结算汇总改为基于当前购物车全部条目，避免读取 `CartItem` 中不存在的 `checked` 字段。
4. 重新执行 buyer-app build 与仓库 harness 验证。

## 验证计划

- `pnpm --filter @steellink/buyer-app build`
- `./harness/verify.sh`
- `./harness/review.sh docs/features/SL-FE-BUYER-DEPLOY-BUILD`
- `./harness/release.sh docs/features/SL-FE-BUYER-DEPLOY-BUILD`
- 人工验证: 部署流水线重新构建 Docker 镜像，确认 buyer-app build 阶段通过。

## 风险与回滚关注点

- 当前购物车类型与 API 没有选择态，本次修复按全部购物车条目结算。若后续恢复多选购物车，需要同步扩展 `CartItem` 类型、store/API 数据和页面交互。
