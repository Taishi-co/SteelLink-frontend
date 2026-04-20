import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, Form, Input, Button, Typography, Tabs, Space, message } from 'antd'
import { UserOutlined, LockOutlined, MobileOutlined } from '@ant-design/icons'

const { Text } = Typography

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('password')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    setLoading(true)
    // Mock login
    setTimeout(() => {
      setLoading(false)
      message.success('登录成功')
      navigate('/')
    }, 1000)
  }

  const handleRegister = async () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      message.success('注册成功，请登录')
      setActiveTab('password')
    }, 1000)
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
                key: 'password',
                label: '密码登录',
                children: (
                  <Form
                    layout="vertical"
                    onFinish={handleLogin}
                  >
                    <Form.Item
                      name="username"
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
                key: 'sms',
                label: '短信登录',
                children: (
                  <Form
                    layout="vertical"
                    onFinish={handleLogin}
                  >
                    <Form.Item
                      name="mobile"
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
                      name="code"
                      rules={[{ required: true, message: '请输入验证码' }]}
                    >
                      <Space className="w-full">
                        <Input placeholder="验证码" size="large" className="flex-1" />
                        <Button size="large">获取验证码</Button>
                      </Space>
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
                      name="mobile"
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
                      name="companyName"
                      rules={[{ required: true, message: '请输入企业名称' }]}
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="企业名称"
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
                    <Form.Item
                      name="code"
                      rules={[{ required: true, message: '请输入验证码' }]}
                    >
                      <Space className="w-full">
                        <Input placeholder="验证码" size="large" className="flex-1" />
                        <Button size="large">获取验证码</Button>
                      </Space>
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
