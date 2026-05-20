import { Card, Layout, Spin, Typography } from 'antd'
import { SafetyCertificateOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography

export function LoadingState() {
  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spin size="large" />
    </Layout>
  )
}

export function CapabilityDeniedState() {
  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card style={{ maxWidth: 480, textAlign: 'center' }}>
        <SafetyCertificateOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
        <Title level={4}>需要资金服务商权限</Title>
        <Paragraph type="secondary">当前账户未开通资金服务商能力，请联系平台管理员申请开通。</Paragraph>
      </Card>
    </Layout>
  )
}
