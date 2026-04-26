# Implementation Plan

## 步骤

1. 从最新 `origin/main` 创建 `fix/SL-FE-MATCHING-api-integration`。
2. 新增 `supplyDemandService`，封装供求信息统计、列表、我的发布和创建接口。
3. 替换 `Matching` 页面静态数据为真实接口数据。
4. 使用真实数据派生 AI 智能撮合推荐。
5. 增加发布信息弹窗，支持供应、求购、仓储、物流四类信息。
6. 补齐 feature 文档并执行 buyer-app 与 harness 验证。

## 数据库

后端主干已包含 `supply_demand_posts` GORM AutoMigrate。生产环境公开接口检查成功：

```bash
curl http://117.72.123.14/api/v1/supply-demands/stats
```

返回 `code=0`，说明当前生产 API 和表结构可用。当前环境没有可用 SSH 凭据，无法直接登录服务器执行 `SHOW CREATE TABLE`；如需人工核验，可在服务器执行：

```sql
SHOW CREATE TABLE supply_demand_posts;
```

## 风险与回滚

- 若后端接口不可用，页面展示错误提示和空状态，不回落到假数据。
- 回滚本分支即可恢复原静态页面。
