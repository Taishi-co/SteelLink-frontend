# Role Permission Matrix

本文件用于前端需求评审、开发和 review 时快速核对权限边界。

## 角色分类

| 类别 | 角色 |
| --- | --- |
| 买方 | `buyer_admin`, `buyer_purchase`, `buyer_finance` |
| 卖方 | `seller_admin`, `seller_sales`, `seller_finance` |
| 平台 | `platform_admin`, `platform_audit`, `platform_finance`, `platform_risk` |
| 合作方 | `partner_bank`, `partner_warehouse` |
| 游客 | `guest` |

## 核心权限

| 权限 | 说明 |
| --- | --- |
| `browse_inventory` | 浏览库存与商品 |
| `publish_inventory` | 发布库存 |
| `inquiry` | 发起询价 |
| `create_order` | 创建订单 |
| `confirm_order` | 确认订单 |
| `apply_finance` | 发起融资申请 |
| `finance_audit` | 审核融资 |
| `repayment` | 还款处理 |
| `risk_config` | 风控配置 |
| `risk_audit` | 风控审核 |
| `risk_warning` | 风险预警处理 |
| `credit_score` | 信用评分查看 |
| `sub_account` | 子账号管理 |
| `system_config` | 系统配置 |
| `account_manage` | 账号管理 |

## 使用要求

- 权限相关需求必须先核对配套前端应用仓的 `src/config/permissions.ts`
- 如果当前工作区没有该文件，必须在结果中明确“权限配置核对需在配套应用仓完成”
- 如果需求引入新权限，先更新此文档和配置文件，再实现页面逻辑
- Review 时应明确受影响角色、入口页面、菜单差异和实际改动仓库
