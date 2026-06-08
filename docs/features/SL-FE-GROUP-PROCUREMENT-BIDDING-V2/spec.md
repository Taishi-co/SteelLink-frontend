# Feature Spec

## 基本信息

- Feature ID: `SL-FE-GROUP-PROCUREMENT-BIDDING-V2`
- Feature 名称: 集采竞价 V2 商城前端集成
- 负责人: Codex
- 目标上线环境: staging

## 背景

当前商城里的集采能力更像单卖家团购：买家申请集采后，平台选择单个卖家商品公开参团。这样买家看不到真正的竞价项目进度，卖家也无法在商城平台内围绕同一需求参与报价。

本次需要把集采能力继续集成在商城平台内，但交互升级为“项目制竞价集采”：买家仍从商城/AI 采购发起申请，卖家通过卖家端查看可参与项目并报价，买家端查看项目进度和定标结果。

## 范围

### In Scope

- 买家端保留集采申请入口，但大厅升级为项目列表/详情视图。
- 买家端新增项目状态、需求归集、中标摘要展示。
- 卖家端新增“可参与集采项目”“我的报价”能力。
- 卖家端支持报名、提交报价、查看已中标/未中标状态。

### Out of Scope

- 买家在线签署合同。
- 多轮报价倒计时竞拍。
- 供应商端复杂评分解释和 AI 评标报告。

## 交互与页面影响

- 受影响页面:
  - `apps/buyer-app/src/pages/Procurement`
  - `apps/buyer-app/src/pages/ProcurementDetail`
  - `apps/buyer-app/src/pages/GroupProcurementModule`
  - `apps/seller-app/src/pages/GroupProcurement`
- 新增页面:
  - 如有必要新增卖家报价详情或列表子页
- 路由变化:
  - `/procurement`、`/procurement/:id` 改为项目视图
  - 卖家端 `/group-procurement` 改为项目/报价工作台
- 菜单变化:
  - 保持现有“集采大厅”“集采申请”入口文案，避免商城导航大改

## 数据与接口影响

- 受影响 API:
  - 新增 procurement project / enrollment / quote 接口调用
  - 兼容旧 requestGroupProcurement 申请入口
- 请求/响应变化:
  - 项目详情需返回报价摘要、中标摘要、卖家报名状态
- 环境变量变化:
  - 无

## 权限影响

- 受影响角色:
  - 买家企业
  - 卖家企业
- 新增/调整权限:
  - 无新增 capability，沿用 `procurement` 和 `sales`

## 验收标准

1. 买家端能从商城内查看集采竞价项目进度，不再只看到单卖家团购活动。
2. 卖家端能在平台内查看可参与项目并提交报价。
3. 项目定标后，买家端和卖家端都能看到正确的中标/成单状态。
