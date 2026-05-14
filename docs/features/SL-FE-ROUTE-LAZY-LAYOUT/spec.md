# Route Lazy Layout Spec

## 基本信息

- Feature ID: SL-FE-ROUTE-LAZY-LAYOUT
- Feature 名称: 固定布局退出页面懒加载 fallback
- 负责人: Codex
- 目标上线环境: Frontend production

## 背景

买家端和卖家端路由使用 `React.lazy` 按页面拆包，但顶层 `Suspense` 包住了整棵 `Routes`。当懒加载页面 chunk 加载时，固定的顶部栏、侧边栏和布局容器也会一起被 fallback 替换，造成后台导航闪烁。

## 范围

### In Scope

- 买家端 `apps/buyer-app/src/router/index.tsx`
- 卖家端 `apps/seller-app/src/router/index.tsx`
- 将 `Suspense` fallback 从整棵路由树下沉到懒加载页面元素
- 保持 `HomeLayout`、`MainLayout`、`DashboardLayout`、`SellerLayout` 立即渲染

### Out of Scope

- 不调整页面拆包策略
- 不改侧边栏、顶部栏视觉样式
- 不改认证、权限、API 契约

## 交互与页面影响

- 受影响页面: buyer-app 全站路由、seller-app 全站路由
- 新增页面: 无
- 路由变化: 无路径变化
- 菜单变化: 无

## 数据与接口影响

- 受影响 API: 无
- 请求/响应变化: 无
- 环境变量变化: 无

## 权限影响

- 受影响角色: 买家端登录用户、卖家端登录用户
- 新增/调整权限: 无

## 验收标准

1. 切换后台懒加载页面时，固定侧边栏和顶部栏不被 `页面加载中...` fallback 替换。
2. 懒加载页面仍显示页面级 fallback，不影响页面 chunk 按需加载。
3. buyer-app 与 seller-app 构建通过。
