# Feature Spec

## 基本信息

- Feature ID: SL-FE-MATCHING-API-INTEGRATION
- Feature 名称: 供求信息前端接口对接
- 负责人: Codex
- 目标上线环境: buyer-app

## 背景

买家端“供求信息”页面已具备展示结构，但页面仍使用静态假数据。后端 `SteelLink-backend` 主干已提供 `/api/v1/supply-demands` 系列接口，需要前端改为读取真实接口并支持发布信息。

## 范围

### In Scope

- 对接供求信息统计接口。
- 对接供应、求购、仓储、物流四类公开列表接口。
- 登录用户对接“我的发布”接口。
- 支持从页面发布供应、求购、仓储、物流信息。
- AI 智能撮合推荐改为基于“我的发布”和公开供求信息进行前端派生。
- 无真实数据时展示空状态，不再展示假数据。

### Out of Scope

- 不新增供求信息详情页。
- 不新增后端 API。
- 不新增管理端审核能力。

## 交互与页面影响

- 受影响页面: `apps/buyer-app/src/pages/Matching/index.tsx`
- 新增服务: `apps/buyer-app/src/services/supplyDemandService.ts`
- 路由变化: 无
- 菜单变化: 无

## 数据与接口影响

- 受影响 API:
  - `GET /api/v1/supply-demands/stats`
  - `GET /api/v1/supply-demands`
  - `GET /api/v1/supply-demands/mine`
  - `POST /api/v1/supply-demands`
- 请求/响应变化: 无，复用后端现有契约。
- 环境变量变化: 无，继续使用 `VITE_API_URL` 或默认 `/api/v1`。
- 生产环境检查: `http://117.72.123.14/api/v1/supply-demands/stats` 返回成功；已通过 SSH 核验 `steellink.supply_demand_posts` 存在，字段与后端 GORM 实体匹配。

## 权限影响

- 公开列表和统计对游客开放。
- “我的发布”和发布信息需要买家登录态。

## 验收标准

1. 页面统计来自后端接口。
2. 四个信息板块来自后端列表接口。
3. 未登录时“我的发布”和推荐展示空状态，不请求受保护数据。
4. 登录后可发布供求信息，发布成功后刷新统计、列表和我的发布。
5. 页面不再包含静态假供求数据。
