# Release Checklist

- [ ] `/about` 页面可访问。
- [ ] 平台简介、最新新闻、联系我们三个板块完整。
- [ ] 页脚“联系我们”链接指向 `/about#contact`。
- [ ] `pnpm --filter @steellink/buyer-app lint` 通过。
- [ ] `pnpm --filter @steellink/buyer-app build` 通过。
- [ ] `./harness/review.sh docs/features/SL-FE-PLATFORM-INTRO` 通过。
- [ ] `./harness/release.sh docs/features/SL-FE-PLATFORM-INTRO` 通过。
