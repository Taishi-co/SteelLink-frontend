import { useState } from 'react'
import { Button, Card, Form, Input, InputNumber, Modal, Space, Table, Tag, message } from 'antd'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { serviceOfferService, WarehouseServiceItem } from '@/services/serviceOfferService'

const statusText: Record<number, string> = { 1: '待审核', 2: '已通过', 3: '已驳回', 4: '已下线' }

export default function WarehouseManagePage() {
  const [form] = Form.useForm()
  const [editing, setEditing] = useState<WarehouseServiceItem | null>(null)
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['my-warehouse-services'], queryFn: serviceOfferService.listMyWarehouses })
  const rows = data?.data ?? []
  const { mutate, isPending } = useMutation({
    mutationFn: (payload: Partial<WarehouseServiceItem>) => editing ? serviceOfferService.updateWarehouse(editing.id, payload) : serviceOfferService.createWarehouse(payload),
    onSuccess: () => {
      message.success(editing ? '仓储资源已更新并提交审核' : '仓储资源已提交审核')
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

  const startEdit = (row: WarehouseServiceItem) => {
    setEditing(row)
    form.setFieldsValue(row)
  }

  const cancelEdit = () => {
    setEditing(null)
    form.resetFields()
  }

  return (
    <div className="space-y-4">
      <Card title={editing ? '编辑仓储资源' : '上架仓储资源'}>
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
          <Space>
            <Button type="primary" htmlType="submit" loading={isPending}>{editing ? '保存并重提审核' : '提交审核'}</Button>
            {editing ? <Button onClick={cancelEdit}>取消编辑</Button> : null}
          </Space>
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
            {
              title: '操作',
              render: (_, row) => (
                <Space>
                  <Button size="small" onClick={() => startEdit(row)}>编辑</Button>
                  <Button
                    size="small"
                    danger
                    loading={deleteMutation.isPending}
                    onClick={() => Modal.confirm({
                      title: '确认下线仓储资源？',
                      okText: '确认下线',
                      cancelText: '取消',
                      onOk: () => deleteMutation.mutate(row.id),
                    })}
                  >
                    下线
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}
