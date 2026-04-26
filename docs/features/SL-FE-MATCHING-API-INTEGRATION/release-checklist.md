# Release Checklist

- [ ] `pnpm --filter @steellink/buyer-app lint` 通过。
- [ ] `pnpm --filter @steellink/buyer-app build` 通过。
- [ ] `./harness/review.sh docs/features/SL-FE-MATCHING-API-INTEGRATION` 通过。
- [ ] `./harness/release.sh docs/features/SL-FE-MATCHING-API-INTEGRATION` 通过。
- [ ] 生产接口 `GET /api/v1/supply-demands/stats` 可访问。
- [ ] 发布前确认后端已包含 `SL-BE-SUPPLY-DEMAND` 迁移。
