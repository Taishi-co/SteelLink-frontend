# Home Real Stats Release Checklist

## 发布基本信息

- Feature ID: SL-FE-HOME-REAL-STATS
- 发布负责人: Codex
- 目标环境: production

## 发布前检查

- [ ] `./harness/release.sh docs/features/SL-FE-HOME-REAL-STATS` 已通过
- [x] `./harness/verify.sh` 已通过
- [x] `pnpm --filter @steellink/buyer-app build` 已通过
- [x] 已确认环境变量、CI 或跨仓依赖: 依赖后端 `GET /api/v1/platform/stats`
- [x] 已确认 smoke test 范围: 买家端首页统计区、公开访问、接口失败降级
- [ ] GitHub PR 创建后，已执行 `./harness/lark-pr-doc.sh docs/features/SL-FE-HOME-REAL-STATS --pr-url <github-pr-url> --pr-title "<pr-title>"` 并写入共享飞书 PR 记录

## 回滚信息

- 回滚目标版本: 上一稳定前端版本
- 回滚步骤: 回滚首页统计接口接入与新增 service
- 回滚后验证: 首页 `/` 可正常渲染

## 发布后验证

- [ ] 首页统计值与 `/api/v1/platform/stats` 响应一致
- [ ] 未登录访问首页不会跳转登录
