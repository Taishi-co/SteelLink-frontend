# Implementation Plan

## 步骤

1. 从最新 `origin/main` 创建 `feat/SL-FE-BIDDING-HALL-ENHANCE`。
2. 新增 `Bidding` 页面，将 `/bidding` 从占位页替换为竞价大厅。
3. 新增 `BiddingModule` 页面，承接 `/bidding/buyer` 与 `/bidding/seller` 两个角色模块入口。
4. 使用 Ant Design 的 `Statistic`、`Card`、`Progress`、`Steps`、`Tag` 构建大厅统计、角色入口、热门竞价和成交记录。
5. 补齐 feature 文档并执行 buyer-app 与 harness 验证。

## 风险与回滚

- 当前页面使用前端静态演示数据，不新增后端接口，不影响真实竞价数据。
- 买家/卖家模块先提供工作台框架，后续接入真实竞价单、报价、保证金、合同接口。
- 回滚本分支即可恢复 `/bidding` 占位页。
