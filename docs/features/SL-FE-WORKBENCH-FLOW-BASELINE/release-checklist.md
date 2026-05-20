# Release Checklist

## 发布基本信息

- Feature ID: `SL-FE-WORKBENCH-FLOW-BASELINE`
- 发布负责人: Codex
- 目标环境: 本地开发 / 测试联调环境

## 发布前检查

- [ ] `./harness/release.sh docs/features/SL-FE-WORKBENCH-FLOW-BASELINE` 已通过
- [ ] `./harness/verify.sh` 已通过
- [ ] 受影响前端应用 build 已通过
- [ ] 已确认无接口、数据库、环境变量、部署脚本变更
- [ ] 已确认买家、卖家、仓储、资金方工作台核心订单列表 smoke 范围
- [ ] 已确认未知状态兜底展示仍可用
- [ ] 已确认回滚方式

## 回滚信息

- 回滚目标版本: 发布前版本
- 回滚步骤: 回退本 feature 对状态映射和 feature 文档的改动
- 回滚后验证: 重新执行 `./harness/verify.sh` 和受影响应用 build
