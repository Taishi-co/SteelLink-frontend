# Home Real Stats Implementation Plan

## Feature 信息

- Feature ID: SL-FE-HOME-REAL-STATS
- 开发负责人: Codex

## 变更范围

- 代码文件:
  - `apps/buyer-app/src/pages/Home/index.tsx`
  - `apps/buyer-app/src/services/platformService.ts`
- 文档文件:
  - `docs/features/SL-FE-HOME-REAL-STATS/*`
- 配置文件: 无
- 脚本文件: 无

## 实施步骤

1. 新增 `platformService.getStats()` 封装后端统计接口。
2. 首页组件加载时请求统计接口并替换静态统计数组。
3. 添加格式化与失败降级逻辑。

## 验证计划

- `pnpm --filter @steellink/buyer-app build`
- `./harness/verify.sh`
- 需要的人工验证: 打开生产首页，确认统计数字与 `/api/v1/platform/stats` 响应一致。

## 风险与回滚关注点

- 接口失败会显示 `--`，不会影响首页主流程。
- 回滚时移除新增 service 并恢复静态 stats 数组。
