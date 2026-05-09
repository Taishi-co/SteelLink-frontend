# Release Checklist

- [x] 已从最新 `main` 创建修复分支。
- [x] `apps/warehouse-app` 可构建。
- [x] `./harness/verify.sh` 通过。
- [x] 已确认生产后端包含仓储方订单详情读权限。
- [ ] 回滚方式：回退 `apps/warehouse-app/src/App.tsx` 与 `apps/warehouse-app/src/services/orderService.ts` 的本次变更。
