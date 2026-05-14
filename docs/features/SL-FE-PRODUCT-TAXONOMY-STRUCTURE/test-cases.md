# Product Taxonomy Structure Test Cases

## 测试范围

- Feature ID: SL-FE-PRODUCT-TAXONOMY-STRUCTURE
- 测试负责人: Codex

## Happy Path

| 编号 | 场景 | 前置条件 | 步骤 | 期望结果 |
| --- | --- | --- | --- | --- |
| TC-01 | 发布结构化商品 | 卖家已登录且通过企业认证 | 打开商品管理，填写品种、牌号、产地、结构化规格、仓库、库存、价格并提交 | 请求体包含新旧字段，提交成功进入审核 |
| TC-02 | 编辑结构化商品 | 已存在结构化商品 | 点击编辑 | 表单正确回显品种、牌号、产地、规格拆分和存放地 |
| TC-03 | 重复捆包号文案 | 发布商品 | 查看捆包号输入框 | 不再提示“唯一捆包号” |

## Exception Path

| 编号 | 场景 | 前置条件 | 步骤 | 期望结果 |
| --- | --- | --- | --- | --- |
| TC-EX-01 | 必填缺失 | 不填牌号或产地 | 提交表单 | 前端阻止提交并提示必填 |
| TC-EX-02 | 主数据接口失败 | 后端主数据接口不可用 | 打开商品管理 | 表单仍可手动输入文本字段 |

## 权限测试

| 编号 | 角色 | 场景 | 期望结果 |
| --- | --- | --- | --- |
| TC-AUTH-01 | 未登录 | 访问卖家商品管理 | 由既有路由守卫处理 |

## 配置与部署验证

| 编号 | 场景 | 验证命令/步骤 | 期望结果 |
| --- | --- | --- | --- |
| TC-OPS-01 | 前端验证 | `pnpm --filter @steellink/seller-app build` | seller-app 构建通过 |
| TC-OPS-02 | 发布门禁 | `./harness/release.sh docs/features/SL-FE-PRODUCT-TAXONOMY-STRUCTURE` | release gate 通过 |
