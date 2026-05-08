# AI采购历史操作按钮 Implementation Plan

## Feature 信息

- Feature ID: SL-FE-AI-PROCUREMENT-HISTORY-ACTIONS
- 开发负责人: Codex

## 变更范围

- 代码文件: `apps/buyer-app/src/pages/AiProcurement/index.tsx`
- 文档文件: `docs/features/SL-FE-AI-PROCUREMENT-HISTORY-ACTIONS/*`
- 配置文件: 无
- 脚本文件: 无

## 实施步骤

1. 梳理“我的AI采购”历史列表的数据来源和当前打开详情逻辑。
2. 新增“再买一次”和“复制采购对话”处理函数，复用现有“查看详情”逻辑。
3. 将历史记录整卡点击改为显式按钮操作，避免按钮嵌套在可点击卡片中。
4. 运行 buyer-app lint/build 和仓库 review/release gate。

## 验证计划

- `./harness/verify.sh`
- `./harness/review.sh docs/features/SL-FE-AI-PROCUREMENT-HISTORY-ACTIONS`
- `./harness/release.sh docs/features/SL-FE-AI-PROCUREMENT-HISTORY-ACTIONS`
- `pnpm --filter @steellink/buyer-app lint`
- `pnpm --filter @steellink/buyer-app build`
- 需要的人工验证: 登录买家端后在 AI采购首页点击三类历史操作，确认跳转、填入和复制行为。

## 风险与回滚关注点

- 剪贴板能力受浏览器安全策略影响，需保留兼容复制逻辑和失败提示。
- 回滚可移除本 feature 分支对 AI采购页面和 feature 文档的改动。
