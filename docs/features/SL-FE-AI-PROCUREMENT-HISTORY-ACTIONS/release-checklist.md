# AI采购历史操作按钮 Release Checklist

## 发布基本信息

- Feature ID: SL-FE-AI-PROCUREMENT-HISTORY-ACTIONS
- 发布负责人: Codex
- 目标环境: buyer-app production

## 发布前检查

- [ ] `./harness/release.sh docs/features/SL-FE-AI-PROCUREMENT-HISTORY-ACTIONS` 已通过
- [ ] `./harness/verify.sh` 已通过
- [ ] `pnpm --filter @steellink/buyer-app lint` 已通过
- [ ] `pnpm --filter @steellink/buyer-app build` 已通过
- [ ] 已确认环境变量、CI 或跨仓依赖
- [ ] 已确认 smoke test 范围
- [ ] GitHub PR 创建后，已执行 `./harness/lark-pr-doc.sh docs/features/SL-FE-AI-PROCUREMENT-HISTORY-ACTIONS --pr-url <github-pr-url> --pr-title "<pr-title>"` 并写入共享飞书 PR 记录

## 回滚信息

- 回滚目标版本: 合并前主干版本
- 回滚步骤: revert 本 feature PR
- 回滚后验证: 进入 AI采购首页确认历史列表恢复原行为，buyer-app build 通过

## 发布后验证

- [ ] 登录买家端后，“我的AI采购”历史记录展示三个操作按钮
- [ ] “再买一次”填回原采购对话并可重新解析
- [ ] “查看详情”进入历史详情
- [ ] “复制”复制原采购对话或显示失败提示
