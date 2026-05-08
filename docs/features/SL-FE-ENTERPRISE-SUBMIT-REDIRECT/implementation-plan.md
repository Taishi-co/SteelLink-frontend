# 企业认证提交后返回个人工作台实施计划

## Feature 信息

- Feature ID: SL-FE-ENTERPRISE-SUBMIT-REDIRECT
- 开发负责人: Codex

## 变更范围

- 代码文件: `apps/buyer-app/src/pages/Enterprise/index.tsx`
- 文档文件: `docs/features/SL-FE-ENTERPRISE-SUBMIT-REDIRECT/*`
- 配置文件: 无
- 脚本文件: 无

## 实施步骤

1. 在企业认证创建和重新提交成功分支中保留成功提示。
2. 成功刷新用户与企业信息后，通过 `navigate('/dashboard', { replace: true })` 返回个人工作台。
3. 补充 feature 规格、测试用例和发布检查说明。

## 验证计划

- `./harness/verify.sh`
- `pnpm --filter @steellink/buyer-app build`
- 人工验证: 在浏览器访问 `/dashboard/enterprise`，模拟成功提交后确认跳转到 `/dashboard`。

## 风险与回滚关注点

- 若成功后立即返回工作台导致用户无法查看审核中详情，可从个人工作台再次进入企业信息页查看状态。
- 回滚时移除成功分支中的 `navigate('/dashboard', { replace: true })`。
