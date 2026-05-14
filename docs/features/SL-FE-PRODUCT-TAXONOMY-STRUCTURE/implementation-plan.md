# Product Taxonomy Structure Implementation Plan

## Feature 信息

- Feature ID: SL-FE-PRODUCT-TAXONOMY-STRUCTURE
- 开发负责人: Codex

## 变更范围

- 代码文件:
  - `apps/seller-app/src/pages/Products/index.tsx`
  - `apps/seller-app/src/services/productService.ts`
  - `apps/seller-app/src/services/categoryService.ts`
- 文档文件:
  - `docs/features/SL-FE-PRODUCT-TAXONOMY-STRUCTURE/*`
- 配置文件: 无
- 部署/脚本文件: 无

## 实施步骤

1. 扩展卖家商品服务类型，接收后端结构化商品字段。
2. 增加牌号和钢厂主数据接口封装。
3. 改造商品发布/编辑表单，拆分行业字段和规格字段。
4. 调整列表与详情展示。
5. 执行 seller-app 构建和 release gate。

## 验证计划

- `pnpm --filter @steellink/seller-app build`
- `./harness/release.sh docs/features/SL-FE-PRODUCT-TAXONOMY-STRUCTURE`
- 需要的人工验证: 本地登录卖家端，发布一个相同捆包号的新商品并确认进入审核。

## 风险与回滚关注点

- 结构化字段依赖后端同步上线；后端未上线时手动输入文本仍可保留旧字段，但 ID 不会生效。
- UI 表单字段增多，移动端弹窗需要人工检查。
