import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Card, Form, Input, Button, Typography, Tabs, message } from 'antd'
import { UserOutlined, LockOutlined, MobileOutlined } from '@ant-design/icons'
import { buyerAuthService, normalizeBuyerUser, saveBuyerSession } from '@/services/auth'
import { useUserStore } from '@/stores'

const { Text } = Typography

interface LoginValues {
  account: string
  password: string
}

interface RegisterValues {
  phone: string
  email?: string
  password: string
}

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const login = useUserStore((state) => state.login)
  const redirectTo = (location.state as { from?: string } | null)?.from || '/'

  const handleLogin = async (values: LoginValues) => {
    setLoading(true)
    try {
      const response = await buyerAuthService.login(values)
      if (response.code !== 0 || !response.data) {
        throw new Error(response.message || '登录失败')
      }

      const { access_token, user } = response.data
      saveBuyerSession(access_token, user)
      login(normalizeBuyerUser(user), access_token)
      message.success('登录成功')
      navigate(redirectTo, { replace: true })
    } catch (error: any) {
      const serverMessage = error?.response?.data?.message || error?.message
      message.error(serverMessage || '登录失败，请检查账号密码')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (values: RegisterValues) => {
    setLoading(true)
    try {
      const response = await buyerAuthService.register(values)
      if (response.code !== 0 || !response.data) {
        throw new Error(response.message || '注册失败')
      }

      const { access_token, user } = response.data
      saveBuyerSession(access_token, user)
      login(normalizeBuyerUser(user), access_token)
      message.success('注册成功，已自动登录')
      navigate(redirectTo, { replace: true })
    } catch (error: any) {
      const serverMessage = error?.response?.data?.message || error?.message
      message.error(serverMessage || '注册失败，请确认手机号未被占用')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="w-[420px]">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-primary-600 no-underline">
            SteelLink
          </Link>
          <Text type="secondary" className="block mt-2">B2B钢材交易平台</Text>
        </div>

        <Card className="shadow-lg">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            centered
            items={[
              {
                key: 'login',
                label: '密码登录',
                children: (
                  <Form
                    layout="vertical"
                    onFinish={handleLogin}
                  >
                    <Form.Item
                      name="account"
                      initialValue="15127431219"
                      rules={[{ required: true, message: '请输入用户名/手机号' }]}
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="用户名/手机号"
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item
                      name="password"
                      rules={[{ required: true, message: '请输入密码' }]}
                    >
                      <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="密码"
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item>
                      <div className="flex justify-between">
                        <Link to="#" className="text-primary-600 text-sm">忘记密码？</Link>
                      </div>
                    </Form.Item>
                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        block
                        loading={loading}
                      >
                        登录
                      </Button>
                    </Form.Item>
                  </Form>
                ),
              },
              {
                key: 'register',
                label: '注册账号',
                children: (
                  <Form
                    layout="vertical"
                    onFinish={handleRegister}
                  >
                    <Form.Item
                      name="phone"
                      rules={[
                        { required: true, message: '请输入手机号' },
                        { pattern: /^1\d{10}$/, message: '手机号格式不正确' },
                      ]}
                    >
                      <Input
                        prefix={<MobileOutlined />}
                        placeholder="手机号"
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item
                      name="email"
                      rules={[{ type: 'email', message: '邮箱格式不正确' }]}
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="邮箱（选填）"
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item
                      name="password"
                      rules={[
                        { required: true, message: '请设置密码' },
                        { min: 6, message: '密码至少6位' },
                      ]}
                    >
                      <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="设置密码"
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        block
                        loading={loading}
                      >
                        注册
                      </Button>
                    </Form.Item>
                  </Form>
                ),
              },
            ]}
          />
        </Card>

        <div className="text-center mt-4 text-gray-500 text-sm">
          登录即表示同意
          <Link to="#" className="text-primary-600 mx-1">《用户协议》</Link>
          和
          <Link to="#" className="text-primary-600 mx-1">《隐私政策》</Link>
        </div>
      </div>
    </div>
  )
}
