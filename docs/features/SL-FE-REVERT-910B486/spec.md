# Revert 910b486 Feature Spec

## 基本信息

- Feature ID: SL-FE-REVERT-910B486
- Feature 名称: 移除错误提交 910b486 的改动
- 负责人: Codex
- 目标上线环境: production

## 背景

`910b4861137e4d10ddbd4fb4cd2d9bdaf0bbb760` 已进入 `origin/main`，该提交清理了 buyer-app 多个旧页面和服务入口相关实现。当前目标是通过反向提交移除该错误提交带来的改动，恢复进入该提交之前的 buyer-app 行为。

## 范围

### In Scope

- Revert commit `910b4861137e4d10ddbd4fb4cd2d9bdaf0bbb760`
- 恢复 buyer-app AI 采购、购物车、首页、商城、商品列表、Dashboard 服务页和仓储页相关实现
- 恢复被该提交删除的 buyer-app 服务封装与类型字段

### Out of Scope

- 不调整后端 API
- 不新增业务流程
- 不改动部署脚本、环境变量或 Nginx 配置

## 交互与页面影响

- 受影响页面: buyer-app AI 采购、购物车、首页、商城、商品列表、Dashboard 服务页、Dashboard 仓储页、企业服务页
- 新增页面: 无
- 路由变化: 恢复 `910b486` 删除的 Dashboard 仓储页文件；不新增路由定义
- 菜单变化: 恢复 `910b486` 对 DashboardLayout 的改动

## 数据与接口影响

- 受影响 API: buyer-app 前端调用封装恢复 `categoryService`、`platformService`、AI 采购、订单、购物车相关调用
- 请求/响应变化: 无新增契约，恢复错误提交前前端调用形态
- 环境变量变化: 无

## 权限影响

- 受影响角色: 买家用户
- 新增/调整权限: 无

## 验收标准

1. `origin/main` 上的 `910b486` 改动被一个 revert commit 抵消。
2. buyer-app 相关页面和服务封装能通过仓库验证入口。
3. 本次变更不影响当前已有未提交工作区改动。
