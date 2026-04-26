# Release Checklist: AI采购流程

## 发布基本信息

- Feature ID: SL-FE-AI-PROCUREMENT
- 发布负责人: AI agent
- 目标环境: Web 买家端

## 发布前检查

- [ ] `./harness/release.sh docs/features/SL-FE-AI-PROCUREMENT` 已通过
- [ ] `./harness/verify.sh` 已通过
- [ ] `pnpm --filter @steellink/buyer-app lint` 已通过
- [ ] `pnpm --filter @steellink/buyer-app build` 已通过
- [ ] 已确认无新增环境变量、CI 或跨仓依赖
- [ ] 已确认 smoke test 范围: 顶部导航、首页服务区、footer、`/matching`、`/ai-procurement`

## 回滚信息

- 回滚目标版本: 上一稳定前端版本
- 回滚步骤: 回滚本 feature 涉及的 AI采购页面、路由、导航、首页、footer 和文档变更
- 回滚后验证: 重新执行买家端构建，并确认现货商城、供求信息、竞价交易、集采大厅入口保持可用

## 发布后验证

- [ ] 顶部导航展示“供求信息”和“AI采购”，不再展示旧 `/supply` tag
- [ ] `/matching` 页面标题为“供求信息”
- [ ] `/ai-procurement` 页面可访问并展示采购对话示例
- [ ] AI采购五阶段可视化完整展示
