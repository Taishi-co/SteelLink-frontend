# Feature Spec

## 基本信息

- Feature ID: SL-FE-WEB-APPS-NGINX
- Feature 名称: Web 端多应用生产发布入口
- 负责人: Codex
- 目标上线环境: production

## 背景

前端仓库已新增物流、仓储、资金服务商独立应用，并分别配置了 `/logistics/`、`/warehouse/`、`/finance/` Vite base。当前生产 Dockerfile 与 nginx 模板仍只发布买家端和卖家端，导致新应用不会进入生产镜像，直接访问或刷新对应路径也缺少 SPA fallback。

## 范围

### In Scope

- 生产镜像构建并拷贝 `logistics-app`、`warehouse-app`、`finance-app`。
- 修正 Dockerfile 中 pnpm install 的 `--no-frozen-lockfile` 参数写法。
- nginx 为 `/logistics`、`/warehouse`、`/finance` 增加静态目录和 SPA fallback。
- 同步 AI 入口文档中的前端仓库应用拓扑。

### Out of Scope

- 不调整业务页面、权限判断、API 契约或服务商后台业务逻辑。
- 不修改后端接口、部署服务器脚本或域名配置。

## 交互与页面影响

- 受影响页面: `/logistics`、`/warehouse`、`/finance`
- 新增页面: 无，发布现有应用
- 路由变化: 生产 nginx 新增三个应用入口
- 菜单变化: 无

## 数据与接口影响

- 受影响 API: 无
- 请求/响应变化: 无
- 环境变量变化: 继续复用 `API_UPSTREAM`

## 权限影响

- 受影响角色: 物流服务商、仓储服务商、资金服务商
- 新增/调整权限: 无，本次只修复生产静态发布入口

## 验收标准

1. Docker 构建阶段会构建并复制 5 个前端应用 dist。
2. nginx 能为 `/seller`、`/logistics`、`/warehouse`、`/finance` 提供对应应用的 `index.html` fallback。
3. `/api` 代理仍通过 `API_UPSTREAM` 转发到后端。
