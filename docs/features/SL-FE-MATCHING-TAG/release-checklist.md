# Release Checklist: 信息撮合工作台

## 发布基本信息

- Feature ID: SL-FE-MATCHING-TAG
- 发布负责人: AI agent
- 目标环境: Web 买家端

## 发布前检查

- [ ] `./harness/release.sh docs/features/SL-FE-MATCHING-TAG` 已通过
- [ ] `./harness/verify.sh` 已通过
- [ ] `pnpm --filter @steellink/buyer-app build` 已通过
- [ ] 已确认无新增环境变量、CI 或跨仓依赖
- [ ] 已确认 smoke test 范围: 顶部导航、首页服务卡片、footer 入口、`/matching` 数据看板、AI 推荐、我的发布、四类信息板块

## 回滚信息

- 回滚目标版本: 上一稳定前端版本
- 回滚步骤: 回滚本 feature 涉及的买家端信息撮合页面、导航、路由、首页、footer 和 feature 文档变更
- 回滚后验证: 重新执行买家端构建，并确认现货商城、竞价交易、集采大厅、供求信息入口保持原有行为

## 发布后验证

- [ ] 顶部导航展示“信息撮合”，位置在“现货商城”和“竞价交易”之间
- [ ] `/matching` 页面可访问并展示数据看板
- [ ] AI 智能撮合推荐、我的发布、发布与服务、信息板块均展示
- [ ] 首页平台服务和 footer 平台服务入口顺序一致
