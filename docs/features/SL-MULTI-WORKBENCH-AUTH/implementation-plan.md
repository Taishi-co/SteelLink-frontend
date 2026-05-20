# 多工作台会话切换实施计划

## Feature 信息

- Feature ID: SL-MULTI-WORKBENCH-AUTH
- 开发负责人: Codex

## 变更范围

- 代码文件:
  - `apps/buyer-app/src/services/auth.ts`
  - `apps/seller-app/src/services/auth.ts`
  - `apps/logistics-app/src/services/auth.ts`
  - `apps/warehouse-app/src/services/auth.ts`
  - `apps/finance-app/src/services/auth.ts`
  - `apps/buyer-app/src/components/Layout/DashboardLayout.tsx`
  - `apps/buyer-app/src/components/Layout/HomeHeader.tsx`
  - `apps/buyer-app/src/pages/Bidding/index.tsx`
  - `apps/buyer-app/src/pages/Enterprise/index.tsx`
  - `apps/buyer-app/src/pages/ServiceWorkspace/index.tsx`
  - `apps/seller-app/src/components/Layout/SellerLayout.tsx`
  - `apps/logistics-app/src/App.tsx`
  - `apps/warehouse-app/src/App.tsx`
  - `apps/finance-app/src/App.tsx`
- 文档文件:
  - `docs/features/SL-MULTI-WORKBENCH-AUTH/*`
- 配置文件: 无
- 脚本文件: 无

## 实施步骤

1. 在各应用 auth 服务中增加 JWT 过期判断，读取 token 时清理过期本地缓存。
2. 买家端和卖家端跨工作台入口改为优先调用后端 `switch-session`。
3. 物流、仓储、资金方工作台启动时消费 `switch_token` 并保存对应工作台会话。
4. 保留共享 token 兜底，避免旧入口或直接打开时完全不可用。

## 验证计划

- `./harness/verify.sh`
- `pnpm --filter @steellink/buyer-app typecheck`
- `pnpm --filter @steellink/seller-app typecheck`
- `pnpm --filter @steellink/logistics-app typecheck`
- `pnpm --filter @steellink/warehouse-app typecheck`
- `pnpm --filter @steellink/finance-app typecheck`
- `pnpm --filter @steellink/buyer-app build`
- 需要的人工验证:
  - 多服务能力企业从个人工作台进入物流、仓储、资金方工作台。
  - 清理或伪造过期工作台 token 后再次进入目标工作台。

## 风险与回滚关注点

- 依赖后端同步支持 `target=logistics|warehouse|finance`。
- 若后端未同步上线，目标工作台仍可依赖共享 token 兜底，但一次性会话切换会失败。
- 回滚前端改动会恢复旧的共享 token 读取方式，可能重新出现过期 token 优先发送问题。
