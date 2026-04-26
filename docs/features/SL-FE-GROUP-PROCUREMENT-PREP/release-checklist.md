# Release Checklist

- [ ] `pnpm --filter @steellink/buyer-app lint` 通过。
- [ ] `pnpm --filter @steellink/buyer-app build` 通过。
- [ ] `./harness/review.sh docs/features/SL-FE-GROUP-PROCUREMENT-PREP` 通过。
- [ ] `./harness/release.sh docs/features/SL-FE-GROUP-PROCUREMENT-PREP` 通过。
- [ ] `/procurement` 可访问。
- [ ] 九阶段流程、筹备表单、集采预览和活动日志展示完整。
