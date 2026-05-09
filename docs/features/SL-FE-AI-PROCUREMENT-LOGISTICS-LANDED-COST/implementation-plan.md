# SL-FE-AI-PROCUREMENT-LOGISTICS-LANDED-COST Implementation Plan

## Feature 信息

- Feature ID: SL-FE-AI-PROCUREMENT-LOGISTICS-LANDED-COST
- 开发负责人: Codex

## 变更范围

- 代码文件:
  - `apps/buyer-app/src/services/aiProcurementService.ts`
  - `apps/buyer-app/src/pages/AiProcurement/index.tsx`
- 文档文件:
  - `docs/features/SL-FE-AI-PROCUREMENT-LOGISTICS-LANDED-COST/*`
- 配置文件: 无
- 脚本文件: 无

## 实施步骤

1. 扩展 AI采购前端类型，兼容后端新增收货地址和物流估算字段。
2. 在第 1 步加载平台仓库服务并提供收货地址选择/输入。
3. 第 2 步只展示商品候选和拼单数量调整，确认后调用 `match-logistics-warehouse`。
4. 新增第 3 步物流仓储匹配，展示发货仓库、推荐物流、运费和到手价。
5. 在第 3 步推荐物流旁增加协商报价选项，并把选择结果带入第 4 步订单物流方式与交付说明。
6. 在第 4 步用所选商品的发货仓库和收货地址预填订单表单。

## 验证计划

- `pnpm --filter @steellink/buyer-app lint`
- `pnpm --filter @steellink/buyer-app build`
- `./harness/verify.sh`
- 需要的人工验证: 打开 `/ai-procurement`，完成解析、地址确认、匹配和拼单选择。

## 风险与回滚关注点

- 到手价为后端估算值，正式物流履约价格以后续物流接单/报价为准。
- 回滚本 PR 即可恢复旧 AI采购页面。
