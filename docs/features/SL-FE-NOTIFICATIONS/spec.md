# Feature Spec

## 基本信息

- Feature ID: SL-FE-NOTIFICATIONS
- Feature 名称: 买家/卖家站内信入口
- 负责人: Codex
- 目标上线环境: staging / prod

## 背景

用户需要在前台看到管理员通知、订单流转通知和审核结果通知。

## 范围

### In Scope

- 买家端 `/dashboard/notifications` 站内信页面。
- 买家首页导航头像前新增站内信铃铛，可查看最近消息。
- 卖家端 `/notifications` 站内信页面。
- 买家/卖家侧边栏增加站内信入口。
- 支持全部/未读筛选、单条已读、全部已读、站内链接跳转和 WebSocket 实时刷新。

### Out of Scope

- 不做 WebSocket 实时推送。
- 不改物流/仓储/资金独立工作台。

## 交互与页面影响

- 受影响页面: 买家 HomeHeader、DashboardLayout、卖家 SellerLayout
- 新增页面: Notifications
- 路由变化: `/dashboard/notifications`、`/notifications`
- 菜单变化: 新增站内信菜单

## 数据与接口影响

- 受影响 API: `/notifications`、`/notifications/unread-count`、`/notifications/:id/read`、`/notifications/read-all`、`/notifications/ws`
- 请求/响应变化: 新增前端 service 封装
- 环境变量变化: 无

## 权限影响

- 受影响角色: 登录买家/卖家
- 新增/调整权限: 无

## 验收标准

1. 买家和卖家可以进入站内信页面。
2. 未读消息可标记为已读。
3. 带站内链接的消息点击后能进入对应业务页面。
4. 首页站内信铃铛能展示最近消息，并在收到 WebSocket 事件后刷新未读数。
