# SL-FE-FINANCE-WAREHOUSE-CERT Test Cases

## 测试范围

- Feature ID: SL-FE-FINANCE-WAREHOUSE-CERT
- 测试负责人: Codex

## Happy Path

| 编号 | 场景 | 前置条件 | 步骤 | 期望结果 |
| --- | --- | --- | --- | --- |
| TC-01 | 认证监管仓 | 资金方有已审核金融产品，平台有支持质押监管仓库 | 展开产品，选择仓库并点击认证 | 创建授权记录，产品显示认证仓数量 |
| TC-02 | 撤销认证 | 产品已有监管仓授权 | 点击撤销 | 授权列表刷新 |

## Exception Path

| 编号 | 场景 | 前置条件 | 步骤 | 期望结果 |
| --- | --- | --- | --- | --- |
| TC-EX-01 | 未选仓库 | 展开产品 | 直接点击认证 | 按钮禁用或提示选择仓库 |

## 验证

| 编号 | 场景 | 命令/步骤 | 期望结果 |
| --- | --- | --- | --- |
| TC-FE-01 | 前端验证 | `./harness/verify.sh` | lint/build/test 通过 |
