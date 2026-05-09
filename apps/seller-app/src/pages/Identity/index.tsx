import { useNavigate } from 'react-router-dom'
import { Button, Card, Result, Space, Tag, Typography } from 'antd'
import { ArrowLeftOutlined, DashboardOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { getBuyerCenterHref, getSellerUser, isIdentityVerified } from '@/services/auth'

const { Paragraph, Text, Title } = Typography

export default function IdentityPage() {
  const navigate = useNavigate()
  const user = getSellerUser()
  const verified = isIdentityVerified(user)
  const personalWorkspaceHref = getBuyerCenterHref('/dashboard')
  const identityWorkspaceHref = getBuyerCenterHref('/dashboard/identity')
  const enterpriseWorkspaceHref = getBuyerCenterHref('/dashboard/enterprise')

  const goPersonalWorkspace = (href = personalWorkspaceHref) => {
    window.location.href = href
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className="mb-4">
          返回
        </Button>

        <Card className="rounded-2xl shadow-sm border-0">
          {verified ? (
            <>
              <Result
                status="success"
                icon={<SafetyCertificateOutlined className="text-green-500" />}
                title="实名认证已完成"
                subTitle="企业认证和额外服务权限申请请继续在个人工作台处理。"
                className="!pb-2"
              />
              <div className="text-center">
                <Space wrap>
                  <Button type="primary" size="large" onClick={() => goPersonalWorkspace(enterpriseWorkspaceHref)}>
                    企业认证
                  </Button>
                  <Button size="large" icon={<DashboardOutlined />} onClick={() => goPersonalWorkspace()}>
                    个人工作台
                  </Button>
                </Space>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <SafetyCertificateOutlined className="text-5xl text-blue-500 mb-4" />
              <Title level={3} className="!mb-2">请前往个人工作台完成实名认证</Title>
              <Paragraph type="secondary" className="text-base !mb-2">
                实名认证统一在个人工作台提交、查看审核状态和处理驳回重提。
              </Paragraph>
              <Paragraph type="secondary" className="!mb-6">
                完成实名和企业认证后，再回到卖家端使用销售经营功能。
              </Paragraph>
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-gray-50 rounded-lg">
                <Text type="secondary">当前实名状态</Text>
                <Tag>{user?.identity_status === 1 ? '审核中' : user?.identity_status === 3 ? '已驳回' : '未认证'}</Tag>
              </div>
              <div>
                <Button type="primary" size="large" icon={<DashboardOutlined />} onClick={() => goPersonalWorkspace(identityWorkspaceHref)}>
                  前往实名认证
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
