import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Card,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Timeline,
  Typography,
  Upload,
  message,
} from 'antd'
import {
  CloudUploadOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { UploadFile } from 'antd/es/upload/interface'
import { sellerProductService, type SellerProductRecord } from '@/services/productService'

const { Search } = Input
const { Paragraph, Text } = Typography
const { TextArea } = Input

type ProductStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'offline'

interface ProductFormValues {
  name: string
  category: string
  specs: string
  price: number
  stock: number
  description: string
  imageFiles: UploadFile[]
  qualificationFiles: UploadFile[]
}

const categoryOptions = ['全部', '热轧板卷', '冷轧板卷', '中厚板', '型材', '管材', '建材']

const statusMeta: Record<ProductStatus, { color: string; text: string }> = {
  draft: { color: 'default', text: '草稿' },
  pending_review: { color: 'gold', text: '待审核' },
  approved: { color: 'green', text: '审核通过' },
  rejected: { color: 'red', text: '审核驳回' },
  offline: { color: 'default', text: '已下架' },
}

function normalizeUploadList(fileList?: string[]) {
  return (fileList ?? []).map((file, index) => ({
    uid: `${file}-${index}`,
    name: file,
    status: 'done' as const,
    url: file,
  }))
}

function toPayload(values: ProductFormValues) {
  return {
    name: values.name,
    category: values.category,
    specs: values.specs,
    price: values.price,
    stock: values.stock,
    description: values.description,
    image_urls: (values.imageFiles ?? []).map((file) => file.name),
    qualification_urls: (values.qualificationFiles ?? []).map((file) => file.name),
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<SellerProductRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('全部')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [drawerProduct, setDrawerProduct] = useState<SellerProductRecord | null>(null)
  const [editingProduct, setEditingProduct] = useState<SellerProductRecord | null>(null)
  const [form] = Form.useForm<ProductFormValues>()

  const loadProducts = async () => {
    setLoading(true)
    try {
      const response = await sellerProductService.list()
      setProducts(response.data.data.list)
    } catch (error) {
      message.error('商品列表加载失败，请确认后端和登录状态')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProducts()
  }, [])

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(searchText.toLowerCase()) ||
          product.sku_id.toLowerCase().includes(searchText.toLowerCase())
        const matchesCategory = categoryFilter === '全部' || product.category === categoryFilter
        return matchesSearch && matchesCategory
      }),
    [categoryFilter, products, searchText],
  )

  const openCreateModal = () => {
    setEditingProduct(null)
    form.resetFields()
    form.setFieldsValue({
      imageFiles: [],
      qualificationFiles: [],
    } as Partial<ProductFormValues>)
    setIsModalOpen(true)
  }

  const openResubmitModal = (product: SellerProductRecord) => {
    setEditingProduct(product)
    form.setFieldsValue({
      name: product.name,
      category: product.category,
      specs: product.specs,
      price: product.price,
      stock: product.stock,
      description: product.description,
      imageFiles: normalizeUploadList(product.image_urls),
      qualificationFiles: normalizeUploadList(product.qualification_urls),
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    form.resetFields()
    setEditingProduct(null)
    setIsModalOpen(false)
  }

  const handleSubmitForReview = async () => {
    const values = await form.validateFields()
    setSubmitting(true)
    try {
      if (editingProduct) {
        await sellerProductService.update(editingProduct.id, toPayload(values))
        message.success('商品已重新提交审核')
      } else {
        await sellerProductService.create(toPayload(values))
        message.success('商品已提交审核，请等待平台处理')
      }
      closeModal()
      await loadProducts()
    } catch (error) {
      message.error('提交失败，请确认后端服务正常且当前账号已登录')
    } finally {
      setSubmitting(false)
    }
  }

  const columns: ColumnsType<SellerProductRecord> = [
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      width: 280,
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-900">{record.name}</div>
          <Text type="secondary">
            {record.sku_id} · 卖家UID {record.seller_uid}
          </Text>
        </div>
      ),
    },
    {
      title: '品类',
      dataIndex: 'category',
      key: 'category',
      render: (value) => <Tag color="blue">{value}</Tag>,
    },
    { title: '规格/品牌', dataIndex: 'specs', key: 'specs' },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      render: (value: number) => `¥${value}/吨`,
    },
    {
      title: '库存',
      key: 'stock',
      render: (_, record) => `${record.visible_stock}/${record.stock} 吨`,
    },
    {
      title: '审核状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: ProductStatus, record) => (
        <div>
          <Tag color={statusMeta[status].color}>{statusMeta[status].text}</Tag>
          {record.audit_remark ? <div className="mt-1 max-w-56 text-xs text-red-500">{record.audit_remark}</div> : null}
        </div>
      ),
    },
    {
      title: '资料',
      key: 'files',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text type="secondary">主图 {record.image_urls.length} 份</Text>
          <Text type="secondary">审核资料 {record.qualification_urls.length} 份</Text>
        </Space>
      ),
    },
    {
      title: '最近提交',
      dataIndex: 'submitted_at',
      key: 'submitted_at',
      width: 180,
      render: (value?: string) => value || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space wrap>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setDrawerProduct(record)}>
            查看审核
          </Button>
          {record.status === 'rejected' ? (
            <Button type="link" size="small" icon={<ReloadOutlined />} onClick={() => openResubmitModal(record)}>
              重新提交
            </Button>
          ) : null}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card
        title="商品管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            发布商品
          </Button>
        }
      >
        <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          商品发布后不会直接上架。卖家需上传商品主图和审核资料，提交后进入平台审核；审核通过后方可在买家端显示。
        </div>

        <Space className="mb-4" wrap>
          <Search
            placeholder="搜索商品名称或 SKU"
            allowClear
            style={{ width: 320 }}
            onSearch={setSearchText}
            prefix={<SearchOutlined />}
          />
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ width: 160 }}
            options={categoryOptions.map((category) => ({ label: category, value: category }))}
          />
          <Button onClick={() => void loadProducts()}>刷新</Button>
        </Space>

        <Spin spinning={loading}>
          <Table columns={columns} dataSource={filteredProducts} rowKey="id" pagination={{ pageSize: 10 }} />
        </Spin>
      </Card>

      <Modal
        title={editingProduct ? '补充资料并重新提交审核' : '发布商品并提交审核'}
        open={isModalOpen}
        onOk={() => void handleSubmitForReview()}
        onCancel={closeModal}
        width={720}
        okText={editingProduct ? '重新提交审核' : '提交审核'}
        confirmLoading={submitting}
      >
        <Form<ProductFormValues> form={form} layout="vertical" initialValues={{ imageFiles: [], qualificationFiles: [] }}>
          <Form.Item name="name" label="商品名称" rules={[{ required: true, message: '请输入商品名称' }]}>
            <Input placeholder="例如：Q235B 热轧板卷 3.0*1500*C" />
          </Form.Item>
          <Form.Item name="category" label="品类" rules={[{ required: true, message: '请选择品类' }]}>
            <Select
              placeholder="请选择品类"
              options={categoryOptions
                .filter((category) => category !== '全部')
                .map((category) => ({ label: category, value: category }))}
            />
          </Form.Item>
          <Form.Item name="specs" label="规格/品牌" rules={[{ required: true, message: '请输入规格或品牌' }]}>
            <Input placeholder="例如：宝钢 / 首钢 / 鞍钢" />
          </Form.Item>
          <Space className="w-full" size="large">
            <Form.Item name="price" label="单价（元/吨）" rules={[{ required: true, message: '请输入单价' }]}>
              <InputNumber min={0} className="w-60" placeholder="请输入单价" />
            </Form.Item>
            <Form.Item name="stock" label="库存（吨）" rules={[{ required: true, message: '请输入库存' }]}>
              <InputNumber min={0} className="w-60" placeholder="请输入库存" />
            </Form.Item>
          </Space>
          <Form.Item name="description" label="商品说明" rules={[{ required: true, message: '请输入商品说明' }]}>
            <TextArea rows={4} placeholder="填写材质、交货方式、可售批次等信息，供审核人员确认商品可售性。" />
          </Form.Item>
          <Form.Item
            name="imageFiles"
            label="商品主图上传"
            valuePropName="fileList"
            getValueFromEvent={(event) => event?.fileList ?? []}
            rules={[
              {
                validator: async (_, fileList: UploadFile[]) => {
                  if (fileList && fileList.length > 0) {
                    return
                  }
                  throw new Error('请至少上传 1 张商品主图')
                },
              },
            ]}
            extra="当前本地开发环境会把文件名写入数据库，后续可再接入对象存储。"
          >
            <Upload beforeUpload={() => false} listType="picture" maxCount={5}>
              <Button icon={<CloudUploadOutlined />}>上传主图</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            name="qualificationFiles"
            label="审核资料上传"
            valuePropName="fileList"
            getValueFromEvent={(event) => event?.fileList ?? []}
            rules={[
              {
                validator: async (_, fileList: UploadFile[]) => {
                  if (fileList && fileList.length > 0) {
                    return
                  }
                  throw new Error('请上传至少 1 份审核资料')
                },
              },
            ]}
            extra="建议上传材质证明、质保书、出厂单等材料。"
          >
            <Upload beforeUpload={() => false} maxCount={8}>
              <Button icon={<CloudUploadOutlined />}>上传审核资料</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Drawer title="审核详情" width={680} open={Boolean(drawerProduct)} onClose={() => setDrawerProduct(null)} destroyOnClose>
        {drawerProduct ? (
          <Space direction="vertical" size="large" className="w-full">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="商品名称">{drawerProduct.name}</Descriptions.Item>
              <Descriptions.Item label="SKU">{drawerProduct.sku_id}</Descriptions.Item>
              <Descriptions.Item label="审核状态">
                <Tag color={statusMeta[drawerProduct.status].color}>{statusMeta[drawerProduct.status].text}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="卖家 UID">{drawerProduct.seller_uid}</Descriptions.Item>
              <Descriptions.Item label="最近提交时间">{drawerProduct.submitted_at || '-'}</Descriptions.Item>
              <Descriptions.Item label="审核说明">{drawerProduct.audit_remark || '平台审核中，暂无反馈。'}</Descriptions.Item>
            </Descriptions>

            <div>
              <div className="mb-2 font-medium text-gray-900">资料清单</div>
              <Space direction="vertical" size="small">
                <Text>商品主图：{drawerProduct.image_urls.join('、')}</Text>
                <Text>审核资料：{drawerProduct.qualification_urls.join('、')}</Text>
              </Space>
            </div>

            <div>
              <div className="mb-2 font-medium text-gray-900">审核流程</div>
              <Timeline
                items={drawerProduct.audit_logs.map((log) => ({
                  children: (
                    <div>
                      <div className="font-medium">{log.operator_name || log.action}</div>
                      <Paragraph className="!mb-1 !mt-1 text-gray-500">
                        {log.remark || `${log.action} -> ${log.status}`}
                      </Paragraph>
                      <Text type="secondary">{log.created_at}</Text>
                    </div>
                  ),
                }))}
              />
            </div>
          </Space>
        ) : null}
      </Drawer>
    </div>
  )
}
