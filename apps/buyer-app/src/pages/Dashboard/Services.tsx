import { Button, Card, Col, Row, Space, Tag, Typography, Spin } from 'antd'
import { ArrowRightOutlined, CheckCircleOutlined, ClockCircleOutlined, CiCircleOutlined, PauseCircleOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { serviceDefinitions, type ServiceKey } from './serviceAccess'
import ServiceIconBadge from './ServiceIconBadge'
import { certificationService } from '@/services/certificationService'
import type { EnterpriseServicePermission } from '@/services/certificationService'

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
    const permission = permissions.find((p) => p.service === serviceKey)
    return permission?.status ?? 0
  }

  return (
    <Spin spinning={loading}>
      <div className="min-w-0">
        <Card className="mb-6 rounded-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Title level={4} className="!mb-1">服务入口</Title>
              <Paragraph className="!mb-0 !text-gray-500">
                按企业实际业务开通物流、仓储和资金服务。服务需提交申请并通过审核后开通。
              </Paragraph>
            </div>
            <Space>
              <Tag color="blue">后端审核态</Tag>
              <Tag color="green">{permissions.filter(p => p.status === 2).length} 项已开通</Tag>
            </Space>
          </div>
        </Card>

        <Row gutter={[16, 16]}>
          {serviceDefinitions.map((service) => {
            const status = getPermissionStatus(service.key)
            const statusInfo = STATUS_LABELS[status] || STATUS_LABELS[0]
            const isEnabled = status === 2
            return (
              <Col xs={24} lg={8} key={service.key}>
                <Card className="h-full rounded-lg">
                  <div className="flex h-full flex-col gap-5">
                    <div className="flex items-start justify-between gap-3">
                      <Space align="start">
                        <ServiceIconBadge serviceKey={service.key} />
                        <div>
                          <Title level={4} className="!mb-1">{service.title}</Title>
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
                        onClick={() => isEnabled ? navigate(service.route) : navigate('/dashboard/enterprise')}
                        disabled={status === 1}
                      >
                        {isEnabled ? '进入面板' : status === 1 ? '审核中' : '申请开通'}
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
            服务状态由后端审核决定：未申请时显示"未申请"，提交申请后显示"审核中"，审核通过后显示"已开通"，审核不通过显示"已驳回"，管理员可暂停服务显示"已暂停"。
          </Paragraph>
        </Card>
      </div>
    </Spin>
  )
}
