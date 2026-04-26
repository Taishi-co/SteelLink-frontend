# COS Object Storage Uploads Frontend Release Checklist

## 发布基本信息

- Feature ID: SL-STORAGE-COS-UPLOAD
- 发布负责人: Codex
- 目标环境: staging, prod

## 发布前检查

- [ ] `./harness/release.sh docs/features/SL-STORAGE-COS-UPLOAD` 已通过
- [ ] `./harness/verify.sh` 已通过
- [ ] `pnpm --filter @steellink/buyer-app build` 已通过
- [ ] `pnpm --filter @steellink/seller-app build` 已通过
- [ ] 已确认后端 `POST /api/v1/uploads` 已部署
- [ ] 已确认后端 COS 密钥、桶名、地域配置完整
- [ ] 已确认 smoke test 范围

## 回滚信息

- 回滚目标版本: 合并前主干版本
- 回滚步骤: 回滚前端上传 service 与页面调用，重新部署 buyer/seller 应用
- 回滚后验证: 商品发布、支付凭证、签收凭证恢复到回滚版本行为

## 发布后验证

- [ ] 卖家端商品发布可上传商品主图
- [ ] 买家端支付凭证可上传
- [ ] 买家端签收凭证可上传
- [ ] 商城首页商品主图正常显示
