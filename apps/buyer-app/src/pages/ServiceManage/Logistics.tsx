import { Button, Card, Form, Input, InputNumber, Table, Tag, message } from 'antd'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { LogisticsServiceItem, serviceOfferService } from '@/services/serviceOfferService'

const statusText: Record<number, string> = { 1: '待审核', 2: '已通过', 3: '已驳回', 4: '已下线' }

export default function LogisticsManagePage() {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['my-logistics-services'], queryFn: serviceOfferService.listMyLogistics })
  const rows = data?.data ?? []
  const { mutate, isPending } = useMutation({
    mutationFn: (payload: Partial<LogisticsServiceItem>) => serviceOfferService.createLogistics(payload),
    onSuccess: () => {
      message.success('物流资源已提交审核')
      form.resetFields()
      void queryClient.invalidateQueries({ queryKey: ['my-logistics-services'] })
    },
  })

  return (
    <div className="space-y-4">
      <Card title="上架物流资源">
        <Form form={form} layout="vertical" onFinish={(values) => mutate(values)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Form.Item label="服务名称" name="name" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item label="车型" name="vehicle_type"><Input /></Form.Item>
            <Form.Item label="起始地" name="route_start" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item label="目的地" name="route_end" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item label="载重能力" name="load_capacity"><InputNumber className="w-full" min={0} /></Form.Item>
            <Form.Item label="服务范围" name="service_scope"><Input /></Form.Item>
          </div>
          <Form.Item label="价格规则" name="price_rule"><Input /></Form.Item>
          <Form.Item label="资源描述" name="description"><Input.TextArea rows={3} /></Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending}>提交审核</Button>
        </Form>
      </Card>
      <Card title="我的物流资源">
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={rows}
          pagination={false}
          columns={[
            { title: '服务名称', dataIndex: 'name' },
            { title: '线路', render: (_, r) => `${r.route_start || '-'} -> ${r.route_end || '-'}` },
            { title: '车型', dataIndex: 'vehicle_type' },
            { title: '状态', dataIndex: 'status', render: (v: number) => <Tag>{statusText[v] || '未知'}</Tag> },
            { title: '审核备注', dataIndex: 'audit_remark', render: (v?: string) => v || '-' },
          ]}
        />
      </Card>
    </div>
  )
}
