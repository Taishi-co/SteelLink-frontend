# Implementation Plan

## 步骤

1. 从最新 `main` 新建 `feat/SL-FE-PLATFORM-INTRO` 分支。
2. 新增买家端 `About` 页面。
3. 将 `/about` 路由从占位页替换为正式页面。
4. 调整页脚“联系我们”链接到 `/about#contact`。
5. 补齐 feature 文档四件套。
6. 执行 buyer-app lint/build 与 harness review/release。

## 风险与回滚

- 页面内容为静态配置，回滚风险低。
- 若后续需要新闻动态从后台维护，可新增新闻接口和管理端配置，本次不预留运行时请求依赖。
