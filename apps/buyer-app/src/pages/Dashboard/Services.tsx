import { Button, Card, Col, Row, Space, Tag, Typography } from 'antd'
import { ArrowRightOutlined, CheckCircleOutlined, FileSearchOutlined } from '@ant-design/icons'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { certificationService } from '@/services/certificationService'
import { serviceDefinitions } from './serviceAccess'
import ServiceIconBadge from './ServiceIconBadge'

const { Paragraph, Text, Title } = Typography
const permissionStatus: Record<number, { label: string; color: string }> = {
  1: { label: '审核中', color: 'processing' },
  2: { label: '已开通', color: 'success' },
  3: { label: '已驳回', color: 'error' },
  4: { label: '已暂停', color: 'warning' },
}

export default function ServicesPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ['enterprise-services'],
    queryFn: () => certificationService.getMyServices(),
  })

  const permissionMap = useMemo(() => {
    return (data?.data.permissions || []).reduce<Record<string, number>>((acc, item) => {
      acc[item.service] = item.status
      return acc
    }, {})
  }, [data?.data.permissions])

  const openedCount = serviceDefinitions.filter((service) => permissionMap[service.key] === 2).length

  return (
    <div className="min-w-0">
      <Card className="mb-6 rounded-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Title level={4} className="!mb-1">服务入口</Title>
            <Paragraph className="!mb-0 !text-gray-500">
              按企业实际业务申请物流、仓储和资金服务商能力。提交资料并审核通过后，可进入对应工作台。
            </Paragraph>
          </div>
          <Space>
            <Tag color="blue">企业能力申请</Tag>
            <Tag color="green">{openedCount} 项已开通</Tag>
          </Space>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        {serviceDefinitions.map((service) => {
          const status = permissionMap[service.key] ?? 0
          const statusText = status ? permissionStatus[status]?.label : '未申请'
          const targetRoute = status === 2 ? service.route : `/dashboard/services/${service.key}`
          return (
            <Col xs={24} lg={8} key={service.key}>
              <Card className="h-full rounded-lg" loading={isLoading}>
                <div className="flex h-full flex-col gap-5">
                  <div className="flex items-start justify-between gap-3">
                    <Space align="start">
                      <ServiceIconBadge serviceKey={service.key} />
                      <div>
                        <Title level={4} className="!mb-1">{service.title}</Title>
                        <Text type="secondary">{service.description}</Text>
                      </div>
                    </Space>
                    <Tag color={status ? permissionStatus[status]?.color : 'default'}>{statusText}</Tag>
                  </div>

                  <Space wrap>
                    {service.capabilities.map((item) => <Tag key={item}>{item}</Tag>)}
                  </Space>

                  <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                    <Space>
                      <CheckCircleOutlined className={status === 2 ? 'text-green-600' : 'text-gray-300'} />
                      <Text type={status === 2 ? undefined : 'secondary'}>{statusText}</Text>
                    </Space>
                    <Button
                      type={status === 2 ? 'primary' : 'default'}
                      icon={status === 2 ? <ArrowRightOutlined /> : <FileSearchOutlined />}
                      onClick={() => navigate(targetRoute)}
                    >
                      {status === 2 ? '进入面板' : '申请/查看'}
                    </Button>
                  </div>
                </div>
              </Card>
            </Col>
          )
        })}
      </Row>

      <Card className="mt-6 rounded-lg" title="后续接后端时的状态来源">
        <Paragraph className="!mb-0 !text-gray-500">
          当前总览读取企业服务权限接口，申请资料在对应服务详情页提交。后续仍可按合同、保证金、计费状态细化工作台准入。
        </Paragraph>
      </Card>
    </div>
  )
}
