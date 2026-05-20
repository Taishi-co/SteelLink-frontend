# Route Lazy Layout Test Cases

## 测试范围

- Feature ID: SL-FE-ROUTE-LAZY-LAYOUT
- 测试负责人: Codex

## Happy Path

| 编号 | 场景 | 前置条件 | 步骤 | 期望结果 |
| --- | --- | --- | --- | --- |
| TC-01 | 买家后台页面切换 | 买家用户已登录 | 进入 `/dashboard` 后切换到 `/dashboard/finance`、`/dashboard/warehouse` 等页面 | 左侧栏持续显示，只有内容区展示页面加载状态 |
| TC-02 | 卖家后台页面切换 | 卖家用户已登录且企业可用 | 进入 `/dashboard` 后切换到 `/products`、`/orders` 等页面 | 侧边栏和顶部栏持续显示，只有内容区展示页面加载状态 |
| TC-03 | 首页布局页面切换 | 无 | 访问 `/` 后切换到 `/mall`、`/matching` | 首页顶部栏和页脚布局不被整页 fallback 替换 |

## Exception Path

| 编号 | 场景 | 前置条件 | 步骤 | 期望结果 |
| --- | --- | --- | --- | --- |
| TC-EX-01 | 未登录访问买家后台 | 无买家登录态 | 访问 `/dashboard` | 仍按现有认证逻辑跳转或拦截，不因 Suspense 调整改变权限行为 |
| TC-EX-02 | 未登录访问卖家后台 | 无卖家登录态 | 访问 `/dashboard` | 仍跳转 `/login` |

## 权限测试

| 编号 | 角色 | 场景 | 期望结果 |
| --- | --- | --- | --- |
| TC-AUTH-01 | 买家/卖家 | 访问原有受保护路由 | 权限判断与调整前一致 |

## 回归关注点

- `RequireAuth`、`ProtectedRoute`、`RequireIdentity`、`RequireEnterprise` 的跳转行为不变。
- 已存在的站内信路由和菜单入口不被覆盖。
- 页面级 fallback 仍能覆盖懒加载页面内容区。
