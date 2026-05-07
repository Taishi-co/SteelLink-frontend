# SL-FE-SERVICE-MARKET-FULFILLMENT-INTAKE Implementation Plan

## Feature 信息

- Feature ID: SL-FE-SERVICE-MARKET-FULFILLMENT-INTAKE
- 开发负责人: Codex

## 变更范围

- 代码文件:
  - `apps/buyer-app/src/pages/ServiceMarket/index.tsx`
  - `apps/buyer-app/src/services/serviceFulfillmentService.ts`
- 文档文件:
  - `docs/features/SL-FE-SERVICE-MARKET-FULFILLMENT-INTAKE/*`
- 配置文件: 无
- 脚本文件: 无

## 实施步骤

1. 扩展履约 service 封装物流委托、仓储托管、履约保障接口。
2. 在服务市场增加四类业务动作弹窗。
3. 对资源表格增加直接委托运输/租仓存货操作。
4. 执行 lint/build 和 harness 验证。

## 验证计划

- `pnpm --filter @steellink/buyer-app lint`
- `pnpm --filter @steellink/buyer-app build`
- `./harness/verify.sh`
- 需要的人工验证: 登录后打开 `/service-market`，分别打开四类弹窗并确认会调用真实 API。

## 风险与回滚关注点

- 真实提交依赖后端服务能力；没有开通采购/仓储/物流服务的企业会被后端拦截。
- 回滚本 PR 即可恢复服务市场只读展示。
