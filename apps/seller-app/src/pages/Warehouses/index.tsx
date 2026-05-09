import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Space, Spin, Table, Tag, Typography, message } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getErrorMessage } from '@steellink/shared/utils'
import { serviceOfferService, type WarehouseServiceItem } from '@/services/serviceOfferService'

const { Text } = Typography
const { TextArea } = Input

const statusMeta: Record<number, { color: string; text: string }> = {
  1: { color: 'gold', text: '待审核' },
  2: { color: 'green', text: '审核通过' },
  3: { color: 'red', text: '审核驳回' },
  4: { color: 'default', text: '已停用' },
}

function warehouseRegion(item: WarehouseServiceItem) {
  return [item.province, item.city, item.district].filter(Boolean).join(' / ') || '-'
}

export default function WarehousesPage() {
  const [form] = Form.useForm<Partial<WarehouseServiceItem>>()
  const [warehouses, setWarehouses] = useState<WarehouseServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<WarehouseServiceItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const loadWarehouses = async () => {
    setLoading(true)
    try {
      const response = await serviceOfferService.listMyWarehouses()
      setWarehouses(response.data)
    } catch (error) {
      message.error(getErrorMessage(error, '仓库列表加载失败，请确认当前企业已开通销售能力'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadWarehouses()
  }, [])

  const summary = useMemo(
    () =>
      warehouses.reduce(
        (acc, item) => {
          acc.total += 1
          acc[item.status] = (acc[item.status] || 0) + 1
          return acc
        },
        { total: 0 } as Record<number | 'total', number>,
      ),
    [warehouses],
  )

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({
      service_types: ['发货仓', '现货仓储'],
      pledge_supervision: false,
    })
    setModalOpen(true)
  }

  const openEdit = (record: WarehouseServiceItem) => {
    setEditing(record)
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
    form.resetFields()
  }

  const saveWarehouse = async () => {
    const values = await form.validateFields()
    setSubmitting(true)
    try {
      if (editing) {
        await serviceOfferService.updateWarehouse(editing.id, values)
        message.success('仓库已更新并重新提交审核')
      } else {
        await serviceOfferService.createWarehouse(values)
        message.success('仓库已提交审核')
      }
      closeModal()
      await loadWarehouses()
    } catch (error) {
      message.error(getErrorMessage(error, '仓库保存失败'))
    } finally {
      setSubmitting(false)
    }
  }

  const stopWarehouse = async (id: number) => {
    try {
      await serviceOfferService.deleteWarehouse(id)
      message.success('仓库已停用')
      await loadWarehouses()
    } catch (error) {
      message.error(getErrorMessage(error, '仓库停用失败'))
    }
  }

  const columns: ColumnsType<WarehouseServiceItem> = [
    {
      title: '仓库',
      dataIndex: 'warehouse_name',
      key: 'warehouse_name',
      width: 240,
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-900">{record.warehouse_name}</div>
          <Text type="secondary">WH-{String(record.id).padStart(6, '0')}</Text>
        </div>
      ),
    },
    { title: '地区', key: 'region', width: 180, render: (_, record) => warehouseRegion(record) },
    { title: '地址', dataIndex: 'address', key: 'address', ellipsis: true },
    {
      title: '库容',
      key: 'capacity',
      width: 150,
      render: (_, record) => `${Number(record.available_capacity || 0).toLocaleString()} / ${Number(record.capacity || 0).toLocaleString()} 吨`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (value: number) => {
        const meta = statusMeta[value] || { color: 'default', text: `状态 ${value}` }
        return <Tag color={meta.color}>{meta.text}</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space wrap>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确认停用仓库？" onConfirm={() => void stopWarehouse(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>
              停用
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="min-w-0">
      <Card
        title="仓库管理"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => void loadWarehouses()}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增仓库
            </Button>
          </Space>
        }
      >
        <Alert
          className="mb-4"
          type="info"
          showIcon
          message="仓库审核通过后才能绑定商品"
          description="卖家可以维护自有发货仓库；新增或编辑后会进入平台审核。审核通过的仓库可在商品发布页选择，AI采购和订单会读取商品绑定的发货仓库。"
        />

        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <Text type="secondary">全部仓库</Text>
            <div className="mt-1 text-2xl font-semibold">{summary.total}</div>
          </div>
          {[1, 2, 3, 4].map((status) => (
            <div key={status} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <Text type="secondary">{statusMeta[status].text}</Text>
              <div className="mt-1 text-2xl font-semibold">{summary[status] || 0}</div>
            </div>
          ))}
        </div>

        <Spin spinning={loading}>
          <Table columns={columns} dataSource={warehouses} rowKey="id" scroll={{ x: 900 }} pagination={{ pageSize: 10, showSizeChanger: false }} />
        </Spin>
      </Card>

      <Modal
        title={editing ? '编辑仓库' : '新增仓库'}
        open={modalOpen}
        onOk={() => void saveWarehouse()}
        onCancel={closeModal}
        confirmLoading={submitting}
        okText={editing ? '保存并提交审核' : '提交审核'}
        width={720}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="warehouse_name" label="仓库名称" rules={[{ required: true, message: '请输入仓库名称' }]}>
            <Input placeholder="例如：唐山丰润现货仓" />
          </Form.Item>
          <Space className="w-full" size="large" wrap>
            <Form.Item name="province" label="省份" rules={[{ required: true, message: '请输入省份' }]}>
              <Input className="w-48" placeholder="例如：河北省" />
            </Form.Item>
            <Form.Item name="city" label="城市" rules={[{ required: true, message: '请输入城市' }]}>
              <Input className="w-48" placeholder="例如：唐山市" />
            </Form.Item>
            <Form.Item name="district" label="区县">
              <Input className="w-48" placeholder="例如：丰润区" />
            </Form.Item>
          </Space>
          <Form.Item name="address" label="详细地址" rules={[{ required: true, message: '请输入详细地址' }]}>
            <Input placeholder="请输入仓库详细地址" />
          </Form.Item>
          <Space className="w-full" size="large" wrap>
            <Form.Item name="capacity" label="总库容（吨）" rules={[{ required: true, message: '请输入总库容' }]}>
              <InputNumber min={0} className="w-48" />
            </Form.Item>
            <Form.Item name="available_capacity" label="可用库容（吨）" rules={[{ required: true, message: '请输入可用库容' }]}>
              <InputNumber min={0} className="w-48" />
            </Form.Item>
            <Form.Item name="loading_capacity" label="装卸能力">
              <Input className="w-48" placeholder="例如：200吨/日" />
            </Form.Item>
          </Space>
          <Space className="w-full" size="large" wrap>
            <Form.Item name="business_hours" label="营业时间">
              <Input className="w-60" placeholder="例如：8:00-18:00" />
            </Form.Item>
            <Form.Item name="price_rule" label="仓储计费规则">
              <Input className="w-80" placeholder="例如：面议 / 0.8元/吨/天" />
            </Form.Item>
          </Space>
          <Form.Item name="description" label="仓库说明">
            <TextArea rows={4} placeholder="填写可发货品类、装卸条件、入库要求等信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
