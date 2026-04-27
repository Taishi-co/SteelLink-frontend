# Implementation Plan

## 步骤

1. 从当前主干创建 `feat/SL-FE-BIDDING-PROCUREMENT-API`。
2. 新增 `marketService` 封装 `/biddings*` 与 `/procurements*` 接口。
3. 新增竞价大厅页面并替换 `/bidding` 占位页。
4. 将集采大厅改为活动列表页，新增 `/procurement/:id` 活动详情页。
5. 与后端本地服务联调，确认接口数据能驱动页面。
6. 执行 buyer-app lint/build 和 feature harness。

## 风险与回滚

- 后端不可用时页面为空状态，不回退到静态业务数据。
- 回滚本分支即可恢复原静态/占位页面。
