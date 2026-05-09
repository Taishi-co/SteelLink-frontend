# Implementation Plan

1. 扩展 buyer-app 购物车类型，接收商品缩略图和仓库信息。
2. 更新 `cartService` DTO 映射，把后端 snake_case 字段转成页面使用的 camelCase。
3. 调整购物车表格商品列，展示缩略图、商品名、规格、卖家。
4. 新增可发货仓库列，展示仓库名称、编码和地址，缺省时显示占位。
5. 执行 buyer-app 构建验证。
