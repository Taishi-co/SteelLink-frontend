# Home Real Stats Spec

## 基本信息

- Feature ID: SL-FE-HOME-REAL-STATS
- Feature 名称: 买家端首页真实统计展示
- 负责人: Codex
- 目标上线环境: production

## 背景

买家端首页“入驻商家、SKU商品、累计订单、交易金额”当前为静态演示值。首页上线后需要调用后端统计接口展示真实业务数据，并在接口失败时保留稳定的降级展示。

## 范围

### In Scope

- 首页统计区调用 `GET /api/v1/platform/stats`。
- 将接口返回的四项指标格式化后展示。
- 接口失败时显示 `--`，不阻断首页其他区域。

### Out of Scope

- 不调整首页布局、导航、服务卡片或合作钢厂区域。
- 不新增登录要求。
- 不调整管理端统计页面。

## 交互与页面影响

- 受影响页面: `apps/buyer-app/src/pages/Home/index.tsx`
- 新增页面: 无
- 路由变化: 无
- 菜单变化: 无

## 数据与接口影响

- 受影响 API: `GET /api/v1/platform/stats`
- 请求/响应变化: 新增前端 API 封装 `platformService.getStats()`
- 环境变量变化: 无，沿用现有 `VITE_API_URL` / `/api/v1`

## 权限影响

- 受影响角色: 游客、登录用户均可查看。
- 新增/调整权限: 无。

## 验收标准

1. 首页统计区不再使用硬编码演示数字。
2. 接口成功时展示后端真实统计。
3. 接口失败时首页仍可渲染，统计值显示降级占位。
