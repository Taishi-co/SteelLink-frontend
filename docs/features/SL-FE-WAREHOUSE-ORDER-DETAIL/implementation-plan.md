# Implementation Plan

1. 扩展 `warehouse-app` 订单类型，补齐详情页需要的金额、币种、备注、仓储字段和事件字段。
2. 在 `App.tsx` 中新增订单详情弹窗状态和 `openOrderDetail` 方法。
3. 将表格操作列中的静态“查看”标签替换为真实按钮。
4. 在弹窗中展示订单基础信息、仓储与交付信息、商品明细、履约事件。
5. 运行 warehouse app build 和仓库 harness 验证。
