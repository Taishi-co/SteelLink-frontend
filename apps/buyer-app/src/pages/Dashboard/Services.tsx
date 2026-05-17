import { Button, Card, Col, Row, Space, Tag, Typography, Spin } from 'antd'
import { ArrowRightOutlined, CheckCircleOutlined, ClockCircleOutlined, CiCircleOutlined, PauseCircleOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEffectiveServiceStatus, serviceDefinitions, type ServiceKey } from './serviceAccess'
import ServiceIconBadge from './ServiceIconBadge'
import { certificationService } from '@/services/certificationService'
import type { EnterpriseServicePermission } from '@/services/certificationService'
import { useUserStore } from '@/stores'

const { Paragraph, Text, Title } = Typography

const STATUS_LABELS: Record<number, { label: string; color: string; icon: React.ReactNode }> = {
  0: { label: '未申请', color: 'default', icon: <CiCircleOutlined /> },
  1: { label: '审核中', color: 'processing', icon: <ClockCircleOutlined /> },
  2: { label: '已开通', color: 'success', icon: <CheckCircleOutlined /> },
  3: { label: '已驳回', color: 'error', icon: <CiCircleOutlined /> },
  4: { label: '已暂停', color: 'warning', icon: <PauseCircleOutlined /> },
}

export default function ServicesPage() {
  const navigate = useNavigate()
  const user = useUserStore((state) => state.user)
  const [permissions, setPermissions] = useState<EnterpriseServicePermission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    certificationService.getMyServices().then((res) => {
      if (res.code === 0 && res.data?.permissions) {
        setPermissions(res.data.permissions)
      }
    }).catch(() => {
      setPermissions([])
    }).finally(() => {
      setLoading(false)
    })
  }, [])

  const getPermissionStatus = (serviceKey: ServiceKey) => {
    return getEffectiveServiceStatus(serviceKey, permissions, user?.enterpriseRole)
  }

  const openedCount = serviceDefinitions.filter((service) => getPermissionStatus(service.key) === 2).length

  return (
    <Spin spinning={loading}>
      <div className="min-w-0">
        <Card className="mb-6 rounded-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Title level={4} className="!mb-1">服务入口</Title>
              <Paragraph className="!mb-0 !text-gray-500">
                企业能力统一从这里查看和申请。销售、采购是交易能力；物流、仓储、资金是服务商能力。
              </Paragraph>
            </div>
            <Space>
              <Tag color="blue">权限表 + 企业角色兜底</Tag>
              <Tag color="green">{openedCount} 项已开通</Tag>
            </Space>
          </div>
        </Card>

        <Row gutter={[16, 16]}>
          {serviceDefinitions.map((service) => {
            const status = getPermissionStatus(service.key)
            const statusInfo = STATUS_LABELS[status] || STATUS_LABELS[0]
            const isEnabled = status === 2
            const targetRoute = isEnabled ? service.route : `/dashboard/services/${service.key}`
            return (
              <Col xs={24} md={12} xl={8} key={service.key}>
                <Card className="h-full rounded-lg">
                  <div className="flex h-full flex-col gap-5">
                    <div className="flex items-start justify-between gap-3">
                      <Space align="start">
                        <ServiceIconBadge serviceKey={service.key} />
                        <div>
                          <Title level={4} className="!mb-1">{service.title}</Title>
                          <Tag className="!mb-2" color="default">{service.role}</Tag>
                          <Text type="secondary">{service.description}</Text>
                        </div>
                      </Space>
                      <Tag color={statusInfo.color} className="text-xs">
                        {statusInfo.label}
                      </Tag>
                    </div>

                    <Space wrap>
                      {service.capabilities.map((item) => <Tag key={item}>{item}</Tag>)}
                    </Space>

                    <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                      <Space>
                        <span className={`${status === 2 ? 'text-green-600' : status === 1 ? 'text-blue-500' : status === 3 ? 'text-red-500' : status === 4 ? 'text-yellow-500' : 'text-gray-300'}`}>
                          {statusInfo.icon}
                        </span>
                        <Text type={isEnabled ? undefined : 'secondary'}>{statusInfo.label}</Text>
                      </Space>
                      <Button
                        type={isEnabled ? 'primary' : 'default'}
                        icon={<ArrowRightOutlined />}
                        onClick={() => navigate(targetRoute)}
                      >
                        {isEnabled ? '进入面板' : '申请/查看'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </Col>
            )
          })}
        </Row>

        <Card className="mt-6 rounded-lg" title="服务状态说明">
          <Paragraph className="!mb-0 !text-gray-500">
            企业认证通过后，会根据企业角色自动兜底开通对应能力；后续多能力组合以服务权限表为准。未申请时显示"未申请"，提交申请后显示"审核中"，审核通过后显示"已开通"，审核不通过显示"已驳回"，管理员可暂停服务显示"已暂停"。
          </Paragraph>
        </Card>
      </div>
    </Spin>
  )
}
