import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Form, Input, Button, Typography, Select, Upload, Spin, message, Divider, Descriptions, Tag } from 'antd'
import { BankOutlined, UploadOutlined, ArrowLeftOutlined, SafetyCertificateOutlined, TeamOutlined } from '@ant-design/icons'
import { certificationService } from '@/services/certificationService'
import { uploadService } from '@/services/uploadService'
import { useUserStore } from '@/stores'
import type { CreateEnterprisePayload, EnterpriseInfo } from '@/services/certificationService'

const { Title, Text, Paragraph } = Typography

type CreateEnterpriseFormValues = Omit<CreateEnterprisePayload, 'business_license_url'>
type ApiError = { response?: { data?: { message?: string } } }

export default function EnterprisePage() {
  const [form] = Form.useForm()
  const [joinForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'create' | 'join' | null>(null)
  const [fetching, setFetching] = useState(true)
  const [hasEnterprise, setHasEnterprise] = useState(false)
  const [enterpriseInfo, setEnterpriseInfo] = useState<EnterpriseInfo | null>(null)
  const [licenseUrl, setLicenseUrl] = useState('')
  const navigate = useNavigate()
  const user = useUserStore((s) => s.user)

  useEffect(() => {
    checkEnterprise()
  }, [])

  const checkEnterprise = async () => {
    try {
      const res = await certificationService.getMyEnterprise()
      if (res.code === 0 && res.data) {
        setHasEnterprise(true)
        const list = Array.isArray(res.data) ? res.data : [res.data]
        if (list.length > 0) {
          setEnterpriseInfo(list[0])
        }
      }
    } catch (error) {
      void error
    } finally {
      setFetching(false)
    }
  }

  const handleUploadLicense = async (file: File) => {
    try {
      const result = await uploadService.upload(file, 'enterprise_license')
      setLicenseUrl(result.url)
      message.success('上传成功')
      return false
    } catch {
      message.error('上传失败')
      return false
    }
  }

  const handleCreate = async (values: CreateEnterpriseFormValues) => {
    if (!licenseUrl) {
      message.warning('请上传营业执照')
      return
    }
    setLoading(true)
    try {
      const res = await certificationService.createEnterprise({
        ...values,
        business_license_url: licenseUrl,
      })
      if (res.code === 0) {
        message.success('企业创建成功，请等待审核')
        setHasEnterprise(true)
      } else {
        message.error(res.message || '创建失败')
      }
    } catch {
      message.error('创建失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (values: { enterprise_code: string }) => {
    setLoading(true)
    try {
      const res = await certificationService.joinEnterprise(values)
      if (res.code === 0) {
        message.success('已成功加入企业')
        setHasEnterprise(true)
      } else {
        message.error(res.message || '加入失败')
      }
    } catch (err: unknown) {
      const msg = (err as ApiError).response?.data?.message || '加入失败，请确认企业编码正确且您已完成实名认证'
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className="mb-4">
          返回
        </Button>

        <Card className="rounded-2xl shadow-lg border-0">
          <div className="text-center mb-6">
            <BankOutlined className="text-5xl text-blue-500 mb-3" />
            <Title level={3} className="!mb-1">企业入驻</Title>
            <Text type="secondary">加入企业后可进行交易、发布商品</Text>
          </div>

          {hasEnterprise ? (
            <div>
              <div className="text-center mb-6">
                <TeamOutlined className="text-5xl text-green-400 mb-3" />
                <Title level={4}>您已加入企业</Title>
              </div>
              {enterpriseInfo && (
                <Descriptions bordered column={1} size="small" className="mb-6">
                  <Descriptions.Item label="企业名称">{enterpriseInfo.enterprise_name}</Descriptions.Item>
                  <Descriptions.Item label="企业编码">{enterpriseInfo.enterprise_code}</Descriptions.Item>
                  <Descriptions.Item label="供应链身份">
                    <Tag color="blue">{enterpriseInfo.enterprise_role}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="统一社会信用代码">{enterpriseInfo.unified_social_credit_code}</Descriptions.Item>
                  <Descriptions.Item label="认证状态">
                    <Tag color={enterpriseInfo.status === 1 ? 'success' : enterpriseInfo.status === 0 ? 'processing' : 'error'}>
                      {enterpriseInfo.status === 1 ? '已认证' : enterpriseInfo.status === 0 ? '待审核' : '已驳回'}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              )}
              <div className="text-center">
                <Button type="primary" onClick={() => navigate('/mall')}>进入商城</Button>
              </div>
            </div>
          ) : user?.identityStatus !== 2 ? (
            <div className="text-center py-8">
              <SafetyCertificateOutlined className="text-6xl text-orange-400 mb-4" />
              <Title level={4}>请先完成实名认证</Title>
              <Paragraph type="secondary">加入企业前需要完成个人实名认证</Paragraph>
              <Button type="primary" onClick={() => navigate('/identity')}>去实名认证</Button>
            </div>
          ) : mode === null ? (
            <div className="space-y-4">
              <Card hoverable className="text-center" onClick={() => setMode('create')}>
                <BankOutlined className="text-4xl text-blue-500 mb-3" />
                <Title level={5}>创建新企业</Title>
                <Paragraph type="secondary" className="!mb-0">注册您所在的企业，成为企业管理员</Paragraph>
              </Card>
              <Card hoverable className="text-center" onClick={() => setMode('join')}>
                <TeamOutlined className="text-4xl text-green-500 mb-3" />
                <Title level={5}>加入已有企业</Title>
                <Paragraph type="secondary" className="!mb-0">通过企业编码加入已注册的企业</Paragraph>
              </Card>
            </div>
          ) : mode === 'create' ? (
            <>
              <Button type="link" onClick={() => setMode(null)} className="!pl-0 mb-2">← 返回选择</Button>
              <Form form={form} layout="vertical" onFinish={handleCreate}>
                <Form.Item label="企业名称" name="enterprise_name" rules={[{ required: true, message: '请输入企业名称' }]}>
                  <Input placeholder="请输入营业执照上的企业全称" size="large" />
                </Form.Item>

                <Form.Item label="供应链身份" name="enterprise_role" rules={[{ required: true, message: '请选择供应链身份' }]}>
                  <Select placeholder="请选择供应链身份" size="large" options={[
                    { value: 'buyer', label: '采购方/贸易商' },
                    { value: 'seller', label: '供应商' },
                    { value: 'logistics', label: '物流商' },
                    { value: 'warehouse', label: '仓储商' },
                    { value: 'fund', label: '资金方' },
                  ]} />
                </Form.Item>

                <Form.Item label="统一社会信用代码" name="unified_social_credit_code" rules={[{ required: true, message: '请输入统一社会信用代码' }]}>
                  <Input placeholder="18位统一社会信用代码" size="large" maxLength={18} />
                </Form.Item>

                <Form.Item label="法人姓名" name="legal_person" rules={[{ required: true, message: '请输入法人姓名' }]}>
                  <Input placeholder="请输入法人姓名" size="large" />
                </Form.Item>

                <Form.Item label="法人身份证号" name="legal_id_card" rules={[{ required: true, message: '请输入法人身份证号' }]}>
                  <Input placeholder="请输入18位身份证号" size="large" maxLength={18} />
                </Form.Item>

                <Form.Item label="营业执照" required>
                  <Upload
                    beforeUpload={handleUploadLicense}
                    maxCount={1}
                    accept="image/*"
                    showUploadList={!!licenseUrl}
                  >
                    <Button icon={<UploadOutlined />}>{licenseUrl ? '已上传营业执照（点击更换）' : '上传营业执照'}</Button>
                  </Upload>
                </Form.Item>

                <Divider />

                <Form.Item label="联系人手机" name="contact_phone" rules={[{ required: true, message: '请输入联系人手机' }]}>
                  <Input placeholder="请输入联系人手机号" size="large" maxLength={11} />
                </Form.Item>

                <Form.Item label="联系人邮箱" name="contact_email">
                  <Input placeholder="请输入联系人邮箱（选填）" size="large" />
                </Form.Item>

                <Divider />

                <Form.Item label="开户名称" name="bank_account_name" rules={[{ required: true, message: '请输入开户名称' }]}>
                  <Input placeholder="请输入对公账户开户名称" size="large" />
                </Form.Item>

                <Form.Item label="银行账号" name="bank_account_no" rules={[{ required: true, message: '请输入银行账号' }]}>
                  <Input placeholder="请输入对公银行账号" size="large" />
                </Form.Item>

                <Form.Item label="开户银行" name="bank_name" rules={[{ required: true, message: '请输入开户银行' }]}>
                  <Input placeholder="如：中国工商银行北京分行" size="large" />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} block size="large">
                    提交企业认证
                  </Button>
                </Form.Item>
              </Form>
            </>
          ) : (
            <>
              <Button type="link" onClick={() => setMode(null)} className="!pl-0 mb-2">← 返回选择</Button>
              <Form form={joinForm} layout="vertical" onFinish={handleJoin}>
                <div className="text-center mb-6">
                  <TeamOutlined className="text-4xl text-green-500 mb-3" />
                  <Paragraph type="secondary">请向企业管理员索取企业编码</Paragraph>
                </div>
                <Form.Item label="企业编码" name="enterprise_code" rules={[{ required: true, message: '请输入企业编码' }]}>
                  <Input placeholder="请输入企业编码" size="large" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} block size="large">
                    加入企业
                  </Button>
                </Form.Item>
              </Form>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
