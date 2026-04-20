# SL-FE-PERF-CI-AUTO Release Checklist

## 发布基本信息

- Feature ID: `SL-FE-PERF-CI-AUTO`
- 发布负责人: Codex
- 目标环境: frontend performance/workflow baseline

## 发布前检查

- [ ] `./harness/release.sh docs/features/SL-FE-PERF-CI-AUTO` 已通过
- [ ] `./harness/verify.sh` 已通过
- [ ] 已确认 PR 模板中的 feature 字段可被脚本解析
- [ ] 已确认 review / release 默认目录与 feature 文档一致
- [ ] 已确认 smoke test / CI 接入范围

## 回滚信息

- 回滚目标版本: feature 目录自动解析变更前的版本
- 回滚步骤: 回退 `harness/resolve-feature-dir.sh`、`harness/review.sh`、`harness/release.sh` 与当前 feature 文档
- 回滚后验证: 重新执行 `./harness/resolve-feature-dir.sh`、`./harness/review.sh`、`./harness/release.sh`

## 发布后验证

- [ ] CI 在 PR 场景能识别 feature 目录
- [ ] 本地在无参数场景能正确执行 review gate
- [ ] 本地在无参数场景能正确执行 release gate
