import { Button, Card, Form, Input, InputNumber, Table, Tag, message } from 'antd'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { serviceOfferService, WarehouseServiceItem } from '@/services/serviceOfferService'

const statusText: Record<number, string> = { 1: '待审核', 2: '已通过', 3: '已驳回', 4: '已下线' }

export default function WarehouseManagePage() {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['my-warehouse-services'], queryFn: serviceOfferService.listMyWarehouses })
  const rows = data?.data ?? []
  const { mutate, isPending } = useMutation({
    mutationFn: (payload: Partial<WarehouseServiceItem>) => serviceOfferService.createWarehouse(payload),
    onSuccess: () => {
      message.success('仓储资源已提交审核')
      form.resetFields()
      void queryClient.invalidateQueries({ queryKey: ['my-warehouse-services'] })
    },
  })

  return (
    <div className="space-y-4">
      <Card title="上架仓储资源">
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
            <Form.Item label="总库容" name="capacity"><InputNumber className="w-full" min={0} /></Form.Item>
            <Form.Item label="可用库容" name="available_capacity"><InputNumber className="w-full" min={0} /></Form.Item>
          </div>
          <Form.Item label="价格规则" name="price_rule"><Input /></Form.Item>
          <Form.Item label="资源描述" name="description"><Input.TextArea rows={3} /></Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending}>提交审核</Button>
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
            { title: '状态', dataIndex: 'status', render: (v: number) => <Tag>{statusText[v] || '未知'}</Tag> },
            { title: '审核备注', dataIndex: 'audit_remark', render: (v?: string) => v || '-' },
          ]}
        />
      </Card>
    </div>
  )
}
