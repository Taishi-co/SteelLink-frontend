# Feature Spec

## 基本信息

- Feature ID: SL-FE-SERVICE-APPS
- Feature 名称: 物流、仓储、资金服务前端应用原型
- 负责人: Codex
- 目标上线环境: 前端预览环境

## 背景

SteelLink 买家工作台已预留 `/dashboard/finance` 与 `/dashboard/logistics`，线上也已有 `/dashboard/services` 服务入口。平台业务还需要物流平台、仓储平台和资金服务平台，因此本阶段先把三类服务收进买家工作台：在服务入口开通对应服务后，用户即可在对应 dashboard 路由看到服务面板。

参考外部公开信息，欧冶物流平台面向大宗物资流通，覆盖仓储服务、运输服务、加工服务、物流交易、控货监管等范围。本 feature 只参考业务分类和买家入口形态，不复制页面资产或交互实现。

## 范围

### In Scope

- 买家端新增物流仓储服务市场页面，合并展示仓储、运输、监管和增值服务。
- 新增 `/dashboard/services` 服务入口，支持开通/关闭物流、仓储、资金服务。
- 将物流平台面板放入 `/dashboard/logistics`，用于运单承接、车辆线路、在途异常和结算概览。
- 新增 `/dashboard/warehouse` 仓储平台面板，用于仓容、入出库预约、库存监管和作业看板。
- 将资金服务平台面板放入 `/dashboard/finance`，用于融资申请、授信、放款和贷后监控。
- 侧边栏根据服务开通状态显示对应服务菜单。

### Out of Scope

- 后端 API、数据库、鉴权、真实订单状态流转。
- 独立 logistics-app、warehouse-app、finance-app 应用与生产部署脚本。
- 角色登录体系合并与权限矩阵落库。

## 交互与页面影响

- 受影响页面: `apps/buyer-app/src/components/Layout/HomeHeader.tsx`
- 新增页面: `apps/buyer-app/src/pages/ServiceMarket/index.tsx`
- 新增 dashboard 页面:
  - `apps/buyer-app/src/pages/Dashboard/Services.tsx`
  - `apps/buyer-app/src/pages/Dashboard/Warehouse.tsx`
  - `apps/buyer-app/src/pages/Dashboard/Finance.tsx`
  - `apps/buyer-app/src/pages/Dashboard/Logistics.tsx`
- 路由变化:
  - 买家端新增 `/service-market`
  - 工作台新增 `/dashboard/services`
  - 物流平台使用 `/dashboard/logistics`
  - 仓储平台使用 `/dashboard/warehouse`
  - 资金服务平台使用 `/dashboard/finance`
- 菜单变化: 买家端主导航新增“物流仓储”，工作台侧边栏新增“服务入口”，并按开通状态显示物流、仓储、资金菜单。

## 数据与接口影响

- 受影响 API: 无
- 请求/响应变化: 无
- 环境变量变化: 无
- 当前数据来源: 前端静态模拟数据与浏览器本地服务开通状态，用于业务逻辑讨论和页面评审。

## 权限影响

- 受影响角色: 买家、物流商、仓储商、资金方
- 新增/调整权限: 本阶段不改鉴权实现；后续需要用后端企业服务订阅与角色权限替换本地开通状态。

## 验收标准

1. 买家可从首页导航进入物流仓储服务市场，并同时看到仓储与运输服务能力。
2. 用户可在 `/dashboard/services` 开通物流、仓储、资金服务。
3. 开通后可在 `/dashboard/logistics`、`/dashboard/warehouse`、`/dashboard/finance` 看到对应面板。
4. 每个面板都有概览指标、待办事项、核心业务表格和下一步业务判断入口。
5. 不依赖后端即可完成前端业务讨论和页面走查。
