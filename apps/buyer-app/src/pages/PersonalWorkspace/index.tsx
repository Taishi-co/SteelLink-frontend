import { useEffect, useMemo, useState } from 'react'
import type React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, Button, Card, Col, Row, Space, Spin, Steps, Tag, Typography } from 'antd'
import {
  BankOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  IdcardOutlined,
  RightOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  TruckOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { certificationService, EnterpriseInfo, EnterpriseServicePermission, getIdentityStatusLabel } from '@/services/certificationService'
import { useUserStore } from '@/stores'

const { Text, Title, Paragraph } = Typography

type ServiceKey = 'sales' | 'procurement' | 'logistics' | 'warehouse' | 'finance'

const serviceCards: Array<{
  key: ServiceKey
  title: string
  role: string
  desc: string
  icon: React.ReactNode
}> = [
  { key: 'sales', title: '销售交易能力', role: '供应商', desc: '商品发布、竞价报价、销售订单。', icon: <ShopOutlined /> },
  { key: 'procurement', title: '采购交易能力', role: '采购商', desc: '采购下单、AI采购、竞价定标。', icon: <ShoppingCartOutlined /> },
  { key: 'logistics', title: '物流服务商能力', role: '物流方', desc: '运输承接、物流履约、节点协同。', icon: <TruckOutlined /> },
  { key: 'warehouse', title: '仓储服务商能力', role: '仓储方', desc: '仓储资源、入出库协同。', icon: <HomeOutlined /> },
  { key: 'finance', title: '金融服务商能力', role: '资金方', desc: '融资服务、资信材料、凭单融资。', icon: <BankOutlined /> },
]

const permissionStatus: Record<number, { label: string; color: string }> = {
  1: { label: '审核中', color: 'processing' },
  2: { label: '已开通', color: 'success' },
  3: { label: '已驳回', color: 'error' },
  4: { label: '已暂停', color: 'warning' },
}

function enterpriseStatusText(status?: number) {
  if (status === 1) return '已通过'
  if (status === 0) return '审核中'
  if (status === 2) return '已驳回'
  return '未绑定'
}

function enterpriseStatusColor(status?: number) {
  if (status === 1) return 'success'
  if (status === 0) return 'processing'
  if (status === 2) return 'error'
  return 'default'
}

export default function PersonalWorkspace() {
  const user = useUserStore((s) => s.user)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [enterprise, setEnterprise] = useState<EnterpriseInfo | null>(null)
  const [permissions, setPermissions] = useState<EnterpriseServicePermission[]>([])

  useEffect(() => {
    let ignore = false

    async function load() {
      setLoading(true)
      try {
        if (user?.enterpriseCode) {
          const enterpriseRes = await certificationService.getEnterpriseByCode(user.enterpriseCode)
          if (!ignore && enterpriseRes.code === 0) {
            setEnterprise(enterpriseRes.data)
          }
          if (enterpriseRes.data?.status === 1) {
            const serviceRes = await certificationService.getMyServices()
            if (!ignore && serviceRes.code === 0) {
              setPermissions(serviceRes.data.permissions || [])
            }
          }
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    void load()
    return () => {
      ignore = true
    }
  }, [user?.enterpriseCode])

  const identityDone = user?.identityStatus === 2
  const enterpriseApproved = enterprise?.status === 1
  const currentStep = useMemo(() => {
    if (enterpriseApproved) return 2
    if (identityDone) return 1
    return 0
  }, [enterpriseApproved, identityDone])

  const permissionMap = useMemo(() => {
    return permissions.reduce<Record<string, EnterpriseServicePermission>>((acc, item) => {
      acc[item.service] = item
      return acc
    }, {})
  }, [permissions])

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <Title level={4} className="!mb-1">个人工作台</Title>
            <Text type="secondary">先完成个人实名认证和企业认证，企业审核通过后可使用交易能力，服务商身份可提供对应平台服务。</Text>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
            <UserOutlined className="text-blue-500" />
            <span className="text-sm">{user?.realName || user?.username || user?.mobile || '个人账号'}</span>
          </div>
        </div>
      </Card>

      <Card>
        <Steps
          current={currentStep}
          items={[
            {
              title: '个人实名认证',
              description: getIdentityStatusLabel(user?.identityStatus ?? 0),
              icon: identityDone ? <CheckCircleOutlined /> : <IdcardOutlined />,
            },
            {
              title: '企业认证',
              description: enterpriseStatusText(enterprise?.status),
              icon: enterpriseApproved ? <CheckCircleOutlined /> : <BankOutlined />,
            },
            {
              title: '企业能力',
              description: enterpriseApproved ? '交易能力与服务商能力' : '企业通过后开放',
              icon: <ClockCircleOutlined />,
            },
          ]}
        />
      </Card>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="个人实名认证" extra={<Tag color={identityDone ? 'success' : 'warning'}>{getIdentityStatusLabel(user?.identityStatus ?? 0)}</Tag>}>
              <Paragraph type="secondary">
                实名认证用于确认自然人身份，是创建或加入企业前置条件。
              </Paragraph>
              <Button type={identityDone ? 'default' : 'primary'} icon={<IdcardOutlined />} onClick={() => navigate('/dashboard/identity')}>
                {identityDone ? '查看实名信息' : '去实名认证'}
              </Button>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="企业认证" extra={<Tag color={enterpriseStatusColor(enterprise?.status)}>{enterpriseStatusText(enterprise?.status)}</Tag>}>
              <Paragraph type="secondary">
                企业认证通过后，平台会展示销售/采购交易能力，以及仓储、物流、金融服务商能力入口。
              </Paragraph>
              <Space>
                <Button type={enterpriseApproved ? 'default' : 'primary'} icon={<BankOutlined />} onClick={() => navigate('/dashboard/enterprise')}>
                  {enterprise ? '查看企业信息' : '创建/加入企业'}
                </Button>
                {enterprise?.status === 0 && <Text type="secondary">请等待平台审核</Text>}
              </Space>
            </Card>
          </Col>
        </Row>

        {!enterpriseApproved ? (
          <Alert
            className="mt-4"
            type="info"
            showIcon
            message="企业审核通过后开放企业能力"
            description="当前阶段请优先完成个人实名认证和企业认证。企业通过后，本页会展示交易能力与服务商能力入口。"
          />
        ) : (
          <Card className="mt-4" title="企业能力">
            <Row gutter={[16, 16]}>
              {serviceCards.slice(0, 5).map((service) => {
                const permission = permissionMap[service.key]
                const status = permission?.status ?? 0
                return (
                  <Col xs={24} md={12} xl={8} key={service.key}>
                    <Card size="small" className="h-full">
                      <div className="flex gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                          {service.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Space wrap>
                            <strong>{service.title}</strong>
                            {status ? <Tag color={permissionStatus[status]?.color}>{permissionStatus[status]?.label}</Tag> : <Tag>未申请</Tag>}
                          </Space>
                          <div className="text-xs text-gray-400 mt-1">{service.role}</div>
                          <p className="text-sm text-gray-500 mt-2 min-h-[40px]">{service.desc}</p>
                          <Link to={`/dashboard/services/${service.key}`}>
                            <Button size="small" type={status === 2 ? 'primary' : 'default'}>
                              {status === 2 ? '进入能力' : '申请/查看'} <RightOutlined />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  </Col>
                )
              })}
            </Row>
          </Card>
        )}
      </Spin>
    </div>
  )
}
