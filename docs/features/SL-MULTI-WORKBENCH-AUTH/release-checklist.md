# 多工作台会话切换发布检查

## 发布基本信息

- Feature ID: SL-MULTI-WORKBENCH-AUTH
- 发布负责人: Codex
- 目标环境: staging/prod

## 发布前检查

- [x] `./harness/release.sh docs/features/SL-MULTI-WORKBENCH-AUTH` 已通过
- [x] `./harness/verify.sh` 已通过
- [x] 前端应用 typecheck 已通过
- [x] `pnpm --filter @steellink/buyer-app build` 已通过
- [x] 已确认后端需要同步支持扩展后的 `switch-session target`
- [ ] 已确认 smoke test 范围
- [ ] GitHub PR 创建后，已执行 `./harness/lark-pr-doc.sh docs/features/SL-MULTI-WORKBENCH-AUTH --pr-url <github-pr-url> --pr-title "<pr-title>"` 并写入共享飞书 PR 记录

## 回滚信息

- 回滚目标版本: 当前生产版本
- 回滚步骤: 回滚本 PR，恢复各工作台原始 token 读取和跳转逻辑
- 回滚后验证: 登录后进入买家端、卖家端、服务商工作台，确认页面可打开

## 发布后验证

- [ ] 企业多服务能力入口展示正确
- [ ] 物流、仓储、资金方工作台通过 `switch_token` 建立会话
- [ ] 过期本地工作台 token 不再触发 `2000003 token expired`
