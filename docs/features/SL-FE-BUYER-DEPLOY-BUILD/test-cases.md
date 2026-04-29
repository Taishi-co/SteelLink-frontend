# Test Cases

## 测试范围

- Feature ID: SL-FE-BUYER-DEPLOY-BUILD
- 测试负责人: Codex

## Happy Path

| 编号 | 场景 | 前置条件 | 步骤 | 期望结果 |
| --- | --- | --- | --- | --- |
| TC-01 | buyer-app 生产构建 | 已安装 pnpm 依赖 | 执行 `pnpm --filter @steellink/buyer-app build` | TypeScript 与 Vite 构建通过 |
| TC-02 | 采购清单汇总 | 购物车存在商品 | 打开采购清单页 | 页面按全部购物车商品展示总重量、总价与结算按钮 |
| TC-03 | 企业入驻介绍页构建 | 项目源码完整 | 执行 buyer-app build | `EnterpriseIntro` 不再出现未使用变量错误 |

## Exception Path

| 编号 | 场景 | 前置条件 | 步骤 | 期望结果 |
| --- | --- | --- | --- | --- |
| TC-EX-01 | 空购物车结算 | 购物车为空 | 点击采购清单页结算入口 | 按空状态禁用或提示，不进入错误状态 |

## 权限测试

| 编号 | 角色 | 场景 | 期望结果 |
| --- | --- | --- | --- |
| TC-AUTH-01 | buyer | 访问采购清单页 | 页面按现有路由权限正常访问 |

## 回归关注点

- 购物车多选能力当前不在类型/API 契约中，后续如恢复需要扩展完整数据链路。
- Docker 构建仍需在生产部署流水线中重跑确认。
