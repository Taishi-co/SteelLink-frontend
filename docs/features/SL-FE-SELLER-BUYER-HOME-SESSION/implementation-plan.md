# Implementation Plan

## Feature 信息

- Feature ID: SL-FE-SELLER-BUYER-HOME-SESSION
- 开发负责人: Codex

## 变更范围

- 代码文件: `apps/seller-app/src/services/auth.ts`, `apps/seller-app/src/services/api.ts`
- 文档文件: `docs/features/SL-FE-SELLER-BUYER-HOME-SESSION/*`
- 配置文件: 无
- 脚本文件: 无

## 实施步骤

1. 为卖家端 session 清理函数增加保留买家共享会话的选项。
2. 将卖家端 API 401 响应处理改为只清理卖家侧缓存并保留买家 token/user。
3. 保持显式退出和切换账号继续调用默认全量清理。

## 验证计划

- `pnpm --filter @steellink/seller-app build`
- 人工验证: 登录后进入卖家中心，点击“买家首页”，确认买家首页仍展示登录用户。

## 风险与回滚关注点

- 若后端将所有 token 过期都统一返回 401，保留买家端 token 可能让买家端在下一次 API 请求时自行处理过期并跳转登录；这是买家端已有逻辑。
