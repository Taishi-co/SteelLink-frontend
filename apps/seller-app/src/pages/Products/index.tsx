import { useEffect, useMemo, useState, type ReactNode } from 'react'
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
  CheckCircleOutlined,
  CloudUploadOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  CloseCircleOutlined,
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
  subCategory: string
  steelMill: string
  material: string
  spec: string
  warehouseName: string
  warehouseCode: string
  province: string
  city: string
  district: string
  address: string
  bundleNo: string
  quantity: number
  unitPrice: number
  minOrderQty: number
  description: string
  deliveryDays: number
  quoteValidity: number
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

const statusSummaryMeta: Record<ProductStatus, { icon: ReactNode; hint: string }> = {
  draft: {
    icon: <InfoCircleOutlined className="text-gray-400" />,
    hint: '草稿状态不会进入平台审核，也不会在商城展示。',
  },
  pending_review: {
    icon: <InfoCircleOutlined className="text-amber-500" />,
    hint: '平台审核中，审核通过后商品会同步到买家端商城。',
  },
  approved: {
    icon: <CheckCircleOutlined className="text-green-500" />,
    hint: '审核通过后商品已具备商城展示资格。',
  },
  rejected: {
    icon: <CloseCircleOutlined className="text-red-500" />,
    hint: '审核驳回后请根据备注修正商品信息并重新提交。',
  },
  offline: {
    icon: <InfoCircleOutlined className="text-gray-400" />,
    hint: '商品已下架，当前不会在买家端展示。',
  },
}

const marketplaceVisibilityMeta: Record<ProductStatus, { color: string; text: string }> = {
  draft: {
    color: 'default',
    text: '草稿状态，买家端不可见',
  },
  pending_review: {
    color: 'gold',
    text: '待审核，买家端不可见',
  },
  approved: {
    color: 'green',
    text: '审核通过，买家端可见',
  },
  rejected: {
    color: 'red',
    text: '审核驳回，需修改后重提',
  },
  offline: {
    color: 'default',
    text: '已下架，买家端不可见',
  },
}

function normalizeUploadList(fileList?: string[]) {
  return (fileList ?? []).map((file, index) => ({
    uid: `${file}-${index}`,
    name: file,
    status: 'done' as const,
    url: file,
  }))
}

function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null) {
    const response = 'response' in error ? error.response : undefined
    if (typeof response === 'object' && response !== null && 'data' in response) {
      const data = response.data
      if (typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string') {
        return data.message
      }
    }
  }
  return undefined
}

function toPayload(values: ProductFormValues) {
  return {
    name: values.name,
    category: values.category,
    sub_category: values.subCategory,
    steel_mill: values.steelMill,
    spec: {
      material: values.material,
      spec: values.spec,
    },
    warehouse_info: {
      warehouse_name: values.warehouseName,
      warehouse_code: values.warehouseCode,
      province: values.province,
      city: values.city,
      district: values.district,
      address: values.address,
    },
    bundle_no: values.bundleNo,
    quantity: values.quantity,
    unit_price: values.unitPrice,
    min_order_qty: values.minOrderQty,
    description: values.description,
    delivery_days: values.deliveryDays,
    quote_validity: values.quoteValidity,
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<SellerProductRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('全部')
  const [statusFilter, setStatusFilter] = useState<'all' | ProductStatus>('all')
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
        const matchesStatus = statusFilter === 'all' || product.status === statusFilter
        return matchesSearch && matchesCategory && matchesStatus
      }),
    [categoryFilter, products, searchText, statusFilter],
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
      subCategory: product.sub_category,
      steelMill: product.steel_mill,
      material: product.material,
      spec: product.specs,
      warehouseName: product.warehouse_name,
      warehouseCode: product.warehouse_code,
      province: product.province,
      city: product.city,
      district: product.district,
      address: product.address,
      bundleNo: product.bundle_no,
      quantity: product.stock,
      unitPrice: product.price,
      minOrderQty: product.min_order_qty,
      description: product.description,
      deliveryDays: 3,
      quoteValidity: 72,
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
      await sellerProductService.create(toPayload(values))
      message.success(editingProduct ? '商品已重新提交审核' : '商品已提交审核，请等待平台处理')
      closeModal()
      await loadProducts()
    } catch (error: unknown) {
      const serverMessage = getErrorMessage(error)
      message.error(serverMessage || '提交失败，请确认后端服务正常且当前账号已登录')
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
        <div className="max-w-64">
          <Space size={6} wrap>
            <Tag color={statusMeta[status].color}>{statusMeta[status].text}</Tag>
            {status === 'approved' && record.approved_at ? <Text type="secondary">通过于 {record.approved_at}</Text> : null}
          </Space>
          <div className="mt-1 text-xs text-gray-500">{record.review_status_text}</div>
          {record.audit_remark ? <div className="mt-1 text-xs text-red-500">审核备注：{record.audit_remark}</div> : null}
        </div>
      ),
    },
    {
      title: '商城展示',
      key: 'marketplace_visibility',
      width: 180,
      render: (_, record) => (
        <Tag color={marketplaceVisibilityMeta[record.status].color}>
          {marketplaceVisibilityMeta[record.status].text}
        </Tag>
      ),
    },
    {
      title: '审核时间',
      dataIndex: 'approved_at',
      key: 'approved_at',
      width: 180,
      render: (value: string | undefined, record) => {
        if (record.status === 'approved') {
          return value || '已通过，时间待同步'
        }
        if (record.status === 'rejected') {
          return '未通过'
        }
        if (record.status === 'pending_review') {
          return '审核中'
        }
        return '-'
      },
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
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 160 }}
            options={[
              { label: '全部状态', value: 'all' },
              { label: '待审核', value: 'pending_review' },
              { label: '审核通过', value: 'approved' },
              { label: '审核驳回', value: 'rejected' },
              { label: '已下架', value: 'offline' },
              { label: '草稿', value: 'draft' },
            ]}
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
          <Space className="w-full" size="large" wrap>
            <Form.Item name="subCategory" label="子品类" rules={[{ required: true, message: '请输入子品类' }]}>
              <Input placeholder="例如：低合金卷 / 普卷" className="w-60" />
            </Form.Item>
            <Form.Item name="steelMill" label="钢厂" rules={[{ required: true, message: '请输入钢厂' }]}>
              <Input placeholder="例如：宝钢 / 首钢 / 鞍钢" className="w-60" />
            </Form.Item>
          </Space>
          <Space className="w-full" size="large" wrap>
            <Form.Item name="material" label="材质" rules={[{ required: true, message: '请输入材质' }]}>
              <Input placeholder="例如：Q235B" className="w-60" />
            </Form.Item>
            <Form.Item name="spec" label="规格" rules={[{ required: true, message: '请输入规格' }]}>
              <Input placeholder="例如：3.0*1500*C" className="w-60" />
            </Form.Item>
          </Space>
          <Space className="w-full" size="large" wrap>
            <Form.Item name="bundleNo" label="捆包号" rules={[{ required: true, message: '请输入捆包号' }]}>
              <Input placeholder="请输入唯一捆包号" className="w-60" />
            </Form.Item>
            <Form.Item name="minOrderQty" label="最小起订量（吨）" rules={[{ required: true, message: '请输入最小起订量' }]}>
              <InputNumber min={0.01} className="w-60" placeholder="请输入最小起订量" />
            </Form.Item>
          </Space>
          <Space className="w-full" size="large" wrap>
            <Form.Item name="warehouseName" label="仓库名称" rules={[{ required: true, message: '请输入仓库名称' }]}>
              <Input placeholder="例如：唐山仓库A区" className="w-60" />
            </Form.Item>
            <Form.Item name="warehouseCode" label="仓库编码">
              <Input placeholder="例如：TS-A-01" className="w-60" />
            </Form.Item>
          </Space>
          <Space className="w-full" size="large" wrap>
            <Form.Item name="province" label="省份" rules={[{ required: true, message: '请输入省份' }]}>
              <Input placeholder="例如：河北省" className="w-60" />
            </Form.Item>
            <Form.Item name="city" label="城市" rules={[{ required: true, message: '请输入城市' }]}>
              <Input placeholder="例如：唐山市" className="w-60" />
            </Form.Item>
          </Space>
          <Space className="w-full" size="large" wrap>
            <Form.Item name="district" label="区县">
              <Input placeholder="例如：丰润区" className="w-60" />
            </Form.Item>
            <Form.Item name="address" label="仓库地址" rules={[{ required: true, message: '请输入仓库地址' }]}>
              <Input placeholder="请输入详细仓库地址" className="w-60" />
            </Form.Item>
          </Space>
          <Space className="w-full" size="large">
            <Form.Item name="unitPrice" label="单价（元/吨）" rules={[{ required: true, message: '请输入单价' }]}>
              <InputNumber min={0.01} className="w-60" placeholder="请输入单价" />
            </Form.Item>
            <Form.Item name="quantity" label="库存（吨）" rules={[{ required: true, message: '请输入库存' }]}>
              <InputNumber min={0.01} className="w-60" placeholder="请输入库存" />
            </Form.Item>
          </Space>
          <Space className="w-full" size="large">
            <Form.Item name="deliveryDays" label="交货周期（天）" rules={[{ required: true, message: '请输入交货周期' }]}>
              <InputNumber min={1} className="w-60" placeholder="请输入交货周期" />
            </Form.Item>
            <Form.Item name="quoteValidity" label="报价有效期（小时）" rules={[{ required: true, message: '请输入报价有效期' }]}>
              <InputNumber min={1} className="w-60" placeholder="请输入报价有效期" />
            </Form.Item>
          </Space>
          <Form.Item extra="当前后端真实提交的关键字段是钢厂、仓库信息、捆包号、起订量、交货周期和报价有效期。附件上传后续再接对象存储。">
            <></>
          </Form.Item>
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
              <Descriptions.Item label="主品类">{drawerProduct.category || '-'}</Descriptions.Item>
              <Descriptions.Item label="子品类">{drawerProduct.sub_category || '-'}</Descriptions.Item>
              <Descriptions.Item label="钢厂">{drawerProduct.steel_mill || '-'}</Descriptions.Item>
              <Descriptions.Item label="材质">{drawerProduct.material || '-'}</Descriptions.Item>
              <Descriptions.Item label="规格">{drawerProduct.specs || '-'}</Descriptions.Item>
              <Descriptions.Item label="捆包号">{drawerProduct.bundle_no || '-'}</Descriptions.Item>
              <Descriptions.Item label="最小起订量">{drawerProduct.min_order_qty ? `${drawerProduct.min_order_qty} 吨` : '-'}</Descriptions.Item>
              <Descriptions.Item label="仓库名称">{drawerProduct.warehouse_name || '-'}</Descriptions.Item>
              <Descriptions.Item label="仓库编码">{drawerProduct.warehouse_code || '-'}</Descriptions.Item>
              <Descriptions.Item label="仓库地区">
                {[drawerProduct.province, drawerProduct.city, drawerProduct.district].filter(Boolean).join(' / ') || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="仓库地址">{drawerProduct.address || '-'}</Descriptions.Item>
              <Descriptions.Item label="交货周期">
                {drawerProduct.delivery_days ? `${drawerProduct.delivery_days} 天` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="报价有效期">
                {drawerProduct.quote_validity ? `${drawerProduct.quote_validity} 小时` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="审核状态">
                <Space size={8}>
                  {statusSummaryMeta[drawerProduct.status].icon}
                  <Tag color={statusMeta[drawerProduct.status].color}>{statusMeta[drawerProduct.status].text}</Tag>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="商城展示状态">
                <Tag color={marketplaceVisibilityMeta[drawerProduct.status].color}>
                  {marketplaceVisibilityMeta[drawerProduct.status].text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="卖家 UID">{drawerProduct.seller_uid}</Descriptions.Item>
              <Descriptions.Item label="最近提交时间">{drawerProduct.submitted_at || '-'}</Descriptions.Item>
              <Descriptions.Item label="审核结论">{drawerProduct.review_status_text || '-'}</Descriptions.Item>
              <Descriptions.Item label="审核通过时间">{drawerProduct.approved_at || '-'}</Descriptions.Item>
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
