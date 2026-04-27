# Release Checklist

## 发布前

- [ ] `pnpm --filter @steellink/buyer-app lint`
- [ ] `pnpm --filter @steellink/buyer-app build`
- [ ] `./harness/review.sh docs/features/SL-FE-BIDDING-PROCUREMENT-API-INTEGRATION`
- [ ] `./harness/release.sh docs/features/SL-FE-BIDDING-PROCUREMENT-API-INTEGRATION`

## 联调检查

- [ ] 后端启动后打开 `/bidding` 可看到接口返回的竞价数据。
- [ ] 打开 `/procurement` 可看到接口返回的集采活动。
- [ ] 点击集采活动进入 `/procurement/:id` 可看到详情和日志。
- [ ] 后端不可用时不展示静态业务数据。

## 回滚

- 回滚本分支提交。
- 回滚后验证竞价交易、集采大厅、现货商城、供求信息入口仍可访问。
