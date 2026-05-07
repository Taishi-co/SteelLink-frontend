import { useNavigate } from 'react-router-dom'
import { Button, Card, Descriptions, Result, Space, Tag, Typography } from 'antd'
import { ArrowLeftOutlined, BankOutlined, DashboardOutlined } from '@ant-design/icons'
import { clearSellerSession, getSellerUser, hasEnterprise as hasEnterpriseAccess } from '@/services/auth'

const { Paragraph, Text, Title } = Typography

const personalWorkspaceHref = import.meta.env.DEV ? 'http://localhost:5173/dashboard' : '/dashboard'
const enterpriseWorkspaceHref = import.meta.env.DEV ? 'http://localhost:5173/dashboard/enterprise' : '/dashboard/enterprise'
const servicesWorkspaceHref = import.meta.env.DEV ? 'http://localhost:5173/dashboard/services' : '/dashboard/services'

export default function EnterprisePage() {
  const navigate = useNavigate()
  const user = getSellerUser()
  const enterpriseReady = hasEnterpriseAccess(user)

  const goPersonalWorkspace = (href = personalWorkspaceHref) => {
    window.location.href = href
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className="mb-4">
          返回
        </Button>

        <Card className="rounded-2xl shadow-sm border-0">
          {enterpriseReady ? (
            <>
              <Result
                status="success"
                icon={<BankOutlined className="text-green-500" />}
                title="企业权限已生效"
                subTitle="当前卖家端只承载销售经营功能，认证和企业服务权限统一在个人工作台维护。"
                className="!pb-2"
              />
              <Descriptions bordered column={1} size="small" className="mb-6">
                <Descriptions.Item label="企业编码">{user?.enterprise_code || '-'}</Descriptions.Item>
                <Descriptions.Item label="账号角色">
                  <Tag color="success">{user?.role || '-'}</Tag>
                </Descriptions.Item>
              </Descriptions>
              <Space className="w-full justify-center" wrap>
                <Button type="primary" size="large" onClick={() => navigate('/products')}>
                  管理商品
                </Button>
                <Button size="large" icon={<DashboardOutlined />} onClick={() => goPersonalWorkspace(servicesWorkspaceHref)}>
                  查看服务权限
                </Button>
              </Space>
            </>
          ) : (
            <div className="text-center py-8">
              <BankOutlined className="text-5xl text-blue-500 mb-4" />
              <Title level={3} className="!mb-2">请前往个人工作台完成企业认证</Title>
              <Paragraph type="secondary" className="text-base !mb-2">
                实名认证、企业认证、企业额外权限申请都统一在个人工作台提交和查看。
              </Paragraph>
              <Paragraph type="secondary" className="!mb-6">
                企业审核通过并开通销售服务后，即可回到卖家端发布商品和处理订单。
              </Paragraph>
              {user?.enterprise_code ? (
                <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-gray-50 rounded-lg">
                  <Text type="secondary">当前企业编码</Text>
                  <Tag>{user.enterprise_code}</Tag>
                </div>
              ) : null}
              <Space className="w-full justify-center" wrap>
                <Button type="primary" size="large" icon={<DashboardOutlined />} onClick={() => goPersonalWorkspace(enterpriseWorkspaceHref)}>
                  前往企业认证
                </Button>
                <Button size="large" onClick={() => goPersonalWorkspace()}>
                  个人工作台
                </Button>
                <Button size="large" onClick={() => {
                  clearSellerSession()
                  navigate('/login', { replace: true })
                }}>
                  切换账号
                </Button>
              </Space>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
