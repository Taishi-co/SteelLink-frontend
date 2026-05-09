import { useMemo, useState } from 'react'
import type React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Alert, Button, Card, Col, Descriptions, Empty, Row, Space, Tag, Upload, message } from 'antd'
import {
  BankOutlined,
  CheckCircleOutlined,
  FileSearchOutlined,
  UploadOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  TruckOutlined,
  HomeOutlined,
} from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { certificationService, EnterpriseServiceApplicationPayload, EnterpriseServicePermission } from '@/services/certificationService'
import { uploadService } from '@/services/uploadService'

type ServiceKey = 'sales' | 'procurement' | 'logistics' | 'warehouse' | 'finance'

const logisticsWorkbenchHref = import.meta.env.DEV ? 'http://127.0.0.1:5175/logistics/' : '/logistics/'
const warehouseWorkbenchHref = import.meta.env.DEV ? 'http://127.0.0.1:5176/warehouse/' : '/warehouse/'
const serviceConfig: Record<ServiceKey, {
  title: string
  description: string
  enterpriseRole: string
  icon: React.ReactNode
  actions: Array<{ label: string; href: string }>
}> = {
  sales: {
    title: '销售交易能力',
    description: '发布商品、参与竞价报价、管理销售订单与履约。',
    enterpriseRole: '供应商',
    icon: <ShopOutlined />,
    actions: [
      { label: '进入卖家中心', href: '/seller/dashboard' },
      { label: '商品管理', href: '/seller/products' },
    ],
  },
  procurement: {
    title: '采购交易能力',
    description: '加入购物车、创建订单、发起竞价和使用 AI 采购。',
    enterpriseRole: '采购商',
    icon: <ShoppingCartOutlined />,
    actions: [
      { label: 'AI采购', href: '/ai-procurement' },
      { label: '集采大厅', href: '/procurement' },
    ],
  },
  logistics: {
    title: '物流服务商能力',
    description: '承接运输需求、维护承运资质与物流履约节点。',
    enterpriseRole: '物流方',
    icon: <TruckOutlined />,
    actions: [
      { label: '进入物流管理中心', href: logisticsWorkbenchHref },
      { label: '物流资源管理', href: '/dashboard/logistics-resources' },
    ],
  },
  warehouse: {
    title: '仓储服务商能力',
    description: '维护仓储资源、场地资质和入出库协同能力。',
    enterpriseRole: '仓储方',
    icon: <HomeOutlined />,
    actions: [
      { label: '进入仓储管理中心', href: warehouseWorkbenchHref },
      { label: '仓储资源管理', href: '/dashboard/warehouse-resources' },
    ],
  },
  finance: {
    title: '金融服务商能力',
    description: '资金方发布金融产品，并处理融资风控、债务合同、分佣放款和货权质押。',
    enterpriseRole: '资金方',
    icon: <BankOutlined />,
    actions: [{ label: '进入资金方工作台', href: import.meta.env.DEV ? 'http://127.0.0.1:5177/finance/' : '/finance/' }],
  },
}

const statusMeta: Record<number, { text: string; color: string; message: string }> = {
  1: { text: '审核中', color: 'processing', message: '申请已提交，请等待平台审核。' },
  2: { text: '已开通', color: 'success', message: '能力已开通，可以进入对应工作台。' },
  3: { text: '已驳回', color: 'error', message: '申请被驳回，请按原因补充材料后重新提交。' },
  4: { text: '已暂停', color: 'warning', message: '企业能力已被平台暂停，请联系运营处理。' },
}

function isServiceKey(value: string | undefined): value is ServiceKey {
  return !!value && value in serviceConfig
}

export default function ServiceWorkspace() {
  const params = useParams()
  const service = isServiceKey(params.service) ? params.service : 'procurement'
  const config = serviceConfig[service]
  const queryClient = useQueryClient()
  const [documentUrls, setDocumentUrls] = useState<Record<string, string>>({})
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['enterprise-services'],
    queryFn: () => certificationService.getMyServices(),
  })

  const overview = data?.data
  const permission = overview?.permissions?.find((item) => item.service === service) as EnterpriseServicePermission | undefined
  const status = permission?.status ?? 0
  const requiredDocuments = useMemo(
    () => overview?.required_documents?.[service] ?? [],
    [overview?.required_documents, service],
  )

  const { mutate: applyService, isPending } = useMutation({
    mutationFn: (payload: EnterpriseServiceApplicationPayload) => certificationService.applyService(payload),
    onSuccess: () => {
      message.success('能力申请已提交')
      setDocumentUrls({})
      void queryClient.invalidateQueries({ queryKey: ['enterprise-services'] })
    },
  })

  const uploadedCount = useMemo(
    () => requiredDocuments.filter((doc) => documentUrls[doc]).length,
    [documentUrls, requiredDocuments],
  )

  const handleUpload = async (file: File, documentType: string) => {
    setUploadingDoc(documentType)
    try {
      const result = await uploadService.upload(file, 'enterprise_service_document')
      setDocumentUrls((prev) => ({ ...prev, [documentType]: result.url }))
      message.success('材料上传成功')
    } catch {
      message.error('材料上传失败')
    } finally {
      setUploadingDoc(null)
    }
    return false
  }

  const handleApply = () => {
    const missing = requiredDocuments.filter((doc) => !documentUrls[doc])
    if (missing.length > 0) {
      message.warning(`请上传：${missing.join('、')}`)
      return
    }
    applyService({
      service,
      documents: requiredDocuments.map((doc) => ({
        document_type: doc,
        file_url: documentUrls[doc],
      })),
    })
  }

  return (
    <div className="space-y-4">
      <Card loading={isLoading}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
              {config.icon}
            </div>
            <div>
              <Space>
                <h2 className="text-xl font-semibold m-0">{config.title}</h2>
                {status ? <Tag color={statusMeta[status]?.color}>{statusMeta[status]?.text}</Tag> : <Tag>未申请</Tag>}
              </Space>
              <p className="text-gray-500 mt-2 mb-0">{config.description}</p>
            </div>
          </div>
          <Link to="/dashboard/services">
            <Button>返回服务总览</Button>
          </Link>
        </div>
      </Card>

      {status ? (
        <Alert
          type={status === 2 ? 'success' : status === 3 ? 'error' : 'warning'}
          showIcon
          message={statusMeta[status]?.message}
          description={permission?.audit_reason || undefined}
        />
      ) : null}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="服务资料">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="供应链角色">{config.enterpriseRole}</Descriptions.Item>
              <Descriptions.Item label="能力类型">{config.title}</Descriptions.Item>
              <Descriptions.Item label="所需材料">
                {requiredDocuments.length ? (
                  <Space direction="vertical">
                    {requiredDocuments.map((doc) => <Tag key={doc}>{doc}</Tag>)}
                  </Space>
                ) : '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="服务操作">
            {status === 2 ? (
              <Space direction="vertical" className="w-full">
                {config.actions.map((action) => (
                  <a key={action.href} href={action.href}>
                    <Button type="primary" block icon={<CheckCircleOutlined />}>{action.label}</Button>
                  </a>
                ))}
              </Space>
            ) : (
              <Space direction="vertical" className="w-full" size="middle">
                <Alert
                  type="info"
                  showIcon
                  message={`需上传 ${requiredDocuments.length} 项材料，已上传 ${uploadedCount} 项`}
                />
                {requiredDocuments.map((doc) => {
                  const uploaded = !!documentUrls[doc]
                  return (
                    <div key={doc} className="rounded-lg border border-gray-200 px-3 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900">{doc}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {uploaded ? '已上传，可点击重新上传' : '请上传对应附件'}
                          </div>
                        </div>
                        <Upload
                          beforeUpload={(file) => handleUpload(file, doc)}
                          maxCount={1}
                          showUploadList={false}
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                        >
                          <Button
                            icon={<UploadOutlined />}
                            loading={uploadingDoc === doc}
                            type={uploaded ? 'default' : 'primary'}
                          >
                            {uploaded ? '重新上传' : '上传'}
                          </Button>
                        </Upload>
                      </div>
                      {uploaded && (
                        <a className="text-xs mt-2 inline-block" href={documentUrls[doc]} target="_blank" rel="noreferrer">
                          查看附件
                        </a>
                      )}
                    </div>
                  )
                })}
                <Button
                  type="primary"
                  block
                  icon={<FileSearchOutlined />}
                  loading={isPending}
                  disabled={!requiredDocuments.length || uploadedCount < requiredDocuments.length}
                  onClick={handleApply}
                >
                  提交能力申请
                </Button>
              </Space>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export function ServiceOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ['enterprise-services'],
    queryFn: () => certificationService.getMyServices(),
  })
  const permissions = data?.data.permissions ?? []

  return (
    <Card title="企业能力入口" loading={isLoading}>
      <Row gutter={[16, 16]}>
        {(Object.keys(serviceConfig) as ServiceKey[]).map((key) => {
          const permission = permissions.find((item) => item.service === key)
          const status = permission?.status ?? 0
          return (
            <Col xs={24} md={12} xl={8} key={key}>
              <Card size="small" className="h-full">
                <Space align="start">
                  <div className="text-blue-600 text-xl">{serviceConfig[key].icon}</div>
                  <div>
                    <Space>
                      <strong>{serviceConfig[key].title}</strong>
                      {status ? <Tag color={statusMeta[status]?.color}>{statusMeta[status]?.text}</Tag> : <Tag>未申请</Tag>}
                    </Space>
                    <p className="text-gray-500 text-sm mt-2 min-h-[44px]">{serviceConfig[key].description}</p>
                    <Link to={`/dashboard/services/${key}`}>
                      <Button size="small" type={status === 2 ? 'primary' : 'default'}>
                        {status === 2 ? '进入能力' : '申请/查看'}
                      </Button>
                    </Link>
                  </div>
                </Space>
              </Card>
            </Col>
          )
        })}
      </Row>
      {!permissions.length && !isLoading && <Empty className="mt-6" description="暂无已开通能力，可选择能力提交申请" />}
    </Card>
  )
}
