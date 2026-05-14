# Product AI Batch Import Spec

## 基本信息

- Feature ID: SL-FE-PRODUCT-AI-BATCH-IMPORT
- Feature 名称: 卖家商品 AI 批量导入
- 负责人: Codex
- 目标上线环境: seller-app

## 背景

卖家商品台账通常来自 Excel、CSV 或截图。卖家端需要提供上传入口，展示后端识别出的商品草稿，允许商家修改错误字段后再批量添加。

## 范围

### In Scope

- 商品管理页新增 AI 批量导入入口。
- 支持上传台账、表格或截图，并调用后端解析接口。
- 将识别结果展示为可编辑表格。
- 支持删除错误行、修改品种、牌号、规格、产地、存放地、库存、价格等字段。
- 确认后调用后端批量创建接口，默认保存为草稿，可选择直接提交审核。

### Out of Scope

- 不实现导入历史列表。
- 不在本阶段做逐行图片批量上传。
- 不调整买家端检索页面。

## 接口与数据影响

- 受影响页面:
  - `/seller/products`
  - `apps/seller-app/src/pages/Products/index.tsx`
- 受影响服务:
  - `apps/seller-app/src/services/productService.ts`
- 新增后端依赖:
  - `POST /products/batch-import/parse`
  - `POST /products/batch-import/confirm`

## 权限与合规影响

- 受影响角色: 卖家。
- 新增/调整权限: 无。
- 审核影响: 默认创建草稿；直接提交审核时走后端校验。

## 验收标准

1. `/seller/products` 商品管理页可打开 AI 批量导入弹窗。
2. 上传台账后展示识别行和置信度。
3. 商家可以编辑识别结果并删除错误行。
4. 点击确认添加后商品列表刷新。
5. 后端返回失败行时保留失败行供继续修改。
