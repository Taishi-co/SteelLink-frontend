# 多工作台会话切换修复

## 基本信息

- Feature ID: SL-MULTI-WORKBENCH-AUTH
- Feature 名称: 多服务能力企业跨工作台会话切换
- 负责人: Codex
- 目标上线环境: staging/prod

## 背景

平台支持一个企业申请并开通多个服务能力，例如采购、销售、物流、仓储、金融。当前前端部分工作台切换依赖各端本地 token 或共享 token 兜底，若目标工作台残留过期 token，会优先携带旧 token 请求后端并返回 `2000003 token expired`。

目标是让工作台入口以企业已开通服务能力为准，并在跨应用跳转时使用后端一次性切换凭证换取目标工作台的新 JWT。

## 范围

### In Scope

- 买家、卖家、物流、仓储、资金方工作台 token 读取时过滤过期 JWT。
- 买家端进入卖家、物流、仓储、资金方工作台时优先创建 `switch_token`。
- 物流、仓储、资金方工作台支持消费 `switch_token` 并保存目标端会话。
- 卖家端返回买家工作台时优先创建 `switch_token`。
- 服务能力入口页与竞价大厅的卖家工作台入口改为会话切换流程。

### Out of Scope

- 不新增企业服务能力类型。
- 不调整服务能力审核状态流转。
- 不改动后端 JWT 过期时长。

## 交互与页面影响

- 受影响页面:
  - `apps/buyer-app/src/components/Layout/DashboardLayout.tsx`
  - `apps/buyer-app/src/components/Layout/HomeHeader.tsx`
  - `apps/buyer-app/src/pages/Bidding/index.tsx`
  - `apps/buyer-app/src/pages/Enterprise/index.tsx`
  - `apps/buyer-app/src/pages/ServiceWorkspace/index.tsx`
  - `apps/seller-app/src/components/Layout/SellerLayout.tsx`
  - `apps/logistics-app/src/App.tsx`
  - `apps/warehouse-app/src/App.tsx`
  - `apps/finance-app/src/App.tsx`
- 新增页面: 无
- 路由变化: 无
- 菜单变化: 无新增菜单，仅调整已有入口的跳转方式。

## 数据与接口影响

- 受影响 API:
  - `POST /api/v1/auth/switch-session`
  - `POST /api/v1/auth/switch-session/consume`
- 请求/响应变化:
  - 前端开始向后端提交 `target=logistics|warehouse|finance`。
  - 响应结构保持不变，仍为 `switch_token` 或登录响应。
- 环境变量变化: 无

## 权限影响

- 受影响角色: 企业用户
- 新增/调整权限:
  - 不新增权限点。
  - 工作台准入以企业已审核服务能力 `sales/procurement/logistics/warehouse/finance` 为准，`enterprise_role` 仅作为默认兜底能力。

## 验收标准

1. 企业开通多个服务能力后，可以从个人工作台进入对应工作台，不被单一 `enterprise_role` 限制。
2. 目标工作台存在过期本地 token 时，会清理旧 token 并使用有效会话或 `switch_token` 建立新会话。
3. 无目标服务能力的企业无法通过入口或切换凭证进入未授权工作台。
