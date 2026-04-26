import { Link } from 'react-router-dom'
import { Button, Card, Col, Input, Progress, Row, Segmented, Select, Space, Statistic, Tag, Typography } from 'antd'
import { FormOutlined } from '@ant-design/icons'
import { procurementActivities } from './data'

const { Title, Paragraph, Text } = Typography

const hallStats = [
  { label: '进行中集采', value: 12, suffix: '场' },
  { label: '累计参采企业', value: 386, suffix: '家' },
  { label: '归集采购金额', value: 28.6, suffix: '亿' },
  { label: '平均降本率', value: 6.8, suffix: '%' },
]

export default function ProcurementPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white py-10">
        <div className="mx-auto max-w-7xl px-8">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Title level={1} className="!mb-3">集采大厅</Title>
              <Paragraph className="text-lg text-gray-500 !mb-0">
                汇聚牵头方发起的联合采购活动，企业可报名拼单，供应商可参与报价，平台运营负责审核、评审与归档。
              </Paragraph>
            </div>
            <Space>
              <Button>查看我的报名</Button>
              <Button type="primary" icon={<FormOutlined />}>发起集采</Button>
            </Space>
          </div>

          <Row gutter={[16, 16]}>
            {hallStats.map((item) => (
              <Col key={item.label} xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic title={item.label} value={item.value} suffix={item.suffix} precision={item.label.includes('率') ? 1 : 0} />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-8 py-10">
        <Card className="mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Space wrap>
              <Segmented options={['全部', '筹备中', '企业报名', '竞价报价', '评审定标', '合同签约']} defaultValue="全部" />
              <Select
                defaultValue="全部品类"
                style={{ width: 140 }}
                options={[
                  { label: '全部品类', value: '全部品类' },
                  { label: '大宗商品', value: '大宗商品' },
                  { label: '工业品', value: '工业品' },
                  { label: '建筑钢材', value: '建筑钢材' },
                ]}
              />
            </Space>
            <Input.Search placeholder="搜索集采活动、编号、牵头方" allowClear style={{ maxWidth: 360 }} />
          </div>
        </Card>

        <Row gutter={[24, 24]}>
          {procurementActivities.map((activity) => (
            <Col key={activity.id} xs={24} lg={12}>
              <Card hoverable className="h-full">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <Space className="mb-3" size="small">
                      <Tag color={activity.statusColor}>{activity.status}</Tag>
                      <Text type="secondary">{activity.id}</Text>
                    </Space>
                    <Title level={4} className="!mb-2">{activity.title}</Title>
                    <Text type="secondary">牵头方：{activity.leader}</Text>
                  </div>
                  <Link to={`/procurement/${activity.id}`}>
                    <Button type="primary">进入详情</Button>
                  </Link>
                </div>

                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Text type="secondary">品类</Text>
                    <div className="mt-1 font-semibold">{activity.category}</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">目标数量</Text>
                    <div className="mt-1 font-semibold">{activity.target}</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">预算</Text>
                    <div className="mt-1 font-semibold">{activity.budget}</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">参采企业</Text>
                    <div className="mt-1 font-semibold">{activity.companies} 家</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">收到报价</Text>
                    <div className="mt-1 font-semibold">{activity.quotes} 份</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">区域</Text>
                    <div className="mt-1 font-semibold">{activity.region}</div>
                  </Col>
                </Row>

                <div className="mt-5">
                  <div className="mb-2 flex justify-between text-sm text-gray-500">
                    <span>当前阶段：{activity.stage}</span>
                    <span>发起日期：{activity.openDate}</span>
                  </div>
                  <Progress percent={activity.progress} size="small" />
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </main>
    </div>
  )
}
