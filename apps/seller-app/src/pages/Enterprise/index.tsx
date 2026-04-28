import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Form, Input, Button, Typography, Select, Upload, Spin, message, Divider, Descriptions, Tag, Result, Steps } from 'antd'
import { BankOutlined, UploadOutlined, ArrowLeftOutlined, SafetyCertificateOutlined, TeamOutlined, CheckCircleFilled, ClockCircleFilled, CloseCircleFilled } from '@ant-design/icons'
import { certificationService, getIdentityStatusLabel, getIdentityStatusColor } from '@/services/certificationService'
import { uploadService } from '@/services/uploadService'
import type { CreateEnterprisePayload, EnterpriseInfo, IdentityStatus } from '@/services/certificationService'

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
  const [identityStatus, setIdentityStatus] = useState<IdentityStatus | null>(null)
  const [licenseUrl, setLicenseUrl] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    checkEnterprise()
    checkIdentity()
  }, [])

  const checkIdentity = async () => {
    try {
      const res = await certificationService.getIdentityStatus()
      if (res.code === 0 && res.data) {
        setIdentityStatus(res.data)
      }
    } catch (error) {
      void error
    }
  }

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

  const identityStep = identityStatus?.identity_status ?? 0
  const identityCompleted = identityStep >= 2
  const identityRejected = identityStep === 3
  const identityReviewing = identityStep === 1

  const enterpriseApproved = hasEnterprise && enterpriseInfo?.status === 1
  const enterpriseReviewing = hasEnterprise && enterpriseInfo?.status === 0
  const enterpriseRejected = hasEnterprise && enterpriseInfo?.status === 2

  const stepCurrent = enterpriseApproved ? 2 : hasEnterprise || identityCompleted ? 1 : 0

  const identityIcon = () => {
    if (identityCompleted) return <CheckCircleFilled className="text-green-500" />
    if (identityReviewing) return <ClockCircleFilled className="text-blue-500" />
    if (identityRejected) return <CloseCircleFilled className="text-red-500" />
    return <CloseCircleFilled className="text-gray-300" />
  }

  const identityDesc = () => {
    if (identityCompleted) return '已通过'
    if (identityReviewing) return '审核中'
    if (identityRejected) return '已驳回'
    return '未提交'
  }

  const enterpriseIcon = () => {
    if (enterpriseApproved) return <CheckCircleFilled className="text-green-500" />
    if (enterpriseReviewing) return <ClockCircleFilled className="text-blue-500" />
    if (enterpriseRejected) return <CloseCircleFilled className="text-red-500" />
    if (hasEnterprise) return <ClockCircleFilled className="text-blue-500" />
    return <CloseCircleFilled className="text-gray-300" />
  }

  const enterpriseDesc = () => {
    if (enterpriseApproved) return '已通过'
    if (enterpriseReviewing) return '审核中'
    if (enterpriseRejected) return '已驳回'
    return '未提交'
  }

  const sellingIcon = () => {
    if (enterpriseApproved) return <CheckCircleFilled className="text-green-500" />
    return <CloseCircleFilled className="text-gray-300" />
  }

  const sellingDesc = () => {
    if (enterpriseApproved) return '已通过'
    return '未通过'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className="mb-4">
          返回
        </Button>

        <Card className="rounded-2xl shadow-sm border-0 mb-6">
          <div className="text-center mb-6">
            <BankOutlined className="text-4xl text-blue-500 mb-2" />
            <Title level={3} className="!mb-1">企业入驻</Title>
            <Text type="secondary">完成以下步骤后即可发布商品、管理订单</Text>
          </div>

          <Steps
            current={stepCurrent}
            className="mb-8"
            items={[
              {
                title: '个人实名',
                description: identityDesc(),
                icon: identityIcon(),
              },
              {
                title: '企业认证',
                description: enterpriseDesc(),
                icon: enterpriseIcon(),
              },
              {
                title: '开始经营',
                description: sellingDesc(),
                icon: sellingIcon(),
              },
            ]}
          />
        </Card>

        {hasEnterprise ? (
          <Card className="rounded-2xl shadow-sm border-0">
            <Result
              status={enterpriseInfo?.status === 1 ? 'success' : enterpriseInfo?.status === 0 ? 'info' : 'error'}
              title={
                enterpriseInfo?.status === 1
                  ? '企业认证已通过'
                  : enterpriseInfo?.status === 0
                    ? '企业认证审核中'
                    : '企业认证被驳回'
              }
              subTitle={
                enterpriseInfo?.status === 1
                  ? '您已可以正常使用卖家功能'
                  : enterpriseInfo?.status === 0
                    ? '请耐心等待平台审核'
                    : '请根据驳回原因修改后重新提交'
              }
              className="!pb-2"
            />
            {enterpriseInfo && (
              <Descriptions bordered column={1} size="small" className="mb-6">
                <Descriptions.Item label="企业名称">{enterpriseInfo.enterprise_name}</Descriptions.Item>
                <Descriptions.Item label="企业编码">{enterpriseInfo.enterprise_code}</Descriptions.Item>
                <Descriptions.Item label="企业角色">
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
              {enterpriseInfo?.status === 1 ? (
                <Button type="primary" size="large" onClick={() => navigate('/products')}>管理商品</Button>
              ) : (
                <Button onClick={() => navigate('/dashboard')}>返回首页</Button>
              )}
            </div>
          </Card>
        ) : !identityCompleted ? (
          <Card className="rounded-2xl shadow-sm border-0">
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-50 mb-5">
                <SafetyCertificateOutlined className="text-4xl text-orange-400" />
              </div>
              <Title level={4} className="!mb-2">请先完成个人实名认证</Title>
              <Paragraph type="secondary" className="text-base mb-1">
                企业入驻前需完成个人实名认证
              </Paragraph>
              <Paragraph type="secondary" className="text-sm mb-6">
                认证流程：个人实名 → 企业入驻 → 开始经营
              </Paragraph>
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-gray-50 rounded-lg">
                <Text type="secondary" className="text-sm">当前实名状态</Text>
                <Tag color={getIdentityStatusColor(identityStep)}>
                  {getIdentityStatusLabel(identityStep)}
                </Tag>
              </div>
              <div>
                <Button type="primary" size="large" onClick={() => navigate('/identity')}>
                  前往实名认证
                </Button>
              </div>
            </div>
          </Card>
        ) : mode === null ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card
              hoverable
              className="rounded-2xl shadow-sm border-0 text-center"
              onClick={() => setMode('create')}
            >
              <div className="py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                  <BankOutlined className="text-3xl text-blue-500" />
                </div>
                <Title level={5} className="!mb-2">创建新企业</Title>
                <Paragraph type="secondary" className="!mb-0 text-sm">
                  注册您所在的企业<br />成为企业管理员
                </Paragraph>
              </div>
            </Card>
            <Card
              hoverable
              className="rounded-2xl shadow-sm border-0 text-center"
              onClick={() => setMode('join')}
            >
              <div className="py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-4">
                  <TeamOutlined className="text-3xl text-green-500" />
                </div>
                <Title level={5} className="!mb-2">加入已有企业</Title>
                <Paragraph type="secondary" className="!mb-0 text-sm">
                  通过企业编码<br />加入已注册的企业
                </Paragraph>
              </div>
            </Card>
          </div>
        ) : mode === 'create' ? (
          <Card className="rounded-2xl shadow-sm border-0">
            <Button type="link" onClick={() => setMode(null)} className="!pl-0 mb-2">← 返回选择</Button>
            <Form form={form} layout="vertical" onFinish={handleCreate}>
              <Form.Item label="企业名称" name="enterprise_name" rules={[{ required: true, message: '请输入企业名称' }]}>
                <Input placeholder="请输入营业执照上的企业全称" size="large" />
              </Form.Item>

              <Form.Item label="企业角色" name="enterprise_role" rules={[{ required: true, message: '请选择企业角色' }]}>
                <Select placeholder="请选择企业角色" size="large" options={[
                  { value: 'seller', label: '供应商' },
                  { value: 'buyer', label: '采购方/贸易商' },
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
          </Card>
        ) : (
          <Card className="rounded-2xl shadow-sm border-0">
            <Button type="link" onClick={() => setMode(null)} className="!pl-0 mb-2">← 返回选择</Button>
            <Form form={joinForm} layout="vertical" onFinish={handleJoin}>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-4">
                  <TeamOutlined className="text-3xl text-green-500" />
                </div>
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
          </Card>
        )}
      </div>
    </div>
  )
}
