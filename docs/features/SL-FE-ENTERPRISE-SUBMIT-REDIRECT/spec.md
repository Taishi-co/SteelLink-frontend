# 企业认证提交后返回个人工作台

## 基本信息

- Feature ID: SL-FE-ENTERPRISE-SUBMIT-REDIRECT
- Feature 名称: 企业认证提交成功跳转个人工作台
- 负责人: Codex
- 目标上线环境: buyer-app 生产环境

## 背景

用户在个人工作台的企业认证页提交企业认证材料后，当前页面只刷新企业状态，用户仍停留在认证表单流程中。业务期望提交成功后给出成功提示，并返回个人工作台。

## 范围

### In Scope

- 调整买家端 `/dashboard/enterprise` 创建企业认证和重新提交认证材料的成功处理。
- 成功后提示用户提交成功或重新提交成功，并跳转回 `/dashboard`。

### Out of Scope

- 不调整企业认证 API 契约。
- 不调整企业审核、加入企业、实名认证流程。
- 不调整个人工作台首页布局。

## 交互与页面影响

- 受影响页面: `apps/buyer-app/src/pages/Enterprise/index.tsx`
- 新增页面: 无
- 路由变化: 无新增路由，成功后返回既有 `/dashboard`
- 菜单变化: 无

## 数据与接口影响

- 受影响 API: `POST /enterprises`, `POST /enterprises/:id/verify`
- 请求/响应变化: 无
- 环境变量变化: 无

## 权限影响

- 受影响角色: 已完成实名认证且可提交企业认证的个人用户
- 新增/调整权限: 无

## 验收标准

1. 用户在 `/dashboard/enterprise` 提交新企业认证成功后，看到成功提示并返回 `/dashboard`。
2. 用户重新提交被驳回或补充材料的企业认证成功后，看到重新提交成功提示并返回 `/dashboard`。
3. 提交失败时仍停留在当前页面并显示后端错误或兜底错误文案。
