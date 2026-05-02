# Implementation Plan: AI采购渐进式确认流程

## Feature 信息

- Feature ID: SL-FE-AI-PROCUREMENT-GUIDED-WORKFLOW
- 开发负责人: Codex

## 变更范围

- 代码文件:
  - `apps/buyer-app/src/pages/AiProcurement/index.tsx`
  - `apps/buyer-app/src/services/aiProcurementService.ts`
- 文档文件:
  - `docs/features/SL-FE-AI-PROCUREMENT-GUIDED-WORKFLOW/*`
- 配置文件: 无
- 脚本文件: 无

## 实施步骤

1. 扩展 AI采购前端服务类型和接口方法。
2. 第 1 步改为可编辑参数表单，确认后调用参数确认和商品召回接口。
3. 第 2 步实现候选商品卡片、详情弹窗和选择状态。
4. 第 3 步实现真实订单字段表单并调用生成订单接口。
5. 第 4 步按融资意图召回或跳过融资。
6. 第 5 步改为订单详情和融资详情确认页，提交审核时询问是否保存历史。

## 验证计划

- `pnpm --filter @steellink/buyer-app build`
- `./harness/verify.sh`
- `./harness/review.sh docs/features/SL-FE-AI-PROCUREMENT-GUIDED-WORKFLOW`
- `./harness/release.sh docs/features/SL-FE-AI-PROCUREMENT-GUIDED-WORKFLOW`

## 风险与回滚关注点

- 风险: 真实订单生成依赖后端新增接口和可用库存商品。
- 风险: 页面刷新后仍需要从历史记录或重新解析恢复流程。
- 回滚: 回滚 AI采购页面和服务封装到上一版渐进式展示页面。
