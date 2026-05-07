# SL-FE-SERVICE-MARKET-FULFILLMENT-INTAKE Spec

## 基本信息

- Feature ID: SL-FE-SERVICE-MARKET-FULFILLMENT-INTAKE
- Feature 名称: 服务市场真实履约入口联调
- 负责人: Codex
- 目标上线环境: prod

## 背景

`/service-market` 需要覆盖四类真实业务：已有货物找物流并保障履约、已有货物租仓存放、闲置仓库上架出租、物流商上架物流资源。

## 范围

### In Scope

- 服务市场增加运输委托弹窗，调用 `POST /logistics/orders`，可同步创建履约保障。
- 服务市场增加租仓托管弹窗，调用 `POST /warehouse-storage-requests`。
- 服务市场增加仓库上架弹窗，调用 `POST /warehouse-services`。
- 服务市场增加物流上架弹窗，调用 `POST /logistics-services`。
- 已审核资源表格增加按资源发起委托/托管操作。

### Out of Scope

- 不新增服务商专属工作台页面；继续复用 `/dashboard/warehouse-resources` 和 `/dashboard/logistics-resources`。
- 不实现正式报价确认流。

## 交互与页面影响

- 受影响页面: `/service-market`
- 新增页面: 无
- 路由变化: 无
- 菜单变化: 无

## 数据与接口影响

- 受影响 API:
  - `GET /warehouse-services`
  - `GET /logistics-services`
  - `POST /logistics/orders`
  - `POST /fulfillment-guarantees`
  - `POST /warehouse-storage-requests`
  - `POST /warehouse-services`
  - `POST /logistics-services`
- 请求/响应变化: 新增前端 service 封装方法
- 环境变量变化: 无

## 权限影响

- 受影响角色: 买家企业用户、仓储服务商、物流服务商
- 新增/调整权限: 无前端路由权限新增；提交动作依赖后端服务能力校验

## 验收标准

1. 用户可在 `/service-market` 对物流资源提交运输委托。
2. 用户可对仓储资源提交租仓托管需求。
3. 仓储方可在服务市场提交仓库出租资源。
4. 物流方可在服务市场提交物流线路资源。
