import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  Alert,
  AutoComplete,
  Button,
  Card,
  Descriptions,
  Drawer,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
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
  EditOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  RiseOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { getErrorMessage } from '@steellink/shared/utils'
import type { ColumnsType } from 'antd/es/table'
import type { UploadFile } from 'antd/es/upload/interface'
import { useNavigate } from 'react-router-dom'
import {
  categoryService,
  fallbackProductCategories,
  type ProductCategory,
  type ProductGrade,
  type ProductSteelMill,
} from '@/services/categoryService'
import { sellerProductService, type SellerProductRecord } from '@/services/productService'
import { uploadService, type UploadPurpose } from '@/services/uploadService'
import { serviceOfferService, type WarehouseServiceItem } from '@/services/serviceOfferService'

const { Search } = Input
const { Paragraph, Text } = Typography
const { TextArea } = Input

type ProductStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'offline'

interface ProductFormValues {
  name: string
  goodsType: 'spot' | 'futures'
  categoryId?: number
  gradeId?: number
  steelMillId?: number
  category: string
  subCategory: string
  steelMill: string
  material: string
  spec: string
  heightSpecType: 'thickness' | 'diameter' | 'height'
  heightSpecValue?: number
  heightSpecUnit: string
  widthSpecType: 'width' | 'wall_thickness'
  widthSpecValue?: number
  widthSpecUnit: string
  lengthType: 'custom' | 'coil' | 'fixed'
  lengthValue?: number
  lengthUnit: string
  warehouseBindingMode: 'platform' | 'manual' | 'unbound'
  platformWarehouseId?: number
  warehouseServiceId?: number
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

interface ProductDisplayFormValues {
  description: string
  deliveryDays: number
  quoteValidity: number
  imageFiles: UploadFile[]
  qualificationFiles: UploadFile[]
}

const goodsTypeMeta: Record<'spot' | 'futures', { color: string; text: string }> = {
  spot: { color: 'blue', text: '现货' },
  futures: { color: 'purple', text: '期货' },
}

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

const summaryStatusItems: Array<{ key: ProductStatus; label: string }> = [
  { key: 'pending_review', label: '审核中' },
  { key: 'approved', label: '已上架' },
  { key: 'rejected', label: '被驳回' },
  { key: 'offline', label: '已下架' },
]

const heightSpecOptions = [
  { label: '厚度', value: 'thickness' },
  { label: '直径', value: 'diameter' },
  { label: '高度', value: 'height' },
]

const widthSpecOptions = [
  { label: '宽度', value: 'width' },
  { label: '壁厚', value: 'wall_thickness' },
]

const lengthTypeOptions = [
  { label: '自定义长度', value: 'custom' },
  { label: '卷', value: 'coil' },
  { label: '定尺', value: 'fixed' },
]

const specTypeLabels: Record<string, string> = {
  thickness: '厚度',
  diameter: '直径',
  height: '高度',
  width: '宽度',
  wall_thickness: '壁厚',
}

const lengthTypeLabels: Record<string, string> = {
  custom: '自定义长度',
  coil: '卷',
  fixed: '定尺',
}

function normalizeUploadList(fileList?: string[]) {
  return (fileList ?? []).map((file, index) => ({
    uid: `${file}-${index}`,
    name: file,
    status: 'done' as const,
    url: file,
  }))
}

function firstImageURL(product: SellerProductRecord) {
  return product.image_urls.find(Boolean)
}

function formatNumber(value?: number) {
  if (!value) return ''
  return Number(value).toLocaleString('zh-CN', { maximumFractionDigits: 3 })
}

function formatStructuredSpec(product: SellerProductRecord) {
  const parts: string[] = []
  if (product.height_spec_value) {
    parts.push(`${specTypeLabels[product.height_spec_type || 'thickness'] || '厚度'} ${formatNumber(product.height_spec_value)}${product.height_spec_unit || 'mm'}`)
  }
  if (product.width_spec_value) {
    parts.push(`${specTypeLabels[product.width_spec_type || 'width'] || '宽度'} ${formatNumber(product.width_spec_value)}${product.width_spec_unit || 'mm'}`)
  }
  if (product.length_type) {
    const lengthLabel = lengthTypeLabels[product.length_type] || product.length_type
    const lengthValue = product.length_value ? ` ${formatNumber(product.length_value)}${product.length_unit || 'mm'}` : ''
    parts.push(`${lengthLabel}${lengthValue}`)
  }
  return parts.length ? parts.join(' / ') : product.specs || '-'
}

async function resolveUploadedURLs(fileList: UploadFile[] = [], purpose: UploadPurpose) {
  const urls: string[] = []

  for (const file of fileList) {
    if (file.url) {
      urls.push(file.url)
      continue
    }
    if (!file.originFileObj) {
      continue
    }
    const uploaded = await uploadService.upload(file.originFileObj, purpose)
    urls.push(uploaded.url)
  }

  return urls
}

function toPayload(values: ProductFormValues, imageURLs: string[], qualificationURLs: string[]) {
  return {
    name: values.name,
    goods_type: values.goodsType || 'spot',
    category_id: values.categoryId,
    grade_id: values.gradeId,
    steel_mill_id: values.steelMillId,
    category: values.category,
    sub_category: values.subCategory,
    steel_mill: values.steelMill,
    spec: {
      material: values.material,
      spec: values.spec,
      thickness: values.heightSpecType === 'thickness' && values.heightSpecValue ? String(values.heightSpecValue) : undefined,
      width: values.widthSpecType === 'width' && values.widthSpecValue ? String(values.widthSpecValue) : undefined,
      length: values.lengthValue ? String(values.lengthValue) : undefined,
      height_spec_type: values.heightSpecType,
      height_spec_value: values.heightSpecValue,
      height_spec_unit: values.heightSpecUnit || 'mm',
      width_spec_type: values.widthSpecType,
      width_spec_value: values.widthSpecValue,
      width_spec_unit: values.widthSpecUnit || 'mm',
      length_type: values.lengthType,
      length_value: values.lengthValue,
      length_unit: values.lengthUnit || 'mm',
    },
    warehouse_service_id: values.warehouseServiceId || undefined,
    warehouse_info: {
      warehouse_service_id: values.warehouseServiceId || undefined,
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
    images: imageURLs,
    quality_cert: qualificationURLs[0] || '',
    description: values.description,
    delivery_days: values.deliveryDays,
    quote_validity: values.quoteValidity,
  }
}

function toDisplayPayload(values: ProductDisplayFormValues, imageURLs: string[], qualificationURLs: string[]) {
  return {
    images: imageURLs,
    quality_cert: qualificationURLs[0] || '',
    description: values.description,
    delivery_days: values.deliveryDays,
    quote_validity: values.quoteValidity,
  }
}

export default function ProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<SellerProductRecord[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>(fallbackProductCategories)
  const [grades, setGrades] = useState<ProductGrade[]>([])
  const [steelMills, setSteelMills] = useState<ProductSteelMill[]>([])
  const [platformWarehouses, setPlatformWarehouses] = useState<WarehouseServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [warehouseLoading, setWarehouseLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('全部')
  const [statusFilter, setStatusFilter] = useState<'all' | ProductStatus>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDisplayModalOpen, setIsDisplayModalOpen] = useState(false)
  const [drawerProduct, setDrawerProduct] = useState<SellerProductRecord | null>(null)
  const [editingProduct, setEditingProduct] = useState<SellerProductRecord | null>(null)
  const [displayProduct, setDisplayProduct] = useState<SellerProductRecord | null>(null)
  const [form] = Form.useForm<ProductFormValues>()
  const [displayForm] = Form.useForm<ProductDisplayFormValues>()
  const selectedCategory = Form.useWatch('category', form)

  const loadProducts = async () => {
    setLoading(true)
    try {
      const response = await sellerProductService.list()
      setProducts(response.data.list)
    } catch (error) {
      message.error('商品列表加载失败，请确认后端和登录状态')
    } finally {
      setLoading(false)
    }
  }

  const loadPlatformWarehouses = async () => {
    setWarehouseLoading(true)
    try {
      const [publicResponse, mineResponse] = await Promise.allSettled([
        serviceOfferService.listWarehouses({ page_size: 100 }),
        serviceOfferService.listMyWarehouses(),
      ])
      const merged = new Map<number, WarehouseServiceItem>()
      if (publicResponse.status === 'fulfilled') {
        publicResponse.value.data.list.forEach((item) => merged.set(item.id, item))
      }
      if (mineResponse.status === 'fulfilled') {
        mineResponse.value.data.forEach((item) => merged.set(item.id, item))
      }
      setPlatformWarehouses(Array.from(merged.values()))
    } catch {
      message.warning('仓库列表加载失败，可切换为手动填写仓库')
    } finally {
      setWarehouseLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const [categoryResponse, gradeResponse, steelMillResponse] = await Promise.allSettled([
        categoryService.list(),
        categoryService.listGrades(),
        categoryService.listSteelMills(),
      ])
      if (categoryResponse.status === 'fulfilled') {
        setCategories(categoryResponse.value.data.length > 0 ? categoryResponse.value.data : fallbackProductCategories)
      } else {
        setCategories(fallbackProductCategories)
      }
      if (gradeResponse.status === 'fulfilled') {
        setGrades(gradeResponse.value.data)
      }
      if (steelMillResponse.status === 'fulfilled') {
        setSteelMills(steelMillResponse.value.data)
      }
    } catch {
      setCategories(fallbackProductCategories)
    }
  }

  useEffect(() => {
    void loadProducts()
    void loadCategories()
    void loadPlatformWarehouses()
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

  const categorySelectOptions = useMemo(() => {
    const categoryNames = new Set(categories.map((category) => category.name))
    products.forEach((product) => {
      if (product.category) {
        categoryNames.add(product.category)
      }
    })
    return [
      { label: '全部品种', value: '全部' },
      ...Array.from(categoryNames).map((name) => {
        const category = categories.find((item) => item.name === name)
        return {
          label: category?.display_name || name,
          value: name,
        }
      }),
    ]
  }, [categories, products])

  const categoryInputOptions = useMemo(
    () =>
      categories.map((category) => ({
        label: category.display_name || category.name,
        value: category.name,
        id: category.id,
      })),
    [categories],
  )

  const gradeInputOptions = useMemo(() => {
    const category = categories.find((item) => item.name === selectedCategory)
    return grades
      .filter((grade) => !category?.id || grade.category_id === category.id || grade.category_id === 0)
      .map((grade) => ({
        label: grade.display_name || grade.name,
        value: grade.name,
        id: grade.id,
      }))
  }, [categories, grades, selectedCategory])

  const steelMillInputOptions = useMemo(
    () =>
      steelMills.map((mill) => ({
        label: mill.display_name || mill.name,
        value: mill.name,
        id: mill.id,
      })),
    [steelMills],
  )

  const productSummary = useMemo(
    () =>
      products.reduce(
        (summary, product) => {
          summary.total += 1
          summary[product.status] += 1
          return summary
        },
        {
          total: 0,
          draft: 0,
          pending_review: 0,
          approved: 0,
          rejected: 0,
          offline: 0,
        } as Record<ProductStatus | 'total', number>,
      ),
    [products],
  )

  const openCreateModal = () => {
    setEditingProduct(null)
    form.resetFields()
    form.setFieldsValue({
      goodsType: 'spot',
      heightSpecType: 'thickness',
      heightSpecUnit: 'mm',
      widthSpecType: 'width',
      widthSpecUnit: 'mm',
      lengthType: 'coil',
      lengthUnit: 'mm',
      warehouseBindingMode: 'platform',
      deliveryDays: 3,
      quoteValidity: 72,
      imageFiles: [],
      qualificationFiles: [],
    } as Partial<ProductFormValues>)
    setIsModalOpen(true)
  }

  const openEditModal = (product: SellerProductRecord) => {
    setEditingProduct(product)
    form.resetFields()
    form.setFieldsValue({
      name: product.name,
      goodsType: product.goods_type,
      categoryId: product.category_id,
      gradeId: product.grade_id,
      steelMillId: product.steel_mill_id,
      category: product.category,
      subCategory: product.sub_category,
      steelMill: product.steel_mill,
      material: product.material,
      spec: product.specs,
      heightSpecType: (product.height_spec_type as ProductFormValues['heightSpecType']) || 'thickness',
      heightSpecValue: product.height_spec_value,
      heightSpecUnit: product.height_spec_unit || 'mm',
      widthSpecType: (product.width_spec_type as ProductFormValues['widthSpecType']) || 'width',
      widthSpecValue: product.width_spec_value,
      widthSpecUnit: product.width_spec_unit || 'mm',
      lengthType: (product.length_type as ProductFormValues['lengthType']) || 'coil',
      lengthValue: product.length_value,
      lengthUnit: product.length_unit || 'mm',
      warehouseBindingMode: product.warehouse_service_id ? 'platform' : 'manual',
      warehouseServiceId: product.warehouse_service_id,
      platformWarehouseId: product.warehouse_service_id,
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
      deliveryDays: product.delivery_days || 3,
      quoteValidity: product.quote_validity || 72,
      imageFiles: normalizeUploadList(product.image_urls),
      qualificationFiles: normalizeUploadList(product.qualification_urls),
    } as Partial<ProductFormValues>)
    setIsModalOpen(true)
  }

  const handlePlatformWarehouseChange = (warehouseId: number) => {
    const warehouse = platformWarehouses.find((item) => item.id === warehouseId)
    if (!warehouse) return

    form.setFieldsValue({
      warehouseServiceId: warehouse.id,
      warehouseName: warehouse.warehouse_name,
      warehouseCode: `WH-${String(warehouse.id).padStart(6, '0')}`,
      province: warehouse.province,
      city: warehouse.city,
      district: warehouse.district,
      address: warehouse.address,
    })
  }

  const handleCategorySelect = (_value: string, option: { id?: number }) => {
    form.setFieldsValue({ categoryId: option.id, gradeId: undefined })
  }

  const handleCategoryChange = (value: string) => {
    const matched = categories.find((item) => item.name === value)
    form.setFieldsValue({ categoryId: matched?.id, gradeId: undefined })
  }

  const handleGradeSelect = (_value: string, option: { id?: number }) => {
    form.setFieldsValue({ gradeId: option.id })
  }

  const handleGradeChange = (value: string) => {
    const category = categories.find((item) => item.name === form.getFieldValue('category'))
    const matched = grades.find((item) => item.name === value && (!category?.id || item.category_id === category.id || item.category_id === 0))
    form.setFieldsValue({ gradeId: matched?.id })
  }

  const handleSteelMillSelect = (_value: string, option: { id?: number }) => {
    form.setFieldsValue({ steelMillId: option.id })
  }

  const handleSteelMillChange = (value: string) => {
    const matched = steelMills.find((item) => item.name === value)
    form.setFieldsValue({ steelMillId: matched?.id })
  }

  const closeModal = () => {
    form.resetFields()
    setEditingProduct(null)
    setIsModalOpen(false)
  }

  const openDisplayModal = (product: SellerProductRecord) => {
    setDisplayProduct(product)
    displayForm.setFieldsValue({
      description: product.description,
      deliveryDays: product.delivery_days || 3,
      quoteValidity: product.quote_validity || 72,
      imageFiles: normalizeUploadList(product.image_urls),
      qualificationFiles: normalizeUploadList(product.qualification_urls),
    })
    setIsDisplayModalOpen(true)
  }

  const closeDisplayModal = () => {
    displayForm.resetFields()
    setDisplayProduct(null)
    setIsDisplayModalOpen(false)
  }

  const handleSubmitForReview = async () => {
    const values = await form.validateFields()
    setSubmitting(true)
    try {
      const imageURLs = await resolveUploadedURLs(values.imageFiles, 'product_image')
      const qualificationURLs = await resolveUploadedURLs(values.qualificationFiles, 'product_qualification')
      const payload = toPayload(values, imageURLs, qualificationURLs)
      if (editingProduct) {
        await sellerProductService.update(editingProduct.id, payload)
      } else {
        await sellerProductService.create(payload)
      }
      message.success(editingProduct ? '商品已重新提交审核' : '商品已提交审核，请等待平台处理')
      closeModal()
      await loadProducts()
    } catch (error: unknown) {
      message.error(getErrorMessage(error, '提交失败，请确认后端服务正常且当前账号已登录'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateDisplay = async () => {
    if (!displayProduct) return
    const values = await displayForm.validateFields()
    setSubmitting(true)
    try {
      const imageURLs = await resolveUploadedURLs(values.imageFiles, 'product_image')
      const qualificationURLs = await resolveUploadedURLs(values.qualificationFiles, 'product_qualification')
      await sellerProductService.updateDisplay(displayProduct.id, toDisplayPayload(values, imageURLs, qualificationURLs))
      message.success('商品资料已更新并重新进入审核')
      closeDisplayModal()
      await loadProducts()
    } catch (error: unknown) {
      message.error(getErrorMessage(error, '更新失败，请确认后端服务正常且当前账号有权限'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteProduct = async (product: SellerProductRecord) => {
    setSubmitting(true)
    try {
      await sellerProductService.remove(product.id)
      message.success('商品已删除')
      if (drawerProduct?.id === product.id) {
        setDrawerProduct(null)
      }
      await loadProducts()
    } catch (error: unknown) {
      message.error(getErrorMessage(error, '删除失败，请确认商品没有锁定库存且当前账号有权限'))
    } finally {
      setSubmitting(false)
    }
  }

  const columns: ColumnsType<SellerProductRecord> = [
    {
      title: '缩略图',
      key: 'thumbnail',
      width: 96,
      render: (_, record) => {
        const imageURL = firstImageURL(record)
        return imageURL ? (
          <Image
            src={imageURL}
            alt={record.name}
            width={64}
            height={64}
            className="rounded-md object-cover"
            preview={false}
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-md border border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400">
            无图
          </div>
        )
      },
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      width: 260,
      render: (_, record) => (
        <div>
          <div className="line-clamp-2 font-medium text-gray-900">{record.name}</div>
          <Text type="secondary" className="text-xs">
            {record.sku_id} · 卖家UID {record.seller_uid}
          </Text>
          <div className="mt-1">
            <Tag color={goodsTypeMeta[record.goods_type].color}>{goodsTypeMeta[record.goods_type].text}</Tag>
            {record.warehouse_service_id ? <Tag color="cyan">仓储资源 #{record.warehouse_service_id}</Tag> : null}
          </div>
        </div>
      ),
    },
    {
      title: '品种/牌号',
      dataIndex: 'category',
      key: 'category',
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Tag color="blue">{record.sub_category || record.category}</Tag>
          <Text type="secondary" className="text-xs">{record.material || '-'}</Text>
        </Space>
      ),
    },
    {
      title: '规格',
      dataIndex: 'specs',
      key: 'specs',
      width: 220,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{formatStructuredSpec(record)}</Text>
          {record.specs ? <Text type="secondary" className="text-xs">原始：{record.specs}</Text> : null}
        </Space>
      ),
    },
    {
      title: '产地/存放地',
      key: 'origin_warehouse',
      width: 220,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{record.steel_mill || '-'}</Text>
          <Text type="secondary" className="text-xs">{record.warehouse_name || record.city || '-'}</Text>
        </Space>
      ),
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (value: number) => `¥${value}/吨`,
    },
    {
      title: '库存',
      key: 'stock',
      width: 130,
      render: (_, record) => `${record.visible_stock}/${record.stock} 吨`,
    },
    {
      title: '审核状态',
      dataIndex: 'status',
      key: 'status',
      width: 240,
      render: (status: ProductStatus, record) => (
        <div className="max-w-56">
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
      width: 170,
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
      width: 130,
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
            查看详情
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            编辑
          </Button>
          <Button type="link" size="small" icon={<ReloadOutlined />} onClick={() => openDisplayModal(record)}>
            补充资料
          </Button>
          <Popconfirm
            title="确认删除商品？"
            description="删除后该商品不会再出现在卖家商品列表。"
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true, loading: submitting }}
            onConfirm={() => void handleDeleteProduct(record)}
          >
            <Button type="link" danger size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="min-w-0">
      <Card
        title="商品管理"
        extra={
          <Space>
            <Button icon={<RiseOutlined />} onClick={() => navigate('/bidding')}>
              参与竞价
            </Button>
            <Button onClick={() => navigate('/warehouses')}>
              仓库管理
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              发布商品
            </Button>
          </Space>
        }
      >
        <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-5">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`rounded-lg border px-4 py-3 text-left transition ${
              statusFilter === 'all' ? 'border-blue-300 bg-blue-50' : 'border-gray-100 bg-gray-50 hover:border-blue-200'
            }`}
          >
            <div className="text-xs text-gray-500">全部商品</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">{productSummary.total}</div>
          </button>
          {summaryStatusItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setStatusFilter(item.key)}
              className={`rounded-lg border px-4 py-3 text-left transition ${
                statusFilter === item.key ? 'border-blue-300 bg-blue-50' : 'border-gray-100 bg-gray-50 hover:border-blue-200'
              }`}
            >
              <div className="text-xs text-gray-500">{item.label}</div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">{productSummary[item.key]}</div>
            </button>
          ))}
        </div>

        <Alert
          className="mb-4"
          type="warning"
          showIcon
          message="商品发布后不会直接上架"
          description="卖家需上传商品主图和审核资料，提交后进入平台审核；审核通过后方可在买家端显示。"
        />

        <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center">
          <Search
            className="w-full xl:max-w-sm"
            placeholder="搜索商品名称或 SKU"
            allowClear
            onSearch={setSearchText}
            prefix={<SearchOutlined />}
          />
          <div className="grid grid-cols-2 gap-3 xl:flex xl:flex-1">
            <Select
              className="w-full xl:w-40"
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={categorySelectOptions}
            />
            <Select
              className="w-full xl:w-40"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: '全部状态', value: 'all' },
                { label: '待审核', value: 'pending_review' },
                { label: '审核通过', value: 'approved' },
                { label: '审核驳回', value: 'rejected' },
                { label: '已下架', value: 'offline' },
                { label: '草稿', value: 'draft' },
              ]}
            />
          </div>
          <Button icon={<ReloadOutlined />} onClick={() => void loadProducts()}>
            刷新
          </Button>
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredProducts}
            rowKey="id"
            size="middle"
            scroll={{ x: 1800 }}
            pagination={{ pageSize: 10, showSizeChanger: false }}
          />
        </Spin>
      </Card>

      <Modal
        title={editingProduct ? '编辑商品并重新提交审核' : '发布商品并提交审核'}
        open={isModalOpen}
        onOk={() => void handleSubmitForReview()}
        onCancel={closeModal}
        width={860}
        okText={editingProduct ? '保存并提交审核' : '提交审核'}
        confirmLoading={submitting}
      >
        <Form<ProductFormValues>
          form={form}
          layout="vertical"
          initialValues={{ goodsType: 'spot', imageFiles: [], qualificationFiles: [] }}
        >
          <Form.Item name="name" label="商品名称" rules={[{ required: true, message: '请输入商品名称' }]}>
            <Input placeholder="例如：Q235B 热轧板卷 3.0*1500*C" />
          </Form.Item>
          <Form.Item name="goodsType" label="货品类型" rules={[{ required: true, message: '请选择货品类型' }]}>
            <Select
              options={[
                { label: '现货', value: 'spot' },
                { label: '期货', value: 'futures' },
              ]}
            />
          </Form.Item>
          <Form.Item name="categoryId" hidden>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item name="gradeId" hidden>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item name="steelMillId" hidden>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item name="category" label="品种" rules={[{ required: true, message: '请选择或输入品种' }]}>
            <AutoComplete
              options={categoryInputOptions}
              placeholder="请选择品种，不存在时可直接输入新业务品种"
              onSelect={handleCategorySelect}
              onChange={handleCategoryChange}
              filterOption={(inputValue, option) =>
                String(option?.value ?? '').toLowerCase().includes(inputValue.toLowerCase()) ||
                String(option?.label ?? '').toLowerCase().includes(inputValue.toLowerCase())
              }
            />
          </Form.Item>
          <Space className="w-full" size="large" wrap>
            <Form.Item name="subCategory" label="细分品种" rules={[{ required: true, message: '请输入细分品种' }]}>
              <Input placeholder="例如：热轧板卷 / 冷轧板卷" className="w-60" />
            </Form.Item>
            <Form.Item name="steelMill" label="产地/钢厂" rules={[{ required: true, message: '请输入产地或钢厂' }]}>
              <AutoComplete
                className="w-60"
                options={steelMillInputOptions}
                placeholder="例如：宝钢 / 首钢 / 鞍钢"
                onSelect={handleSteelMillSelect}
                onChange={handleSteelMillChange}
                filterOption={(inputValue, option) =>
                  String(option?.value ?? '').toLowerCase().includes(inputValue.toLowerCase()) ||
                  String(option?.label ?? '').toLowerCase().includes(inputValue.toLowerCase())
                }
              />
            </Form.Item>
          </Space>
          <Space className="w-full" size="large" wrap>
            <Form.Item name="material" label="牌号" rules={[{ required: true, message: '请输入牌号' }]}>
              <AutoComplete
                className="w-60"
                options={gradeInputOptions}
                placeholder="例如：Q235B / Q355B / SPHC"
                onSelect={handleGradeSelect}
                onChange={handleGradeChange}
                filterOption={(inputValue, option) =>
                  String(option?.value ?? '').toLowerCase().includes(inputValue.toLowerCase()) ||
                  String(option?.label ?? '').toLowerCase().includes(inputValue.toLowerCase())
                }
              />
            </Form.Item>
            <Form.Item name="spec" label="原始规格" rules={[{ required: true, message: '请输入原始规格' }]}>
              <Input placeholder="例如：3.0*1500*C" className="w-60" />
            </Form.Item>
          </Space>
          <Alert
            className="mb-4"
            type="info"
            showIcon
            message="规格已拆分为可检索字段"
            description="卷材可选择长度为“卷”，定尺板建议填写具体长度；后续台账和截图识别也会落到这些字段后再让商家确认。"
          />
          <Space className="w-full" size="large" wrap>
            <Form.Item name="heightSpecType" label="厚度/直径/高度" rules={[{ required: true, message: '请选择规格维度' }]}>
              <Select className="w-36" options={heightSpecOptions} />
            </Form.Item>
            <Form.Item name="heightSpecValue" label="数值">
              <InputNumber min={0} precision={3} className="w-32" placeholder="例如 3.0" />
            </Form.Item>
            <Form.Item name="heightSpecUnit" label="单位">
              <Input className="w-24" placeholder="mm" />
            </Form.Item>
            <Form.Item name="widthSpecType" label="宽度/壁厚" rules={[{ required: true, message: '请选择规格维度' }]}>
              <Select className="w-36" options={widthSpecOptions} />
            </Form.Item>
            <Form.Item name="widthSpecValue" label="数值">
              <InputNumber min={0} precision={3} className="w-32" placeholder="例如 1500" />
            </Form.Item>
            <Form.Item name="widthSpecUnit" label="单位">
              <Input className="w-24" placeholder="mm" />
            </Form.Item>
          </Space>
          <Space className="w-full" size="large" wrap>
            <Form.Item name="lengthType" label="长度类型" rules={[{ required: true, message: '请选择长度类型' }]}>
              <Select className="w-40" options={lengthTypeOptions} />
            </Form.Item>
            <Form.Item name="lengthValue" label="长度">
              <InputNumber min={0} precision={3} className="w-40" placeholder="卷材可不填" />
            </Form.Item>
            <Form.Item name="lengthUnit" label="单位">
              <Input className="w-24" placeholder="mm" />
            </Form.Item>
          </Space>
          <Space className="w-full" size="large" wrap>
            <Form.Item name="bundleNo" label="捆包号" rules={[{ required: true, message: '请输入捆包号' }]}>
              <Input placeholder="请输入捆包号，可与其他商品重复" className="w-60" />
            </Form.Item>
            <Form.Item name="minOrderQty" label="最小起订量（吨）" rules={[{ required: true, message: '请输入最小起订量' }]}>
              <InputNumber min={0.01} className="w-60" placeholder="请输入最小起订量" />
            </Form.Item>
          </Space>
          <Alert
            className="mb-4"
            type="info"
            showIcon
            message="商品可绑定平台登记仓库"
            description="绑定仓库后，买家下单会自动带出提货仓库并推荐覆盖该仓库线路的物流商；暂不绑定的商品后续需要买家通过物流平台找车确认提货点。当前后端仍要求提交 warehouse_info，暂不绑定仅用于前端业务评审。"
          />
          <Space className="w-full" size="large" wrap>
            <Form.Item name="warehouseBindingMode" label="仓库绑定方式" rules={[{ required: true, message: '请选择仓库绑定方式' }]}>
              <Select
                className="w-60"
                options={[
                  { label: '绑定平台登记仓库', value: 'platform' },
                  { label: '手动填写仓库', value: 'manual' },
                  { label: '暂不绑定仓库', value: 'unbound' },
                ]}
              />
            </Form.Item>
            <Form.Item shouldUpdate={(prev, next) => prev.warehouseBindingMode !== next.warehouseBindingMode}>
              {({ getFieldValue }) =>
                getFieldValue('warehouseBindingMode') === 'platform' ? (
                  <Form.Item name="platformWarehouseId" label="平台登记仓库" rules={[{ required: true, message: '请选择平台登记仓库' }]}>
                    <Select
                      className="w-72"
                      placeholder="选择后自动回填仓库信息"
                      loading={warehouseLoading}
                      onChange={handlePlatformWarehouseChange}
                      options={platformWarehouses.map((warehouse) => ({
                        label: `${warehouse.warehouse_name}（WH-${String(warehouse.id).padStart(6, '0')}）${warehouse.status === 2 ? '' : ' · 待审核'}`,
                        value: warehouse.id,
                        disabled: warehouse.status !== 2,
                      }))}
                    />
                  </Form.Item>
                ) : null
              }
            </Form.Item>
          </Space>
          <Space className="w-full" size="large" wrap>
            <Form.Item name="warehouseServiceId" label="绑定仓储资源 ID">
              <InputNumber min={1} precision={0} className="w-60" placeholder="已审核仓储资源 ID" />
            </Form.Item>
            <Form.Item name="warehouseName" label="仓库名称" rules={[{ required: true, message: '请输入仓库名称' }]}>
              <Input placeholder="例如：唐山仓库A区" className="w-60" />
            </Form.Item>
          </Space>
          <Space className="w-full" size="large" wrap>
            <Form.Item name="warehouseCode" label="仓库编码">
              <Input placeholder="例如：TS-A-01" className="w-60" />
            </Form.Item>
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
          <Form.Item extra="提交审核前会先上传商品主图和审核资料，后端保存真实对象存储 URL。">
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
            extra="商品主图上传到公开桶，用于买家端商城展示。"
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
            extra="建议上传材质证明、质保书、出厂单等材料，文件会上传到私有资料桶。"
          >
            <Upload beforeUpload={() => false} maxCount={8}>
              <Button icon={<CloudUploadOutlined />}>上传审核资料</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="补充商品展示资料"
        open={isDisplayModalOpen}
        onOk={() => void handleUpdateDisplay()}
        onCancel={closeDisplayModal}
        width={680}
        okText="提交审核"
        confirmLoading={submitting}
      >
        {displayProduct ? (
          <Space direction="vertical" size="middle" className="w-full">
            <Alert
              type="info"
              showIcon
              message="仅允许修改展示和审核补充资料"
              description="捆包号、库存、单价、规格、仓库等关键交易字段已锁定。如需调整这些字段，请下架后重新发布对应批次商品。"
            />
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="商品名称">{displayProduct.name}</Descriptions.Item>
              <Descriptions.Item label="捆包号">{displayProduct.bundle_no}</Descriptions.Item>
              <Descriptions.Item label="品种/牌号">
                {displayProduct.sub_category || displayProduct.category || '-'} / {displayProduct.material || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="规格">
                {formatStructuredSpec(displayProduct)}
              </Descriptions.Item>
              <Descriptions.Item label="库存/单价">
                {displayProduct.stock} 吨 / ¥{displayProduct.price}/吨
              </Descriptions.Item>
            </Descriptions>
            <Form<ProductDisplayFormValues> form={displayForm} layout="vertical">
              <Form.Item
                name="imageFiles"
                label="商品主图"
                valuePropName="fileList"
                getValueFromEvent={(event) => event?.fileList ?? []}
                rules={[
                  {
                    validator: async (_, fileList: UploadFile[]) => {
                      if (fileList && fileList.length > 0) {
                        return
                      }
                      throw new Error('请至少保留 1 张商品主图')
                    },
                  },
                ]}
                extra="可新增或替换买家端展示图片，提交后会重新进入平台审核。"
              >
                <Upload beforeUpload={() => false} listType="picture" maxCount={5}>
                  <Button icon={<CloudUploadOutlined />}>上传主图</Button>
                </Upload>
              </Form.Item>
              <Form.Item
                name="qualificationFiles"
                label="审核资料"
                valuePropName="fileList"
                getValueFromEvent={(event) => event?.fileList ?? []}
                extra="可补充质保书、材质证明、出厂单等资料。"
              >
                <Upload beforeUpload={() => false} maxCount={8}>
                  <Button icon={<CloudUploadOutlined />}>上传审核资料</Button>
                </Upload>
              </Form.Item>
              <Form.Item name="description" label="商品说明" rules={[{ required: true, message: '请输入商品说明' }]}>
                <TextArea rows={4} placeholder="填写材质、交货方式、可售批次等补充说明。" />
              </Form.Item>
              <Space className="w-full" size="large">
                <Form.Item name="deliveryDays" label="交货周期（天）" rules={[{ required: true, message: '请输入交货周期' }]}>
                  <InputNumber min={1} className="w-60" placeholder="请输入交货周期" />
                </Form.Item>
                <Form.Item name="quoteValidity" label="报价有效期（小时）" rules={[{ required: true, message: '请输入报价有效期' }]}>
                  <InputNumber min={1} className="w-60" placeholder="请输入报价有效期" />
                </Form.Item>
              </Space>
            </Form>
          </Space>
        ) : null}
      </Modal>

      <Drawer title="商品详情" width={760} open={Boolean(drawerProduct)} onClose={() => setDrawerProduct(null)} destroyOnClose>
        {drawerProduct ? (
          <Space direction="vertical" size="large" className="w-full">
            <div>
              <div className="mb-2 font-medium text-gray-900">商品图片</div>
              {drawerProduct.image_urls.length > 0 ? (
                <Image.PreviewGroup>
                  <Space wrap>
                    {drawerProduct.image_urls.map((url) => (
                      <Image
                        key={url}
                        src={url}
                        alt={drawerProduct.name}
                        width={112}
                        height={112}
                        className="rounded-md object-cover"
                      />
                    ))}
                  </Space>
                </Image.PreviewGroup>
              ) : (
                <Text type="secondary">暂无商品图片</Text>
              )}
            </div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="商品名称">{drawerProduct.name}</Descriptions.Item>
              <Descriptions.Item label="SKU">{drawerProduct.sku_id}</Descriptions.Item>
              <Descriptions.Item label="货品类型">
                <Tag color={goodsTypeMeta[drawerProduct.goods_type].color}>{goodsTypeMeta[drawerProduct.goods_type].text}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="品种大类">{drawerProduct.category || '-'}</Descriptions.Item>
              <Descriptions.Item label="细分品种">{drawerProduct.sub_category || '-'}</Descriptions.Item>
              <Descriptions.Item label="产地/钢厂">{drawerProduct.steel_mill || '-'}</Descriptions.Item>
              <Descriptions.Item label="牌号">{drawerProduct.material || '-'}</Descriptions.Item>
              <Descriptions.Item label="规格">{formatStructuredSpec(drawerProduct)}</Descriptions.Item>
              <Descriptions.Item label="原始规格">{drawerProduct.specs || '-'}</Descriptions.Item>
              <Descriptions.Item label="捆包号">{drawerProduct.bundle_no || '-'}</Descriptions.Item>
              <Descriptions.Item label="最小起订量">{drawerProduct.min_order_qty ? `${drawerProduct.min_order_qty} 吨` : '-'}</Descriptions.Item>
              <Descriptions.Item label="绑定仓储资源">
                {drawerProduct.warehouse_service_id ? `#${drawerProduct.warehouse_service_id}` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="仓储方企业">
                {drawerProduct.warehouse_enterprise_id ? `#${drawerProduct.warehouse_enterprise_id}` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="仓库名称">{drawerProduct.warehouse_name || '-'}</Descriptions.Item>
              <Descriptions.Item label="仓库编码">{drawerProduct.warehouse_code || '-'}</Descriptions.Item>
              <Descriptions.Item label="仓库地区">
                {[drawerProduct.province, drawerProduct.city, drawerProduct.district].filter(Boolean).join(' / ') || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="仓库地址">{drawerProduct.address || '-'}</Descriptions.Item>
              <Descriptions.Item label="库存/可售库存">
                {drawerProduct.stock} 吨 / {drawerProduct.visible_stock} 吨
              </Descriptions.Item>
              <Descriptions.Item label="单价">¥{drawerProduct.price}/吨</Descriptions.Item>
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
              <Descriptions.Item label="商品说明">{drawerProduct.description || '-'}</Descriptions.Item>
            </Descriptions>

            <div>
              <div className="mb-2 font-medium text-gray-900">资料清单</div>
              <Space direction="vertical" size="small">
                <Text>商品主图：{drawerProduct.image_urls.length > 0 ? drawerProduct.image_urls.join('、') : '暂无'}</Text>
                <Text>审核资料：{drawerProduct.qualification_urls.length > 0 ? drawerProduct.qualification_urls.join('、') : '暂无'}</Text>
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
