# SL-FE-FINANCE-WAREHOUSE-CERT Implementation Plan

## Feature 信息

- Feature ID: SL-FE-FINANCE-WAREHOUSE-CERT
- 开发负责人: Codex

## 变更范围

- `apps/finance-app/src/services/financeService.ts`
- `apps/finance-app/src/App.tsx`
- `harness/resolve-feature-dir.sh`
- `docs/features/SL-FE-FINANCE-WAREHOUSE-CERT/*`

## 实施步骤

1. 扩展 finance-app 服务层，接入监管仓授权接口。
2. 金融产品列表展开区增加监管仓认证/撤销操作。
3. 执行前端验证。

## 验证计划

- `./harness/verify.sh`
- `pnpm --filter @steellink/finance-app build`

## 风险与回滚关注点

- 认证入口依赖后端 `finance_authorized_warehouses` 和仓库 `pledge_supervision` 字段。
- 回滚时移除 finance-app 新增入口，不影响既有产品管理。
