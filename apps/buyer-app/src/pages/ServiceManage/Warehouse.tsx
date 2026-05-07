import { Button, Card, Form, Input, InputNumber, Select, Switch, Table, Tag, message } from 'antd'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { serviceOfferService, WarehouseServiceItem } from '@/services/serviceOfferService'
import { useState } from 'react'

const statusText: Record<number, string> = { 1: '待审核', 2: '已通过', 3: '已驳回', 4: '已下线' }

export default function WarehouseManagePage() {
  const [form] = Form.useForm<Partial<WarehouseServiceItem>>()
  const [editing, setEditing] = useState<WarehouseServiceItem | null>(null)
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['my-warehouse-services'], queryFn: serviceOfferService.listMyWarehouses })
  const rows = data?.data ?? []
  const { mutate, isPending } = useMutation({
    mutationFn: (payload: Partial<WarehouseServiceItem>) => editing
      ? serviceOfferService.updateWarehouse(editing.id, payload)
      : serviceOfferService.createWarehouse(payload),
    onSuccess: () => {
      message.success(editing ? '仓储资源已更新并重新提交审核' : '仓储资源已提交审核')
      setEditing(null)
      form.resetFields()
      void queryClient.invalidateQueries({ queryKey: ['my-warehouse-services'] })
    },
  })
  const deleteMutation = useMutation({
    mutationFn: (id: number) => serviceOfferService.deleteWarehouse(id),
    onSuccess: () => {
      message.success('仓储资源已下线')
      void queryClient.invalidateQueries({ queryKey: ['my-warehouse-services'] })
    },
  })

  const startEdit = (record: WarehouseServiceItem) => {
    setEditing(record)
    form.setFieldsValue(record)
  }

  const cancelEdit = () => {
    setEditing(null)
    form.resetFields()
  }

  return (
    <div className="space-y-4">
      <Card title={editing ? `编辑仓储资源：${editing.warehouse_name}` : '上架仓储资源'}>
        <Form form={form} layout="vertical" onFinish={(values) => mutate(values)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Form.Item label="仓库名称" name="warehouse_name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="地址" name="address" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="省份" name="province"><Input /></Form.Item>
            <Form.Item label="城市" name="city"><Input /></Form.Item>
            <Form.Item label="区县" name="district"><Input /></Form.Item>
            <Form.Item label="总库容" name="capacity"><InputNumber className="w-full" min={0} /></Form.Item>
            <Form.Item label="可用库容" name="available_capacity"><InputNumber className="w-full" min={0} /></Form.Item>
            <Form.Item label="服务类型" name="service_types">
              <Select mode="tags" placeholder="如：入库、出库、质押监管、装卸" />
            </Form.Item>
            <Form.Item label="装卸能力" name="loading_capacity"><Input placeholder="如：行车 2 台，叉车 4 台，日装卸 800 吨" /></Form.Item>
            <Form.Item label="营业时间" name="business_hours"><Input placeholder="如：周一至周六 08:00-18:00" /></Form.Item>
            <Form.Item label="支持质押监管" name="pledge_supervision" valuePropName="checked"><Switch /></Form.Item>
          </div>
          <Form.Item label="价格规则" name="price_rule"><Input /></Form.Item>
          <Form.Item label="出库凭证要求" name="outbound_voucher_req"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item label="资质附件" name="certificates">
            <Select mode="tags" placeholder="填写资质文件 URL 或编号，回车添加" />
          </Form.Item>
          <Form.Item label="资源描述" name="description"><Input.TextArea rows={3} /></Form.Item>
          <div className="flex gap-2">
            <Button type="primary" htmlType="submit" loading={isPending}>{editing ? '保存并重新提交' : '提交审核'}</Button>
            {editing && <Button onClick={cancelEdit}>取消编辑</Button>}
          </div>
        </Form>
      </Card>
      <Card title="我的仓储资源">
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={rows}
          pagination={false}
          columns={[
            { title: '仓库名称', dataIndex: 'warehouse_name' },
            { title: '区域', render: (_, r) => [r.province, r.city].filter(Boolean).join(' / ') || '-' },
            { title: '可用库容', dataIndex: 'available_capacity' },
            { title: '装卸能力', dataIndex: 'loading_capacity', render: (v?: string) => v || '-' },
            { title: '质押监管', dataIndex: 'pledge_supervision', render: (v?: boolean) => <Tag color={v ? 'green' : undefined}>{v ? '支持' : '不支持'}</Tag> },
            { title: '状态', dataIndex: 'status', render: (v: number) => <Tag>{statusText[v] || '未知'}</Tag> },
            { title: '审核备注', dataIndex: 'audit_remark', render: (v?: string) => v || '-' },
            {
              title: '操作',
              render: (_, record) => (
                <div className="flex gap-2">
                  <Button type="link" size="small" onClick={() => startEdit(record)}>编辑</Button>
                  <Button type="link" danger size="small" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(record.id)}>下线</Button>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}
