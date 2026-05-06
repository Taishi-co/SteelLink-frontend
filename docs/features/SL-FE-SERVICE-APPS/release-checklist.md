# Release Checklist

## 发布基本信息

- Feature ID: SL-FE-SERVICE-APPS
- 发布负责人: Codex
- 目标环境: 前端预览环境

## 发布前检查

- [x] `./harness/release.sh docs/features/SL-FE-SERVICE-APPS` 已通过
- [x] `./harness/verify.sh` 已通过
- [x] buyer-app build 已通过
- [x] 已确认本阶段不新增独立生产应用，只进入 buyer-app dashboard 路由
- [x] 已确认 smoke test 范围
- [x] GitHub PR 创建后，已执行 `./harness/lark-pr-doc.sh docs/features/SL-FE-SERVICE-APPS --pr-url https://github.com/Taishi-co/SteelLink-frontend/pull/39 --pr-title "feat: add service platform frontend apps"` 并写入共享飞书 PR 记录
- 飞书 PRD/PR 记录: https://www.feishu.cn/wiki/Nmv3wyCnYiJ8qxkWfIxcUJB3nwd

## 回滚信息

- 回滚目标版本: 合并前版本
- 回滚步骤: 回滚买家端服务市场、dashboard 服务入口、服务面板和路由改动
- 回滚后验证: `pnpm --filter @steellink/buyer-app build`

## 发布后验证

- [x] 买家端 `/service-market` 可访问
- [x] 服务入口 `/dashboard/services` 可访问
- [x] 物流平台 `/dashboard/logistics` 可访问
- [x] 仓储平台 `/dashboard/warehouse` 可访问
- [x] 资金服务平台 `/dashboard/finance` 可访问
