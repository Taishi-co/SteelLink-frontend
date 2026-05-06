import { Button, Card, Empty, Space, Tag, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import { isServiceEnabled, getServiceDefinition, type ServiceKey } from './serviceAccess'
import ServiceIconBadge from './ServiceIconBadge'

const { Paragraph, Text, Title } = Typography

interface ServicePanelGateProps {
  serviceKey: ServiceKey
  children: React.ReactNode
}

export default function ServicePanelGate({ serviceKey, children }: ServicePanelGateProps) {
  const navigate = useNavigate()
  const service = getServiceDefinition(serviceKey)

  if (isServiceEnabled(serviceKey)) {
    return <>{children}</>
  }

  return (
    <Card className="rounded-lg">
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <Space direction="vertical" size="middle" className="max-w-xl">
            <Space>
              <ServiceIconBadge serviceKey={serviceKey} />
              <div className="text-left">
                <Title level={4} className="!mb-1">{service?.title || '服务面板'}未开通</Title>
                <Paragraph className="!mb-0 !text-gray-500">{service?.description}</Paragraph>
              </div>
            </Space>
            <Space wrap>
              {service?.capabilities.map((item) => <Tag key={item}>{item}</Tag>)}
            </Space>
            <Text type="secondary">请先到服务入口开通对应服务，开通后当前路由会显示业务面板。</Text>
          </Space>
        }
      >
        <Button type="primary" onClick={() => navigate('/dashboard/services')}>
          去服务入口开通
        </Button>
      </Empty>
    </Card>
  )
}
