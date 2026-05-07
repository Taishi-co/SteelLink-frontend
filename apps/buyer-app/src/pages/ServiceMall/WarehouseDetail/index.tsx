import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BankOutlined, EnvironmentOutlined, HomeOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { Card, Col, Descriptions, Empty, Row, Space, Spin, Statistic, Tag, Typography } from 'antd'
import { serviceOfferService } from '@/services/serviceOfferService'

const { Title, Paragraph, Text } = Typography

export default function WarehouseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const warehouseID = Number(id)

  const { data, isLoading } = useQuery({
    queryKey: ['warehouse-service-detail', warehouseID],
    queryFn: async () => (await serviceOfferService.getWarehouse(warehouseID)).data,
    enabled: Number.isFinite(warehouseID) && warehouseID > 0,
  })

  const region = [data?.province, data?.city, data?.district].filter(Boolean).join(' / ') || '-'

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 text-gray-500">
          <Link to="/">首页</Link>
          <span className="mx-2">/</span>
          <Link to="/service-market">物流仓储</Link>
          <span className="mx-2">/</span>
          <Link to="/warehouses">仓储资源</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{data?.warehouse_name || `仓储资源 ${id}`}</span>
        </div>

        <Spin spinning={isLoading}>
          {data ? (
            <Space direction="vertical" size="large" className="w-full">
              <Card>
                <Row gutter={[24, 24]} align="middle">
                  <Col xs={24} lg={16}>
                    <Space wrap className="mb-3">
                      <Tag color="blue">资源 #{data.id}</Tag>
                      <Tag color="green">平台已审核</Tag>
                      {data.service_types?.map((service) => <Tag key={service}>{service}</Tag>)}
                    </Space>
                    <Title level={2} className="!mb-3">{data.warehouse_name}</Title>
                    <Paragraph className="!mb-0 !text-base !text-gray-500">
                      {data.description || data.address || '该仓储资源已通过平台审核，可用于后续商品绑定、订单仓库确认和履约协同。'}
                    </Paragraph>
                  </Col>
                  <Col xs={24} lg={8}>
                    <Card className="bg-blue-50">
                      <Space align="start">
                        <HomeOutlined className="mt-1 text-2xl text-blue-600" />
                        <div>
                          <Text strong>仓储方企业</Text>
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
                    <Statistic title="总库容" value={data.capacity || 0} prefix={<BankOutlined />} />
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card>
                    <Statistic title="可用库容" value={data.available_capacity || 0} prefix={<SafetyCertificateOutlined />} />
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card>
                    <Statistic title="服务类型" value={data.service_types?.length || 0} suffix="类" prefix={<HomeOutlined />} />
                  </Card>
                </Col>
              </Row>

              <Card title="仓储资源信息">
                <Descriptions bordered column={{ xs: 1, md: 2 }}>
                  <Descriptions.Item label="仓库名称">{data.warehouse_name}</Descriptions.Item>
                  <Descriptions.Item label="资源 ID">#{data.id}</Descriptions.Item>
                  <Descriptions.Item label="仓储方企业">#{data.enterprise_id}</Descriptions.Item>
                  <Descriptions.Item label="仓库地区">{region}</Descriptions.Item>
                  <Descriptions.Item label="仓库地址" span={2}>
                    <Space>
                      <EnvironmentOutlined />
                      <span>{data.address || '-'}</span>
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="价格规则" span={2}>{data.price_rule || '-'}</Descriptions.Item>
                  <Descriptions.Item label="服务类型" span={2}>
                    <Space wrap>
                      {data.service_types?.length ? data.service_types.map((service) => <Tag key={service}>{service}</Tag>) : '-'}
                    </Space>
                  </Descriptions.Item>
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
                          <img src={image} alt={data.warehouse_name} className="h-full w-full object-cover" />
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
            !isLoading && <Empty description="仓储资源不存在或未审核通过" />
          )}
        </Spin>
      </div>
    </div>
  )
}
