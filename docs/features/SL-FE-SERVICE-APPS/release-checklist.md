# Release Checklist

## 发布基本信息

- Feature ID: SL-FE-SERVICE-APPS
- 发布负责人: Codex
- 目标环境: 前端预览环境
- 本次变更: 物流与仓储业务逻辑前端深化

## 发布前检查

- [x] `./harness/release.sh docs/features/SL-FE-SERVICE-APPS` 已通过
- [x] `./harness/verify.sh` 已通过
- [x] buyer-app build 已通过
- [x] seller-app build 已通过
- [x] buyer-app lint 已通过
- [x] seller-app lint 已通过
- [x] 已完成服务器真实接口 smoke test
- [x] 已确认本阶段不新增独立生产应用，只进入 buyer-app dashboard 路由
- [x] 已确认 smoke test 范围
- [x] GitHub PR 创建后，已执行 `./harness/lark-pr-doc.sh docs/features/SL-FE-SERVICE-APPS --pr-url https://github.com/Taishi-co/SteelLink-frontend/pull/43 --pr-title "feat: adapt logistics warehouse fulfillment frontend"` 并写入共享飞书 PR 记录
- 飞书 PRD/PR 记录: https://www.feishu.cn/wiki/Mzz5wxUzKiJ4mAkyOluchvQ6nje

## 回滚信息

- 回滚目标版本: 合并前版本
- 回滚步骤: 回滚物流仓储接口封装、买家下单/订单详情物流仓储适配、物流/仓储 dashboard 深化、卖家商品仓库绑定 UI 和 feature 文档改动
- 回滚后验证: `pnpm --filter @steellink/buyer-app build`、`pnpm --filter @steellink/seller-app build`

## 发布后验证

- [x] 买家端 `/service-market` 可访问
- [x] 服务入口 `/dashboard/services` 可访问
- [x] 物流平台 `/dashboard/logistics` 可访问
- [x] 仓储平台 `/dashboard/warehouse` 可访问
- [x] 资金服务平台 `/dashboard/finance` 可访问
- [x] 买家下单页展示仓库绑定、推荐物流商和物流平台找车入口
- [x] 买家订单详情页展示物流仓储履约追踪
- [x] 卖家商品发布弹窗可选择平台登记仓库并回填仓库信息
