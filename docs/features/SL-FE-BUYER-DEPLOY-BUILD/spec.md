# Buyer App Deploy Build Fix Spec

## 基本信息

- Feature ID: SL-FE-BUYER-DEPLOY-BUILD
- Feature 名称: 修复 buyer-app 部署构建失败
- 负责人: Codex
- 目标上线环境: production

## 背景

生产 Docker 构建在 `pnpm --filter @steellink/buyer-app build` 阶段失败。失败原因是 buyer-app 新增购物车和企业入驻页面后存在 TypeScript 阻断问题，包括未使用导入、未使用变量，以及页面读取了 `CartItem` 类型中不存在的 `checked` 字段。

## 范围

### In Scope

- 修复 `apps/buyer-app/src/pages/Cart/index.tsx` 的 TypeScript 构建错误。
- 修复 `apps/buyer-app/src/pages/EnterpriseIntro/index.tsx` 的未使用 Typography 字段。
- 保持当前购物车 store/API 类型不变。

### Out of Scope

- 不新增购物车多选能力。
- 不调整购物车 API、store 数据结构或后端契约。
- 不修改 Dockerfile 或部署 workflow。

## 交互与页面影响

- 受影响页面: 采购清单页、企业入驻介绍页
- 新增页面: 无
- 路由变化: 无
- 菜单变化: 无

## 数据与接口影响

- 受影响 API: 无
- 请求/响应变化: 无
- 环境变量变化: 无

## 权限影响

- 受影响角色: buyer
- 新增/调整权限: 无

## 验收标准

1. `pnpm --filter @steellink/buyer-app build` 通过。
2. 采购清单页不再读取 `CartItem.checked`。
3. 企业入驻介绍页没有未使用变量导致的 TypeScript 构建错误。
