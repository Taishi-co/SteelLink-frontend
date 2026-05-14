# Product Taxonomy Structure Spec

## 基本信息

- Feature ID: SL-FE-PRODUCT-TAXONOMY-STRUCTURE
- Feature 名称: 卖家商品行业字段结构化
- 负责人: Codex
- 目标上线环境: seller-app

## 背景

卖家发布商品需要按钢贸行业习惯录入品种、牌号、规格、产地、存放地。当前卖家端只录入文本品类、材质和原始规格，无法承接后续台账/截图 AI 批量识别的标准字段。

## 范围

### In Scope

- 卖家商品发布和编辑表单展示品种、牌号、产地、存放地字段。
- 规格拆分为厚度/直径/高度、宽度/壁厚、长度类型和值。
- 表单提交 `category_id`、`grade_id`、`steel_mill_id` 和结构化规格字段，同时保留旧文本字段。
- 商品列表和详情展示行业字段。
- 捆包号允许重复，前端文案不再提示唯一。

### Out of Scope

- 不实现 AI 批量导入页面。
- 不实现运营端主数据维护页面。
- 不调整买家端商品检索页面。

## 接口与数据影响

- 受影响页面:
  - `apps/seller-app/src/pages/Products/index.tsx`
- 受影响服务:
  - `apps/seller-app/src/services/productService.ts`
  - `apps/seller-app/src/services/categoryService.ts`
- 受影响路由: 无新增前端路由。
- 配置或环境变量变化: 无。
- Docker / 部署影响: 无。

## 权限与合规影响

- 受影响角色: 卖家。
- 新增/调整权限: 无。
- 是否影响审核、风控、日志留痕: 商品关键字段提交后仍由后端置为待审核。

## 验收标准

1. 卖家发布商品时可以录入品种、牌号、规格、产地、存放地。
2. 编辑商品时可以回显结构化规格和主数据 ID。
3. 表单提交仍兼容旧后端字段。
4. 捆包号输入不再提示唯一。
