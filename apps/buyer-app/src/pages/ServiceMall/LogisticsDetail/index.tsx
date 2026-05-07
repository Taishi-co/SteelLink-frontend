import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CarOutlined, EnvironmentOutlined, SafetyCertificateOutlined, TruckOutlined } from '@ant-design/icons'
import { Card, Col, Descriptions, Empty, Row, Space, Spin, Statistic, Tag, Typography } from 'antd'
import { serviceOfferService } from '@/services/serviceOfferService'

const { Title, Paragraph, Text } = Typography

export default function LogisticsDetailPage() {
  const { id } = useParams<{ id: string }>()
  const logisticsID = Number(id)

  const { data, isLoading } = useQuery({
    queryKey: ['logistics-service-detail', logisticsID],
    queryFn: async () => (await serviceOfferService.getLogistics(logisticsID)).data,
    enabled: Number.isFinite(logisticsID) && logisticsID > 0,
  })

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 text-gray-500">
          <Link to="/">首页</Link>
          <span className="mx-2">/</span>
          <Link to="/service-market">物流仓储</Link>
          <span className="mx-2">/</span>
          <Link to="/logistics-services">物流资源</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{data?.name || `物流资源 ${id}`}</span>
        </div>

        <Spin spinning={isLoading}>
          {data ? (
            <Space direction="vertical" size="large" className="w-full">
              <Card>
                <Row gutter={[24, 24]} align="middle">
                  <Col xs={24} lg={16}>
                    <Space wrap className="mb-3">
                      <Tag color="green">资源 #{data.id}</Tag>
                      <Tag color="green">平台已审核</Tag>
                      {data.vehicle_type ? <Tag>{data.vehicle_type}</Tag> : null}
                      {data.service_scope ? <Tag>{data.service_scope}</Tag> : null}
                    </Space>
                    <Title level={2} className="!mb-3">{data.name}</Title>
                    <Paragraph className="!mb-0 !text-base !text-gray-500">
                      {data.description || '该物流资源已通过平台审核，可用于后续订单协同选车、运输任务下发和履约节点回传。'}
                    </Paragraph>
                  </Col>
                  <Col xs={24} lg={8}>
                    <Card className="bg-emerald-50">
                      <Space align="start">
                        <TruckOutlined className="mt-1 text-2xl text-emerald-600" />
                        <div>
                          <Text strong>物流方企业</Text>
                          <div className="mt-1 text-gray-600">企业 #{data.enterprise_id}</div>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </Card>

              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <Card>
                    <Statistic title="承运载重" value={data.load_capacity || 0} prefix={<TruckOutlined />} />
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card>
                    <Statistic title="车型" value={data.vehicle_type || '待确认'} prefix={<CarOutlined />} />
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card>
                    <Statistic title="审核状态" value="已通过" prefix={<SafetyCertificateOutlined />} />
                  </Card>
                </Col>
              </Row>

              <Card title="物流资源信息">
                <Descriptions bordered column={{ xs: 1, md: 2 }}>
                  <Descriptions.Item label="服务名称">{data.name}</Descriptions.Item>
                  <Descriptions.Item label="资源 ID">#{data.id}</Descriptions.Item>
                  <Descriptions.Item label="物流方企业">#{data.enterprise_id}</Descriptions.Item>
                  <Descriptions.Item label="车型">{data.vehicle_type || '-'}</Descriptions.Item>
                  <Descriptions.Item label="起始地">
                    <Space>
                      <EnvironmentOutlined />
                      <span>{data.route_start || '-'}</span>
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="目的地">
                    <Space>
                      <EnvironmentOutlined />
                      <span>{data.route_end || '-'}</span>
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="服务范围" span={2}>{data.service_scope || '-'}</Descriptions.Item>
                  <Descriptions.Item label="价格规则" span={2}>{data.price_rule || '-'}</Descriptions.Item>
                  <Descriptions.Item label="审核状态">
                    <Tag color="green">已审核通过</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="更新时间">{data.updated_at || '-'}</Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title="资质与图片">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Text strong>展示图片</Text>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {data.images?.length ? data.images.map((image) => (
                        <div key={image} className="h-32 overflow-hidden rounded border bg-white">
                          <img src={image} alt={data.name} className="h-full w-full object-cover" />
                        </div>
                      )) : <Text type="secondary">暂无展示图片</Text>}
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <Text strong>资质附件</Text>
                    <Space direction="vertical" className="mt-3 w-full">
                      {data.certificates?.length ? data.certificates.map((file) => (
                        <a key={file} href={file} target="_blank" rel="noreferrer">{file}</a>
                      )) : <Text type="secondary">暂无资质附件</Text>}
                    </Space>
                  </Col>
                </Row>
              </Card>
            </Space>
          ) : (
            !isLoading && <Empty description="物流资源不存在或未审核通过" />
          )}
        </Spin>
      </div>
    </div>
  )
}
