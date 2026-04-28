import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Form, Input, Button, Typography, Steps, Upload, Tag, Spin, message, Space } from 'antd'
import { UserOutlined, IdcardOutlined, UploadOutlined, SafetyCertificateOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { certificationService, getIdentityStatusLabel, getIdentityStatusColor } from '@/services/certificationService'
import { uploadService } from '@/services/uploadService'
import { getSellerUser, updateSellerUser } from '@/services/auth'
import type { IdentityStatus } from '@/services/certificationService'

const { Title, Text, Paragraph } = Typography

export default function IdentityPage() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [identityStatus, setIdentityStatus] = useState<IdentityStatus | null>(null)
  const [frontUrl, setFrontUrl] = useState('')
  const [backUrl, setBackUrl] = useState('')
  const navigate = useNavigate()
  const user = getSellerUser()

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const res = await certificationService.getIdentityStatus()
      if (res.code === 0 && res.data) {
        setIdentityStatus(res.data)
        if (user) {
          updateSellerUser({
            ...user,
            identity_status: res.data.identity_status,
            identity_reject: res.data.identity_reject,
          })
        }
      }
    } catch (error) {
      void error
    } finally {
      setFetching(false)
    }
  }

  const handleUpload = async (file: File, side: 'front' | 'back') => {
    try {
      const result = await uploadService.upload(file, 'identity_card')
      if (side === 'front') {
        setFrontUrl(result.url)
      } else {
        setBackUrl(result.url)
      }
      message.success('上传成功')
      return false
    } catch {
      message.error('上传失败')
      return false
    }
  }

  const handleSubmit = async (values: { real_name: string; id_card: string }) => {
    if (!frontUrl || !backUrl) {
      message.warning('请上传身份证正反面照片')
      return
    }
    setLoading(true)
    try {
      const res = await certificationService.submitIdentity({
        real_name: values.real_name,
        id_card: values.id_card,
        id_card_front_url: frontUrl,
        id_card_back_url: backUrl,
      })
      if (res.code === 0) {
        message.success('实名认证已提交，请等待审核')
        fetchStatus()
      } else {
        message.error(res.message || '提交失败')
      }
    } catch {
      message.error('提交失败，请稍后重试')
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

  const status = identityStatus?.identity_status ?? 0
  const canSubmit = status === 0 || status === 3

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className="mb-4">
          返回
        </Button>

        <Card className="rounded-2xl shadow-lg border-0">
          <div className="text-center mb-6">
            <SafetyCertificateOutlined className="text-5xl text-blue-500 mb-3" />
            <Title level={3} className="!mb-1">实名认证</Title>
            <Text type="secondary">完成实名认证后方可加入企业、进行交易</Text>
          </div>

          <div className="mb-6">
            <Steps
              current={status >= 2 ? 2 : status}
              items={[
                { title: '填写信息' },
                { title: '审核中' },
                { title: status === 3 ? '已驳回' : '已认证' },
              ]}
            />
          </div>

          {status !== 0 && status !== 3 && (
            <Card className="mb-6 bg-gray-50" size="small">
              <div className="flex items-center justify-between">
                <span>当前状态</span>
                <Tag color={getIdentityStatusColor(status)}>{getIdentityStatusLabel(status)}</Tag>
              </div>
              {status === 1 && (
                <Paragraph className="!mt-3 !mb-0 text-gray-500">
                  您的实名认证正在审核中，请耐心等待。
                </Paragraph>
              )}
              {status === 2 && (
                <Paragraph className="!mt-3 !mb-0 text-gray-500">
                  您已完成实名认证。
                </Paragraph>
              )}
            </Card>
          )}

          {status === 3 && identityStatus?.identity_reject && (
            <Card className="mb-6 bg-red-50 border-red-200" size="small">
              <Text type="danger">驳回原因：{identityStatus.identity_reject}</Text>
            </Card>
          )}

          {canSubmit ? (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                real_name: identityStatus?.real_name || '',
                id_card: identityStatus?.id_card || '',
              }}
            >
              <Form.Item
                label="真实姓名"
                name="real_name"
                rules={[{ required: true, message: '请输入真实姓名' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="请输入身份证上的姓名" size="large" />
              </Form.Item>

              <Form.Item
                label="身份证号"
                name="id_card"
                rules={[
                  { required: true, message: '请输入身份证号' },
                  { len: 18, message: '身份证号应为18位' },
                ]}
              >
                <Input prefix={<IdcardOutlined />} placeholder="请输入18位身份证号" size="large" maxLength={18} />
              </Form.Item>

              <Form.Item label="身份证正面（人像面）" required>
                <Upload
                  beforeUpload={(file) => handleUpload(file, 'front')}
                  maxCount={1}
                  accept="image/*"
                  showUploadList={!!frontUrl}
                >
                  <Button icon={<UploadOutlined />}>{frontUrl ? '已上传人像面（点击更换）' : '上传人像面'}</Button>
                </Upload>
              </Form.Item>

              <Form.Item label="身份证背面（国徽面）" required>
                <Upload
                  beforeUpload={(file) => handleUpload(file, 'back')}
                  maxCount={1}
                  accept="image/*"
                  showUploadList={!!backUrl}
                >
                  <Button icon={<UploadOutlined />}>{backUrl ? '已上传国徽面（点击更换）' : '上传国徽面'}</Button>
                </Upload>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block size="large">
                  提交实名认证
                </Button>
              </Form.Item>
            </Form>
          ) : null}

          {status === 2 && !user?.enterprise_code && (
            <div className="text-center mt-4">
              <Space>
                <Text type="secondary">已完成实名，可以加入企业</Text>
                <Button type="primary" onClick={() => navigate('/enterprise')}>
                  企业入驻
                </Button>
              </Space>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
