# SL-FE-DASHBOARD-SERVICE-ENTRY Spec

## 基本信息

- Feature ID: SL-FE-DASHBOARD-SERVICE-ENTRY
- Feature 名称: 物流与仓储管理中心入口
- 负责人: Codex
- 目标上线环境: buyer-app production

## 背景

买家端 `/dashboard` 侧栏底部已有“进入卖家中心”和“进入资金方工作台”等跨工作台入口。物流、仓储能力开通后，用户也需要从同一入口区域直接进入对应管理中心，而不是只通过业务菜单或服务能力详情页间接访问。

## 范围

### In Scope

- 在 buyer-app dashboard 布局中新增“进入物流管理中心”和“进入仓储管理中心”入口。
- 入口只在当前企业已开通对应 `logistics` 或 `warehouse` 能力时展示。
- 入口跳转到已有 `/dashboard/logistics` 与 `/dashboard/warehouse` 页面。
- 在服务能力详情页已开通状态下补充同名管理中心入口。

### Out of Scope

- 不改独立 `/logistics/`、`/warehouse/` 服务商应用部署路径。
- 不新增后端权限接口或审核流程。
- 不调整现有 `/dashboard/logistics-resources`、`/dashboard/warehouse-resources` 资源管理页面。

## 交互与页面影响

- 受影响页面: `/dashboard` 及所有使用 `DashboardLayout` 的 dashboard 子页面。
- 新增页面: 无。
- 路由变化: 无，复用已有 `/dashboard/logistics`、`/dashboard/warehouse`。
- 菜单变化: 侧栏底部新增权限控制入口，与“进入卖家中心”“进入资金方工作台”并列。

## 数据与接口影响

- 受影响 API: `GET /enterprises/me/services`。
- 请求/响应变化: 无，继续读取 `permissions[].service` 与 `permissions[].status`。
- 环境变量变化: 无。

## 权限影响

- 受影响角色: 已完成企业认证且开通物流或仓储服务商能力的企业用户。
- 新增/调整权限: 无新增权限点；前端入口展示基于既有能力状态 `status === 2`。

## 验收标准

1. 物流能力 `status === 2` 时，dashboard 侧栏底部展示“进入物流管理中心”，点击进入 `/dashboard/logistics`。
2. 仓储能力 `status === 2` 时，dashboard 侧栏底部展示“进入仓储管理中心”，点击进入 `/dashboard/warehouse`。
3. 未开通对应能力时不展示对应入口。
4. `/dashboard/services/logistics` 和 `/dashboard/services/warehouse` 在已开通状态下展示同名管理中心操作按钮。
