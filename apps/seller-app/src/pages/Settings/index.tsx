import { useCallback, useEffect, useState } from 'react'
import { Alert, Button, Card, Descriptions, Form, Input, Spin, Tag, Typography, message } from 'antd'
import { BankOutlined, ReloadOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { certificationService, type EnterpriseInfo } from '@/services/certificationService'
import { getSellerToken, getSellerUser, sellerAuthService, updateSellerUser } from '@/services/auth'

const { Title, Text, Paragraph } = Typography

const roleLabels: Record<string, string> = {
  seller: '供应商',
  buyer: '采购方/贸易商',
  logistics: '物流商',
  warehouse: '仓储商',
  fund: '资金方',
}

function enterpriseStatusMeta(status?: number) {
  if (status === 1) return { color: 'success', text: '已认证' }
  if (status === 0) return { color: 'processing', text: '审核中' }
  if (status === 2) return { color: 'error', text: '已驳回' }
  return { color: 'default', text: '未认证' }
}

function getEnterpriseCodeFromToken() {
  try {
    const token = getSellerToken()
    const payload = token ? JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) : null
    return typeof payload?.enterprise_code === 'string' ? payload.enterprise_code : ''
  } catch {
    return ''
  }
}

export default function SettingsPage() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(true)
  const [enterpriseInfo, setEnterpriseInfo] = useState<EnterpriseInfo | null>(null)
  const navigate = useNavigate()

  const loadEnterprise = useCallback(async (showSuccess = false) => {
    setLoading(true)
    try {
      const cachedEnterpriseCode = getSellerUser()?.enterprise_code || getEnterpriseCodeFromToken()
      const userRes = await sellerAuthService.me()
      const latestUser = userRes.code === 0 && userRes.data ? userRes.data : getSellerUser()
      if (latestUser) {
        updateSellerUser(latestUser)
      }

      const enterpriseCode = latestUser?.enterprise_code || cachedEnterpriseCode
      let enterprise: EnterpriseInfo | null = null

      if (enterpriseCode) {
        const enterpriseRes = await certificationService.getEnterpriseByCode(enterpriseCode)
        enterprise = enterpriseRes.data
      }

      if (!enterprise) {
        const enterpriseListRes = await certificationService.getMyEnterprise()
        const list = enterpriseListRes.data?.list || []
        enterprise = list.find((item) => item.status === 1) || list[0] || null
      }

      if (!enterprise) {
        setEnterpriseInfo(null)
        form.resetFields()
        return
      }

      setEnterpriseInfo(enterprise)
      form.setFieldsValue({
        shopName: enterprise?.enterprise_name || '',
        contact: enterprise?.verification_info?.contact_name || enterprise?.legal_person || '',
        phone: enterprise?.verification_info?.contact_phone || '',
        address: enterprise?.verification_info?.address || '',
      })
      if (showSuccess) {
        message.success('企业认证信息已刷新')
      }
    } catch {
      message.error('企业认证信息加载失败')
    } finally {
      setLoading(false)
    }
  }, [form])

  useEffect(() => {
    void loadEnterprise()
  }, [loadEnterprise])

  const status = enterpriseStatusMeta(enterpriseInfo?.status)
  const isApproved = enterpriseInfo?.status === 1

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="min-w-0">
      <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <Title level={4} className="!mb-1">店铺设置</Title>
          <Paragraph className="!mb-0 !text-gray-500">
            店铺经营主体以企业认证结果为准，认证通过后主体名称不可在这里随意修改。
          </Paragraph>
        </div>
        <Button icon={<ReloadOutlined />} onClick={() => void loadEnterprise(true)}>
          刷新认证信息
        </Button>
      </div>

      {!enterpriseInfo ? (
        <Card>
          <Alert
            type="warning"
            showIcon
            message="当前账号尚未绑定可用企业"
            description="请先完成企业入驻或重新登录刷新企业权限，再进入店铺设置。"
            action={
              <Button type="primary" onClick={() => navigate('/enterprise')}>
                前往企业信息
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card
            title={
              <span className="inline-flex items-center gap-2">
                <BankOutlined />
                认证经营主体
              </span>
            }
          >
            <Alert
              className="mb-4"
              type={isApproved ? 'success' : 'info'}
              showIcon
              message={isApproved ? '企业主体已认证，店铺名称已锁定' : '企业主体仍在审核流程中'}
              description="店铺名称、统一社会信用代码、企业角色来自企业认证资料；如需变更主体信息，应走企业认证变更或重新审核流程。"
            />

            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="店铺名称">
                <Text strong>{enterpriseInfo.enterprise_name || '-'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="企业编码">{enterpriseInfo.enterprise_code || '-'}</Descriptions.Item>
              <Descriptions.Item label="统一社会信用代码">
                {enterpriseInfo.unified_social_credit_code || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="供应链身份">
                <Tag color="blue">{roleLabels[enterpriseInfo.enterprise_role] || enterpriseInfo.enterprise_role || '-'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="认证状态">
                <Tag color={status.color}>{status.text}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card
            title={
              <span className="inline-flex items-center gap-2">
                <SafetyCertificateOutlined />
                认证资料
              </span>
            }
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item label="法人">{enterpriseInfo.legal_person || '-'}</Descriptions.Item>
              <Descriptions.Item label="联系人">{enterpriseInfo.verification_info?.contact_name || '-'}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{enterpriseInfo.verification_info?.contact_phone || '-'}</Descriptions.Item>
              <Descriptions.Item label="注册地址">{enterpriseInfo.verification_info?.address || '-'}</Descriptions.Item>
              <Descriptions.Item label="开户银行">{enterpriseInfo.verification_info?.bank_name || '-'}</Descriptions.Item>
              <Descriptions.Item label="银行账号">{enterpriseInfo.verification_info?.bank_account || '-'}</Descriptions.Item>
            </Descriptions>
            <Button className="mt-4 w-full" onClick={() => navigate('/enterprise')}>
              查看企业信息
            </Button>
          </Card>

          <Card title="店铺展示信息" className="xl:col-span-2">
            <Form form={form} layout="vertical">
              <Form.Item
                name="shopName"
                label="店铺名称"
                extra="店铺名称固定使用已认证企业名称，避免买家端展示主体与认证主体不一致。"
              >
                <Input disabled />
              </Form.Item>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <Form.Item name="contact" label="认证联系人">
                  <Input disabled />
                </Form.Item>
                <Form.Item name="phone" label="认证联系电话">
                  <Input disabled />
                </Form.Item>
              </div>
              <Form.Item name="address" label="认证经营地址">
                <Input disabled />
              </Form.Item>
            </Form>
          </Card>
        </div>
      )}
    </div>
  )
}
