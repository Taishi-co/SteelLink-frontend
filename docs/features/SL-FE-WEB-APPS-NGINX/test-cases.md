# Test Cases

## 测试范围

- Feature ID: SL-FE-WEB-APPS-NGINX
- 测试负责人: Codex

## Happy Path

| 编号 | 场景 | 前置条件 | 步骤 | 期望结果 |
| --- | --- | --- | --- | --- |
| TC-01 | 构建物流应用 | 依赖已安装 | 执行 `pnpm --filter @steellink/logistics-app build` | 生成 `apps/logistics-app/dist` |
| TC-02 | 构建仓储应用 | 依赖已安装 | 执行 `pnpm --filter @steellink/warehouse-app build` | 生成 `apps/warehouse-app/dist` |
| TC-03 | 构建资金应用 | 依赖已安装 | 执行 `pnpm --filter @steellink/finance-app build` | 生成 `apps/finance-app/dist` |
| TC-04 | nginx 模板校验 | nginx 可用或通过 Docker 构建验证 | 检查 `/logistics`、`/warehouse`、`/finance` location | 三个路径均指向对应静态目录并 fallback 到对应 `index.html` |

## Exception Path

| 编号 | 场景 | 前置条件 | 步骤 | 期望结果 |
| --- | --- | --- | --- | --- |
| TC-EX-01 | 刷新子路由 | 已部署 nginx 模板 | 访问 `/finance/some-sub-route` | 返回资金服务应用 `index.html`，由前端接管路由 |
| TC-EX-02 | API 代理 | 已设置 `API_UPSTREAM` | 访问 `/api/...` | 请求仍转发到 `API_UPSTREAM`，不落到静态应用 fallback |

## 权限测试

| 编号 | 角色 | 场景 | 期望结果 |
| --- | --- | --- | --- |
| TC-AUTH-01 | 物流/仓储/资金服务商 | 打开对应服务商应用 | 权限逻辑仍由应用现有 `auth` 服务处理，本次 nginx 变更不改变权限结果 |

## 回归关注点

- `/` 买家端入口不能被新增 location 影响。
- `/seller` 卖家端入口继续可访问。
- `/api` 代理优先级不能被 `/` fallback 抢走。
