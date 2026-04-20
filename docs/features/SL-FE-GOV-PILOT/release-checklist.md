# SL-FE-GOV-PILOT Release Checklist

## 发布基本信息

- Feature ID: `SL-FE-GOV-PILOT`
- 发布负责人: Codex
- 目标环境: frontend governance baseline / staging

## 发布前检查

- [ ] `./harness/release.sh docs/features/SL-FE-GOV-PILOT` 已通过
- [ ] `./harness/verify.sh` 已通过
- [ ] 已确认当前变更仅作用于治理仓，不直接发布业务页面
- [ ] 已确认涉及配套前端应用仓的外部依赖说明
- [ ] 已确认 smoke test / 交接范围

## 回滚信息

- 回滚目标版本: 回滚到本次治理文档清理前的提交
- 回滚步骤: 回退 `AGENTS.md`、`CLAUDE.md`、`docs/`、`harness/`
- 回滚后验证: 重新执行 `./harness/verify.sh`、`./harness/review.sh docs/features/SL-FE-GOV-PILOT`

## 发布后验证

- [ ] 新 agent 可按入口文档完成上手
- [ ] `harness/` 脚本输出与文档描述一致
- [ ] 外部依赖和人工验证点已写明
