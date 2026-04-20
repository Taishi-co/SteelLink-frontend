# Review Rules

Review 不是只看代码风格，而是确认“实现是否符合设计、验证是否足够、上线风险是否可控”。

## Review 输入

发起 review 前必须提供：

- feature 文档目录
- `spec.md`
- `test-cases.md`
- `implementation-plan.md`
- `./harness/verify.sh` 的结果
- 若需求涉及配套前端应用仓，还需说明实际代码落点与应用级验证结果

## 阻断项

以下任一项未满足，应阻断合并：

- 缺少 feature 文档
- `./harness/verify.sh` 未通过
- 当前工作区存在 `package.json` 但 `npm run lint` 或 `npm run build` 未通过
- 需求实现与 `spec.md` 不一致
- 测试用例未覆盖主要 happy path 与关键异常 path
- 涉及权限变更但未核对权限矩阵或外部权限配置落点
- 涉及发布或环境变量改动但未更新 `release-checklist.md`

## Review 关注点

- 是否改动了错误的边界层
- 是否引入重复规则、硬编码路径或误导性文档描述
- 是否遗漏权限控制、异常态、外部依赖说明
- 是否存在不可回滚或不可观测的上线风险

## 建议输出格式

1. 结论：通过 / 需修改
2. 发现：按严重度列出问题
3. 风险：上线前仍需关注的点
