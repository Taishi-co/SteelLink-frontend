# COS Object Storage Uploads Frontend Spec

## 基本信息

- Feature ID: SL-STORAGE-COS-UPLOAD
- Feature 名称: 文件上传前端接入
- 负责人: Codex
- 目标上线环境: staging, prod

## 背景

买家端支付凭证、签收凭证目前仍通过手填 URL 提交，卖家端商品发布也只是本地选择文件但未上传到对象存储。后端新增统一上传接口后，前端需要先上传文件并将返回的真实 URL 写入现有业务接口。

## 范围

### In Scope

- 卖家端商品发布上传商品主图与审核资料。
- 买家端订单详情上传支付凭证和签收凭证。
- 买家端企业认证上传营业执照和平台服务资质资料。
- 买家端商城首页展示商品主图。
- 增加 buyer/seller 两端上传 service。

### Out of Scope

- 管理端文件上传改造。
- 私有桶凭证文件签名预览。
- 大文件分片上传、图片裁剪压缩。

## 交互与页面影响

- 受影响页面:
  - `apps/seller-app/src/pages/Products/index.tsx`
  - `apps/buyer-app/src/pages/OrderDetail/index.tsx`
  - `apps/buyer-app/src/pages/Enterprise/index.tsx`
  - `apps/buyer-app/src/pages/Mall/index.tsx`
- 新增页面: 无
- 路由变化: 无
- 菜单变化: 无

## 数据与接口影响

- 受影响 API:
  - `POST /api/v1/uploads`
  - `POST /api/v1/enterprises`
  - `POST /api/v1/enterprises/:id/verify`
  - `POST /api/v1/products`
  - `POST /api/v1/orders/:id/payment-voucher`
  - `POST /api/v1/orders/:id/confirm-receipt`
- 请求/响应变化:
  - 商品发布请求新增 `images` 与 `quality_cert`
  - 支付/签收仍提交 URL，但 URL 来源改为上传接口返回值
- 环境变量变化: 无前端环境变量变更；后端需配置 COS 密钥。

## 权限影响

- 受影响角色: 买家、卖家。
- 新增/调整权限: 无前端路由权限变化，上传接口依赖后端登录态鉴权。

## 验收标准

1. 卖家发布商品时，商品主图和审核资料上传成功后再提交审核。
2. 买家上传支付凭证时不再手填 URL。
3. 买家确认收货时不再手填签收凭证 URL。
4. 商城首页热门商品优先显示真实商品主图。
5. 创建物流商企业时，营业执照、运输许可证、承运资质均可上传图片或 PDF，并将返回 URL 写入企业认证资料。
