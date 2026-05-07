import { Button, Card, Form, Input, InputNumber, Table, Tag, message } from 'antd'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FinanceServiceItem, serviceOfferService } from '@/services/serviceOfferService'

const statusText: Record<number, string> = { 1: '待审核', 2: '已通过', 3: '已驳回', 4: '已下线' }

export default function FinanceManagePage() {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['my-finance-services'], queryFn: serviceOfferService.listMyFinance })
  const rows = data?.data ?? []
  const { mutate, isPending } = useMutation({
    mutationFn: (payload: Partial<FinanceServiceItem>) => serviceOfferService.createFinance(payload),
    onSuccess: () => {
      message.success('金融服务已提交审核')
      form.resetFields()
      void queryClient.invalidateQueries({ queryKey: ['my-finance-services'] })
    },
  })

  return (
    <div className="space-y-4">
      <Card title="上架金融服务">
        <Form form={form} layout="vertical" onFinish={(values) => mutate(values)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Form.Item label="服务名称" name="name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="服务类型" name="finance_type">
              <Input placeholder="托盘垫资 / 订单融资 / 保理" />
            </Form.Item>
            <Form.Item label="最低金额" name="min_amount">
              <InputNumber className="w-full" min={0} />
            </Form.Item>
            <Form.Item label="最高金额" name="max_amount">
              <InputNumber className="w-full" min={0} />
            </Form.Item>
            <Form.Item label="账期天数" name="term_days">
              <InputNumber className="w-full" min={0} precision={0} />
            </Form.Item>
            <Form.Item label="年化费率(%)" name="annual_rate">
              <InputNumber className="w-full" min={0} precision={4} />
            </Form.Item>
          </div>
          <Form.Item label="手续费规则" name="fee_rule">
            <Input />
          </Form.Item>
          <Form.Item label="风控要求" name="risk_control_rule">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="服务描述" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending}>提交审核</Button>
        </Form>
      </Card>
      <Card title="我的金融服务">
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={rows}
          pagination={false}
          columns={[
            { title: '服务名称', dataIndex: 'name' },
            { title: '类型', dataIndex: 'finance_type', render: (v?: string) => v || '-' },
            { title: '金额范围', render: (_, r) => `${r.min_amount || 0} - ${r.max_amount || 0}` },
            { title: '账期/费率', render: (_, r) => `${r.term_days || 0}天 / ${r.annual_rate || 0}%` },
            { title: '状态', dataIndex: 'status', render: (v: number) => <Tag>{statusText[v] || '未知'}</Tag> },
            { title: '审核备注', dataIndex: 'audit_remark', render: (v?: string) => v || '-' },
          ]}
        />
      </Card>
    </div>
  )
}
