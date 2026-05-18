# SL-FE-FINANCE-WAREHOUSE-CERT Spec

## 基本信息

- Feature ID: SL-FE-FINANCE-WAREHOUSE-CERT
- Feature 名称: 资金方监管仓认证入口
- 负责人: Codex
- 目标上线环境: staging

## 背景

后端已有资金方授权监管仓接口，仓库服务列表也能展示资方认证标志，但 finance-app 尚未提供资金方在工作台为金融产品绑定监管仓的入口。

## 范围

### In Scope

- finance-app 金融产品列表展示已认证监管仓数量。
- 金融产品展开后可选择支持质押监管的已审核仓库并认证为该产品的监管仓。
- 可撤销已认证监管仓。

### Out of Scope

- 不新增平台管理端审核入口。
- 不改仓储方资源发布流程。

## 页面与接口影响

- 页面: `apps/finance-app/src/App.tsx`
- 工程脚本: `harness/resolve-feature-dir.sh` 修复 review gate 中 heredoc 反引号解析问题
- 接口:
  - `GET /warehouse-services`
  - `POST /finance-services/:id/authorize-warehouse`
  - `DELETE /finance-services/authorized-warehouses/:auth_id`
  - `GET /finance-services/:id/authorized-warehouses`

## 验收标准

1. 资金方可在金融产品列表展开某产品并认证监管仓。
2. 被认证仓库在买方仓储市场显示资方认证监管仓标识。
3. 撤销认证后产品授权仓库列表刷新。
