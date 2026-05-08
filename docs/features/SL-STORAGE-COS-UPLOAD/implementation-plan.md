# COS Object Storage Uploads Frontend Implementation Plan

## Feature 信息

- Feature ID: SL-STORAGE-COS-UPLOAD
- 开发负责人: Codex

## 变更范围

- 代码文件:
  - `apps/buyer-app/src/services/uploadService.ts`
  - `apps/buyer-app/src/pages/Enterprise/index.tsx`
  - `apps/buyer-app/src/pages/OrderDetail/index.tsx`
  - `apps/buyer-app/src/pages/Mall/index.tsx`
  - `apps/seller-app/src/services/uploadService.ts`
  - `apps/seller-app/src/services/productService.ts`
  - `apps/seller-app/src/pages/Products/index.tsx`
- 文档文件:
  - `docs/features/SL-STORAGE-COS-UPLOAD/*`
- 配置文件: 无
- 脚本文件: 无

## 实施步骤

1. 为 buyer/seller 应用新增上传 service，封装 `multipart/form-data` 调用。
2. 改造卖家商品发布，在提交商品前上传主图和审核资料，并传入 URL。
3. 改造买家订单详情，支付凭证和签收凭证改为文件选择并上传。
4. 改造商城首页热门商品卡片，优先展示商品主图。
5. 合并最新主干订单时间线改动，确保上传改造不覆盖状态展示。
6. 企业认证页营业执照允许选择图片或 PDF，服务资质继续使用 `enterprise_service_document` 上传。

## 验证计划

- `./harness/branch-guard.sh local`
- `./harness/verify.sh`
- `pnpm --filter @steellink/buyer-app build`
- `pnpm --filter @steellink/seller-app build`
- `./harness/review.sh docs/features/SL-STORAGE-COS-UPLOAD`
- `./harness/release.sh docs/features/SL-STORAGE-COS-UPLOAD`
- 人工验证: 使用真实 COS 配置进行上传 smoke test。
- 人工验证补充: 创建物流商企业时上传营业执照、运输许可证、承运资质。

## 风险与回滚关注点

- 私有桶 URL 如果不能公开访问，前端详情页点击查看可能需要后端签名 URL 能力。
- 上传失败时必须阻止后续业务提交，避免再次写入占位 URL。
- 回滚时恢复输入 URL 表单和商品发布不传 `images/quality_cert` 的旧行为。
