# Product AI Batch Import Implementation Plan

## Feature 信息

- Feature ID: SL-FE-PRODUCT-AI-BATCH-IMPORT
- 开发负责人: Codex

## 变更范围

- 代码文件:
  - `apps/seller-app/src/pages/Products/index.tsx`
  - `apps/seller-app/src/services/productService.ts`
- 文档文件:
  - `docs/features/SL-FE-PRODUCT-AI-BATCH-IMPORT/*`
- 配置文件: 无

## 实施步骤

1. 扩展商品服务，增加批量导入解析和确认接口。
2. `/seller/products` 商品管理页增加 AI 批量导入弹窗。
3. 将识别结果渲染为可编辑表格。
4. 确认添加后刷新商品列表，失败行留在弹窗中继续编辑。
5. 执行 seller-app 构建和 release gate。

## 验证计划

- `pnpm --filter @steellink/seller-app build`
- `./harness/release.sh docs/features/SL-FE-PRODUCT-AI-BATCH-IMPORT`
- 需要的人工验证: 打开 `/seller/products`，使用真实台账上传并确认添加草稿商品。

## 风险与回滚关注点

- 图片识别依赖后端模型配置。
- 默认保存草稿，避免缺少图片和审核资料的商品直接上架。
- 回滚前端后不影响已导入商品。
