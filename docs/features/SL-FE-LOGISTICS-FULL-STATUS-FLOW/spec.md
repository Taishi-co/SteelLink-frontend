# 物流全链路状态流转 - 前端

## 背景

后端已实现物流全链路状态流转API，前端三端需要联动展示物流进度和操作。

## 需求

1. 卖家端：物流竞价管理Tab（查看竞价/选择报价/关闭竞价）
2. 卖家端：物流运输进度展示 + 对账确认
3. 买家端：物流仓储履约卡片 + 确认收货
4. 物流端：履约操作（确认提货/送达/签收）+ 文件上传

## 状态流转

```
已支付(4) → 物流竞价中(15) → 待确认物流(16) → 运输中(17) → 已送达(7) → 已收货(18) → 已对账(19)
```

## 卖家端改动

### 物流竞价Tab
- 新增Tab页展示竞价列表
- 每个报价卡片显示物流公司、司机/车辆、金额、预计时间
- 支持选择报价（Radio选择 + 确认按钮）
- 支持关闭竞价

### 物流运输进度
- ShipmentTask 4步进度条：待提货→已提货→已送达→已签收
- 每步显示时间戳
- 对账确认按钮（status=18时可用）

## 买家端改动

### 物流仓储履约卡片
- 当有 shipment_task 时显示4步物流进度
- 当无 shipment_task 时显示仓库→物流→签收的5步流程
- 确认收货按钮支持 status=17（运输中）和 status=7（已送达）

## 物流端改动

### 履约操作
- 确认提货：上传提货凭证图片
- 确认送达：上传送达凭证图片
- 上传签收：上传签收回单图片
- 使用真实 uploadService 替代 mock 上传

## 新增类型

### ShipmentTaskInfo
```typescript
interface ShipmentTaskInfo {
  id: number
  order_id: number
  order_no: string
  logistics_enterprise_id: number
  logistics_quote_id: number
  status: 'pending_pickup' | 'picked_up' | 'delivered' | 'signed'
  pickup_voucher?: string
  delivery_voucher?: string
  signature_voucher?: string
  picked_up_at?: string
  delivered_at?: string
  signed_at?: string
  created_at: string
  updated_at: string
}
```

### LogisticsQuoteInfo
```typescript
interface LogisticsQuoteInfo {
  id: number
  bidding_id: number
  order_id: number
  logistics_enterprise_id: number
  logistics_name: string
  vehicle_info: string
  driver_info: string
  amount: number
  estimated_pickup_at: string
  estimated_delivery_at: string
  remark: string
  created_at: string
}
```
