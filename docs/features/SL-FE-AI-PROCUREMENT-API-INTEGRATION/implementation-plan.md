# Implementation Plan

## 步骤

1. 从最新 `origin/main` 创建 `fix/SL-FE-AI-PROCUREMENT-api-integration`。
2. 新增 `aiProcurementService`，封装解析、创建、我的列表、提交审核接口。
3. 替换 `AiProcurement` 页面静态数据为真实接口状态。
4. 初始状态展示空状态和登录提示，不预置采购结果。
5. 补齐 feature 文档并执行 buyer-app 与 harness 验证。

## 数据库

后端主干已包含 `ai_procurements` GORM AutoMigrate。已通过 SSH 登录生产机并在 `steellink` 库执行：

```sql
SHOW CREATE TABLE ai_procurements;
```

确认 `ai_procurements` 已存在，包含 `procurement_no`、`prompt`、`parsed_instruction`、`matched_products`、`order_draft`、`finance_plans`、`audit_items`、`current_stage`、`status`、`enterprise_id`、`created_by`、`review_submitted_at`、`deleted_at` 等字段和后端实体所需索引，因此无需手动新增表。

## 风险与回滚

- 由于后端 AI采购接口需要登录态，未登录用户无法看到解析结果。
- 如后端接口不可用，页面展示错误提示和空状态，不回退到假数据。
- 回滚本分支即可恢复原静态页面。
