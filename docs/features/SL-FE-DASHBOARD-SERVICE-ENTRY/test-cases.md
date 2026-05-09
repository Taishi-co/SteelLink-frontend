# SL-FE-DASHBOARD-SERVICE-ENTRY Test Cases

## 测试范围

- Feature ID: SL-FE-DASHBOARD-SERVICE-ENTRY
- 测试负责人: Codex

## Happy Path

| 编号 | 场景 | 前置条件 | 步骤 | 期望结果 |
| --- | --- | --- | --- | --- |
| TC-01 | 物流入口展示与跳转 | 企业已开通 `logistics` 能力，状态为 2 | 访问 `/dashboard`，点击“进入物流管理中心” | 页面跳转到 `/logistics/` |
| TC-02 | 仓储入口展示与跳转 | 企业已开通 `warehouse` 能力，状态为 2 | 访问 `/dashboard`，点击“进入仓储管理中心” | 页面跳转到 `/warehouse/` |
| TC-03 | 物流独立工作台概览 | 账户具备物流服务商能力 | 访问 `/logistics/` | 默认展示工作台概览，可进入物流竞价、物流订单、运力资源管理、全部订单 |
| TC-04 | 仓储独立工作台概览 | 账户具备仓储服务商能力 | 访问 `/warehouse/` | 默认展示工作台概览，可进入待确认订单、出入库管理、仓库资源管理、全部订单 |
| TC-05 | 服务能力详情页入口 | 对应服务能力状态为 2 | 访问 `/dashboard/services/logistics` 或 `/dashboard/services/warehouse` | 操作区展示独立管理中心入口及资源管理入口 |

## Exception Path

| 编号 | 场景 | 前置条件 | 步骤 | 期望结果 |
| --- | --- | --- | --- | --- |
| TC-EX-01 | 能力未开通 | `logistics` 或 `warehouse` 权限不存在或状态不是 2 | 访问 `/dashboard` | 不展示对应管理中心入口 |
| TC-EX-02 | 服务权限接口失败 | `GET /enterprises/me/services` 请求失败 | 访问 `/dashboard` | 页面保持可用，不展示依赖权限的物流/仓储入口 |
| TC-EX-03 | 独立服务商权限不足 | 当前账户未具备对应服务商能力 | 访问 `/logistics/` 或 `/warehouse/` | 独立 app 展示权限提示，不暴露工作台数据 |

## 权限测试

| 编号 | 角色 | 场景 | 期望结果 |
| --- | --- | --- | --- |
| TC-AUTH-01 | 已认证企业用户 | 已开通物流能力 | 展示物流管理中心入口 |
| TC-AUTH-02 | 已认证企业用户 | 已开通仓储能力 | 展示仓储管理中心入口 |
| TC-AUTH-03 | 未认证或未开通能力用户 | 未取得对应服务权限 | 不展示物流/仓储管理中心入口 |

## 回归关注点

- “进入卖家中心”“进入资金方工作台”“进入商城”入口仍正常展示和跳转。
- 业务菜单中的 `/dashboard/logistics`、`/dashboard/warehouse` 仍受既有服务权限控制，不作为底部管理中心入口目标。
- 独立 `/logistics/`、`/warehouse/` 应用部署路径和 nginx fallback 不受影响。
