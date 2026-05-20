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
    <Layout
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card style={{ maxWidth: 480, textAlign: 'center' }}>
        <SafetyCertificateOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
        <Title level={4}>需要物流服务商权限</Title>
        <Paragraph type="secondary">
          当前账户未开通物流服务商能力，请联系平台管理员申请开通。
        </Paragraph>
      </Card>
    </Layout>
  )
}

export function MissingSessionState() {
  return (
    <Layout
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card style={{ maxWidth: 480, textAlign: 'center' }}>
        <SafetyCertificateOutlined style={{ fontSize: 48, color: '#1677ff', marginBottom: 16 }} />
        <Title level={4}>未获取到登录会话</Title>
        <Paragraph type="secondary">
          当前页面没有拿到可用 token，所以不会继续请求物流数据。请从已登录的业务端进入，或先在同 host 下完成登录。
        </Paragraph>
      </Card>
    </Layout>
  )
}
