# Feature Spec

## 基本信息

- Feature ID: SL-FE-BIDDING-PROCUREMENT-API-INTEGRATION
- Feature 名称: 竞价交易与集采大厅前端接口联调
- 负责人: Codex
- 目标上线环境: buyer-app

## 背景

竞价交易和集采大厅页面需要展示后端接口数据，避免页面内静态业务数据导致前后端不一致。

## 范围

### In Scope

- 新增 `marketService` 对接竞价和集采接口。
- `/bidding` 展示后端竞价统计、热门竞价和竞价成功记录。
- `/bidding/buyer`、`/bidding/seller` 保留角色模块入口框架。
- `/procurement` 展示后端集采统计和活动列表。
- 新增 `/procurement/:id` 展示后端集采详情、实时数据和活动日志。

### Out of Scope

- 不实现竞价报价提交。
- 不实现集采活动创建、审核、报名、签约等写操作。

## 交互与页面影响

- 受影响页面: `/bidding`、`/procurement`
- 新增页面: `/bidding/:module`、`/procurement/:id`
- 路由变化: `/bidding` 和 `/procurement` 从占位/静态页面切换为接口驱动页面。
- 菜单变化: 无。

## 数据与接口影响

- 受影响 API: `/biddings*`、`/procurements*`
- 请求/响应变化: 新增前端 DTO 映射。
- 环境变量变化: 沿用 `VITE_API_URL`。

## 权限影响

- 当前读取公开大厅数据，不新增权限。
- 后续写操作需要企业认证和角色权限。

## 验收标准

1. `/bidding` 不再展示页面内静态竞价数据。
2. `/procurement` 不再展示页面内静态集采数据。
3. `/procurement/:id` 可读取后端详情和日志。
4. 后端不可用时页面展示明确错误提示和空状态。
