# Test Cases

## 测试范围

- Feature ID: SL-FE-SERVICE-APPS
- 测试负责人: Codex

## Happy Path

| 编号 | 场景 | 前置条件 | 步骤 | 期望结果 |
| --- | --- | --- | --- | --- |
| TC-01 | 买家查看物流仓储市场 | 启动 buyer-app | 进入 `/service-market` | 页面展示仓储、运输、监管与增值服务，主导航高亮“物流仓储” |
| TC-02 | 开通服务 | 登录 buyer-app | 进入 `/dashboard/services`，开通物流、仓储、资金服务 | 侧边栏显示物流平台、仓储平台、资金服务入口 |
| TC-03 | 查看物流平台面板 | 已开通物流服务 | 进入 `/dashboard/logistics` | 页面展示运单、车辆线路、异常与结算数据 |
| TC-04 | 查看仓储平台面板 | 已开通仓储服务 | 进入 `/dashboard/warehouse` | 页面展示仓容、预约、库存监管与作业数据 |
| TC-05 | 查看资金服务面板 | 已开通资金服务 | 进入 `/dashboard/finance` | 页面展示授信、融资申请、放款与贷后数据 |

## Exception Path

| 编号 | 场景 | 前置条件 | 步骤 | 期望结果 |
| --- | --- | --- | --- | --- |
| TC-EX-01 | 未开通服务直接访问面板 | 登录 buyer-app，关闭对应服务 | 直接访问 `/dashboard/warehouse` 等面板路由 | 页面提示先到服务入口开通 |

## 权限测试

| 编号 | 角色 | 场景 | 期望结果 |
| --- | --- | --- | --- |
| TC-AUTH-01 | 买家 | 访问 `/service-market` | 可直接浏览服务市场 |
| TC-AUTH-02 | 买家 | 访问 `/dashboard/services` | 可开通和进入对应服务面板 |

## 回归关注点

- buyer-app 原有首页、商城、供求信息、AI 采购、竞价、集采路由不应被影响。
- seller-app 不应受 buyer dashboard 服务入口改动影响。
- 后续接后端时，本地开通状态需要替换为企业服务订阅接口。
