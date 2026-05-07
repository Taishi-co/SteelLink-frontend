import { Button, Card, Form, Input, InputNumber, Select, Table, Tag, message } from 'antd'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { LogisticsServiceItem, serviceOfferService } from '@/services/serviceOfferService'
import { useState } from 'react'

const statusText: Record<number, string> = { 1: '待审核', 2: '已通过', 3: '已驳回', 4: '已下线' }

export default function LogisticsManagePage() {
  const [form] = Form.useForm<Partial<LogisticsServiceItem> & { quote_rules_text?: string }>()
  const [editing, setEditing] = useState<LogisticsServiceItem | null>(null)
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['my-logistics-services'], queryFn: serviceOfferService.listMyLogistics })
  const rows = data?.data ?? []
  const { mutate, isPending } = useMutation({
    mutationFn: (payload: Partial<LogisticsServiceItem>) => editing
      ? serviceOfferService.updateLogistics(editing.id, payload)
      : serviceOfferService.createLogistics(payload),
    onSuccess: () => {
      message.success(editing ? '物流资源已更新并重新提交审核' : '物流资源已提交审核')
      setEditing(null)
      form.resetFields()
      void queryClient.invalidateQueries({ queryKey: ['my-logistics-services'] })
    },
  })
  const deleteMutation = useMutation({
    mutationFn: (id: number) => serviceOfferService.deleteLogistics(id),
    onSuccess: () => {
      message.success('物流资源已下线')
      void queryClient.invalidateQueries({ queryKey: ['my-logistics-services'] })
    },
  })

  const submit = (values: Partial<LogisticsServiceItem> & { quote_rules_text?: string }) => {
    const { quote_rules_text, ...payload } = values
    if (quote_rules_text?.trim()) {
      try {
        payload.quote_rules = JSON.parse(quote_rules_text)
      } catch {
        message.error('结构化报价规则必须是合法 JSON')
        return
      }
    } else {
      payload.quote_rules = undefined
    }
    mutate(payload)
  }

  const startEdit = (record: LogisticsServiceItem) => {
    setEditing(record)
    form.setFieldsValue({
      ...record,
      quote_rules_text: record.quote_rules ? JSON.stringify(record.quote_rules, null, 2) : '',
    })
  }

  const cancelEdit = () => {
    setEditing(null)
    form.resetFields()
  }

  return (
    <div className="space-y-4">
      <Card title={editing ? `编辑物流资源：${editing.name}` : '上架物流资源'}>
        <Form form={form} layout="vertical" onFinish={submit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Form.Item label="服务名称" name="name" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item label="车队名称" name="fleet_name"><Input /></Form.Item>
            <Form.Item label="车型" name="vehicle_type"><Input /></Form.Item>
            <Form.Item label="起始地" name="route_start" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item label="目的地" name="route_end" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item label="载重能力" name="load_capacity"><InputNumber className="w-full" min={0} /></Form.Item>
            <Form.Item label="服务范围" name="service_scope"><Input /></Form.Item>
            <Form.Item label="车辆资质" name="vehicle_certs">
              <Select mode="tags" placeholder="填写车辆资质文件 URL 或编号，回车添加" />
            </Form.Item>
            <Form.Item label="司机资质" name="driver_certs">
              <Select mode="tags" placeholder="填写司机资质文件 URL 或编号，回车添加" />
            </Form.Item>
          </div>
          <Form.Item label="价格规则" name="price_rule"><Input /></Form.Item>
          <Form.Item label="结构化报价规则 JSON" name="quote_rules_text">
            <Input.TextArea rows={5} placeholder={'例如：{"base_fee":300,"per_ton_km":0.8,"min_fee":800}'} />
          </Form.Item>
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
            { title: '车队', dataIndex: 'fleet_name', render: (v?: string) => v || '-' },
            { title: '车辆资质', dataIndex: 'vehicle_certs', render: (v?: string[]) => v?.length ? `${v.length} 项` : '-' },
            { title: '司机资质', dataIndex: 'driver_certs', render: (v?: string[]) => v?.length ? `${v.length} 项` : '-' },
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
