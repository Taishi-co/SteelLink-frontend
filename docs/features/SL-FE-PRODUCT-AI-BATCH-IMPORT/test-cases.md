# Product AI Batch Import Test Cases

## 测试范围

- Feature ID: SL-FE-PRODUCT-AI-BATCH-IMPORT
- 测试负责人: Codex

## Happy Path

| 编号 | 场景 | 前置条件 | 步骤 | 期望结果 |
| --- | --- | --- | --- | --- |
| TC-01 | 打开导入弹窗 | 卖家已登录并打开 `/seller/products` | 点击 AI 批量导入 | 弹窗展示上传区 |
| TC-02 | 解析台账 | 已选择 csv/xlsx 文件 | 点击 AI识别 | 展示可编辑商品草稿表格 |
| TC-02A | 流式截图识别 | 已选择截图文件，后端识别耗时较长 | 点击 AI识别 | 弹窗持续展示识别阶段，最终展示可编辑商品草稿 |
| TC-03 | 修改并确认 | 已有草稿行 | 修改规格或价格后点击确认添加 | 后端创建成功，列表刷新 |
| TC-04 | 删除错误行 | 已有多行草稿 | 删除一行后确认添加 | 被删除行不提交 |

## Exception Path

| 编号 | 场景 | 前置条件 | 步骤 | 期望结果 |
| --- | --- | --- | --- | --- |
| TC-EX-01 | 未选择文件 | 打开导入弹窗 | 点击 AI识别 | 提示选择文件 |
| TC-EX-02 | 后端返回失败行 | 部分行缺少品种或牌号 | 点击确认添加 | 成功行创建，失败行保留 |
| TC-EX-03 | 解析接口失败 | 后端不可用 | 点击 AI识别 | 展示错误提示 |

## 权限测试

| 编号 | 角色 | 场景 | 期望结果 |
| --- | --- | --- | --- |
| TC-AUTH-01 | 未登录 | 访问 `/seller/products` | 由既有路由守卫处理 |

## 配置与部署验证

| 编号 | 场景 | 验证命令/步骤 | 期望结果 |
| --- | --- | --- | --- |
| TC-OPS-01 | seller-app 构建 | `pnpm --filter @steellink/seller-app build` | 构建通过 |
| TC-OPS-02 | 发布门禁 | `./harness/release.sh docs/features/SL-FE-PRODUCT-AI-BATCH-IMPORT` | release gate 通过 |
