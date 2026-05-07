# SL-FE-SERVICE-MARKET-FULFILLMENT-INTAKE Release Checklist

## 发布基本信息

- Feature ID: SL-FE-SERVICE-MARKET-FULFILLMENT-INTAKE
- 发布负责人: Codex
- 目标环境: prod

## 发布前检查

- [ ] `./harness/release.sh docs/features/SL-FE-SERVICE-MARKET-FULFILLMENT-INTAKE` 已通过
- [ ] `./harness/verify.sh` 已通过
- [ ] 如涉及配套应用仓，相关 lint/build/测试已通过
- [ ] 已确认环境变量、CI 或跨仓依赖
- [ ] 已确认 smoke test 范围
- [ ] GitHub PR 创建后，已执行 `./harness/lark-pr-doc.sh docs/features/SL-FE-SERVICE-MARKET-FULFILLMENT-INTAKE --pr-url <github-pr-url> --pr-title "<pr-title>"` 并写入共享飞书 PR 记录

## 回滚信息

- 回滚目标版本: 合并前前端稳定版本
- 回滚步骤: 回滚本 PR
- 回滚后验证: `/service-market` 恢复资源展示和详情跳转

## 发布后验证

- [ ] 四类服务市场动作入口可打开
- [ ] 提交动作命中真实后端接口
