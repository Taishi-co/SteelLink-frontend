# Release Checklist

## 发布前

- [ ] `pnpm --filter @steellink/buyer-app lint`
- [ ] `pnpm --filter @steellink/buyer-app build`
- [ ] `./harness/review.sh docs/features/SL-FE-BIDDING-HALL`
- [ ] `./harness/release.sh docs/features/SL-FE-BIDDING-HALL`

## 人工验收

- [ ] 打开 `/bidding`，可看到竞价大厅而非占位页。
- [ ] 大厅展示进行中竞价、竞价成功、总成交金额、参与企业四项统计。
- [ ] 买家竞价与卖家竞价入口可点击进入对应模块。
- [ ] 热门竞价展示实时竞价信息。
- [ ] 竞价成功展示近期成交信息。

## 回滚

- 回滚本分支提交。
- 回滚后验证 `/bidding`、现货商城、供求信息、AI采购、集采大厅入口仍可访问。
