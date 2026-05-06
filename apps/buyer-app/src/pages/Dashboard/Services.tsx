import { Button, Card, Col, Row, Space, Switch, Tag, Typography, message } from 'antd'
import { ArrowRightOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  readEnabledServices,
  serviceDefinitions,
  writeEnabledServices,
  type ServiceKey,
} from './serviceAccess'
import ServiceIconBadge from './ServiceIconBadge'

const { Paragraph, Text, Title } = Typography

export default function ServicesPage() {
  const navigate = useNavigate()
  const [enabled, setEnabled] = useState<ServiceKey[]>(() => readEnabledServices())
  const enabledSet = useMemo(() => new Set(enabled), [enabled])

  const toggleService = (key: ServiceKey, checked: boolean) => {
    const next = checked ? Array.from(new Set([...enabled, key])) : enabled.filter((item) => item !== key)
    setEnabled(next)
    writeEnabledServices(next)
    const service = serviceDefinitions.find((item) => item.key === key)
    message.success(`${service?.title || '服务'}已${checked ? '开通' : '关闭'}`)
  }

  return (
    <div className="min-w-0">
      <Card className="mb-6 rounded-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Title level={4} className="!mb-1">服务入口</Title>
            <Paragraph className="!mb-0 !text-gray-500">
              按企业实际业务开通物流、仓储和资金服务。开通后，对应工作台菜单与业务面板会立即可见。
            </Paragraph>
          </div>
          <Space>
            <Tag color="blue">前端开通态</Tag>
            <Tag color="green">{enabled.length} 项已开通</Tag>
          </Space>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        {serviceDefinitions.map((service) => {
          const checked = enabledSet.has(service.key)
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
                    <Switch checked={checked} onChange={(value) => toggleService(service.key, value)} />
                  </div>

                  <Space wrap>
                    {service.capabilities.map((item) => <Tag key={item}>{item}</Tag>)}
                  </Space>

                  <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                    <Space>
                      <CheckCircleOutlined className={checked ? 'text-green-600' : 'text-gray-300'} />
                      <Text type={checked ? undefined : 'secondary'}>{checked ? '已开通' : '未开通'}</Text>
                    </Space>
                    <Button
                      type={checked ? 'primary' : 'default'}
                      icon={<ArrowRightOutlined />}
                      onClick={() => checked ? navigate(service.route) : toggleService(service.key, true)}
                    >
                      {checked ? '进入面板' : '开通服务'}
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
          当前开通状态保存在浏览器本地，用于前端流程验证。后端接入后应改为企业服务订阅接口，并由权限、服务状态、合同或保证金状态共同决定面板是否可见。
        </Paragraph>
      </Card>
    </div>
  )
}
