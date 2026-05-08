# Seller Warehouse Binding Frontend Feature Spec

## 基本信息

- Feature ID: SL-FE-SELLER-WAREHOUSE-BINDING
- Feature 名称: 卖家仓库管理与商品仓库绑定前端适配
- 负责人: Codex
- 目标上线环境: seller-app production

## 背景

卖家商品已经可携带发货仓库快照，买家下单、AI采购物流仓储匹配会读取该仓库信息。卖家端缺少直接维护自有仓库的入口，商品发布页也没有优先加载卖家自有仓库，导致卖家需要先去其他端维护仓库或手动填写。

## 范围

### In Scope

- 卖家后台新增“仓库管理”菜单和 `/warehouses` 页面。
- 卖家可新增、编辑、停用自有仓库资源，并查看审核状态。
- 商品发布页加载平台已审核仓库和卖家自有仓库；未审核仓库在下拉中展示但不可绑定。
- 选择仓库后自动回填 `warehouseServiceId` 和仓库快照字段。

### Out of Scope

- 不新增后端字段。
- 不改变运营端仓库审核流程。
- 不改变买家端订单和 AI采购展示逻辑。

## 交互与页面影响

- 受影响页面:
  - `apps/seller-app/src/pages/Warehouses/index.tsx`
  - `apps/seller-app/src/pages/Products/index.tsx`
- 新增页面: `/warehouses`
- 路由变化: seller-app 新增受企业认证保护的 `/warehouses` 路由。
- 菜单变化: 卖家后台侧边栏新增“仓库管理”。

## 数据与接口影响

- 受影响 API:
  - `GET /warehouse-services/mine`
  - `POST /warehouse-services`
  - `PUT /warehouse-services/:id`
  - `DELETE /warehouse-services/:id`
  - `GET /warehouse-services`
- 请求/响应变化: 无字段变化。
- 环境变量变化: 无。

## 权限影响

- 受影响角色: 已认证且已入驻企业的卖家。
- 新增/调整权限: 前端调用依赖后端允许 `sales` 企业维护自有仓库资源；未登录或未入驻企业仍被 seller-app 路由保护拦截。

## 验收标准

1. 卖家后台侧边栏展示“仓库管理”，进入后可查看自有仓库列表和状态。
2. 卖家可新增、编辑、停用仓库，保存后列表刷新。
3. 商品发布页仓库下拉包含卖家自有仓库，未审核仓库显示“待审核”且不可选择。
4. 选择已审核仓库后，商品表单自动回填仓储资源 ID、仓库名称、编码、地区和地址。
