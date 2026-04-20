# Release Checklist Template

## 发布基本信息

- Feature ID:
- 发布负责人:
- 目标环境:

## 发布前检查

- [ ] `./harness/release.sh docs/features/<feature-id>` 已通过
- [ ] `./harness/verify.sh` 已通过
- [ ] 如涉及配套应用仓，相关 lint/build/测试已通过
- [ ] 已确认环境变量、CI 或跨仓依赖
- [ ] 已确认 smoke test 范围

## 回滚信息

- 回滚目标版本:
- 回滚步骤:
- 回滚后验证:

## 发布后验证

- [ ] 入口文档与脚本输出一致
- [ ] 如涉及配套应用仓，补充页面/接口验证项
