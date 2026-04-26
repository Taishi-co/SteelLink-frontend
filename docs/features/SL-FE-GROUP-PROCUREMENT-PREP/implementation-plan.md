# Implementation Plan

## 步骤

1. 从最新 `origin/main` 创建 `feat/SL-FE-GROUP-PROCUREMENT-PREP`。
2. 新增 `Procurement` 页面。
3. 将 `/procurement` 路由从占位页切换到正式筹备页面。
4. 使用 Ant Design 的 `Steps`、`Card`、`Form`、`Statistic`、`Timeline` 组织集采业务界面。
5. 补齐 feature 文档并执行 buyer-app 与 harness 验证。

## 风险与回滚

- 当前页面不接后端，属于前端规划筹备，不影响交易数据。
- 后续接真实业务时需要新增集采活动、企业报名、竞价报价、合同、履约、结算和评价接口。
- 回滚本分支即可恢复占位页。
