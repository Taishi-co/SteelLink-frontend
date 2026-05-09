# Revert 910b486 Test Cases

## 测试范围

- Feature ID: SL-FE-REVERT-910B486
- 测试负责人: Codex

## Happy Path

| 编号 | 场景 | 前置条件 | 步骤 | 期望结果 |
| --- | --- | --- | --- | --- |
| TC-01 | 反向提交可应用 | 从最新 `origin/main` 拉出修复分支 | 执行 `git revert 910b4861137e4d10ddbd4fb4cd2d9bdaf0bbb760` | revert 无冲突完成并生成反向提交 |
| TC-02 | buyer-app 构建验证 | 已安装依赖 | 执行仓库验证入口 | buyer-app 相关 TypeScript 与构建检查通过 |
| TC-03 | 仓储 Dashboard 文件恢复 | 修复分支包含 revert | 检查 `apps/buyer-app/src/pages/Dashboard/Warehouse.tsx` | 文件重新存在并纳入本次 diff |

## Exception Path

| 编号 | 场景 | 前置条件 | 步骤 | 期望结果 |
| --- | --- | --- | --- | --- |
| TC-EX-01 | 后续 main 改动与 revert 冲突 | `origin/main` 已包含后续同文件改动 | 执行 revert | 若出现冲突，逐文件保留最新 main 中非 910b486 需求并恢复被错误提交删除的实现 |

## 权限测试

| 编号 | 角色 | 场景 | 期望结果 |
| --- | --- | --- | --- |
| TC-AUTH-01 | 买家用户 | 访问 buyer-app 受影响页面 | 不新增权限要求，沿用现有买家访问控制 |

## 回归关注点

- AI 采购页、购物车页、商品列表页和 Dashboard 服务页是否恢复到错误提交前的功能范围
- 后续已合入的 Dashboard 服务入口独立工作台修复是否仍保留
- 新增的 revert 是否只抵消 `910b486`，不夹带当前其他工作区改动
