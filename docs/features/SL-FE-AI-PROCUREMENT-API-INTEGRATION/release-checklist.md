# Release Checklist

- [ ] `pnpm --filter @steellink/buyer-app lint` 通过。
- [ ] `pnpm --filter @steellink/buyer-app build` 通过。
- [ ] `./harness/review.sh docs/features/SL-FE-AI-PROCUREMENT-API-INTEGRATION` 通过。
- [ ] `./harness/release.sh docs/features/SL-FE-AI-PROCUREMENT-API-INTEGRATION` 通过。
- [ ] 生产库 `ai_procurements` 表已核验。
- [ ] 发布前确认后端已包含 `SL-BE-AI-PROCUREMENT` 迁移。
