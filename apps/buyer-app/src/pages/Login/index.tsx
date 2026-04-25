import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Card, Form, Input, Button, Typography, Tabs, message } from 'antd'
import { UserOutlined, LockOutlined, MobileOutlined } from '@ant-design/icons'
import { buyerAuthService, normalizeBuyerUser, saveBuyerSession } from '@/services/auth'
import { useUserStore } from '@/stores'

const { Paragraph, Text } = Typography

interface LoginValues {
  account: string
  password: string
}

interface RegisterValues {
  phone: string
  email?: string
  password: string
}

function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null) {
    const response = 'response' in error ? error.response : undefined
    if (typeof response === 'object' && response !== null && 'data' in response) {
      const data = response.data
      if (typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string') {
        return data.message
      }
    }
  }
  return error instanceof Error ? error.message : undefined
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const login = useUserStore((state) => state.login)
  const redirectTo = searchParams.get('redirect') || (location.state as { from?: string } | null)?.from || '/'

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
    } catch (error: unknown) {
      const serverMessage = getErrorMessage(error)
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
    } catch (error: unknown) {
      const serverMessage = getErrorMessage(error)
      message.error(serverMessage || '注册失败，请确认手机号未被占用')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f0f5ff_0%,#d6e4ff_48%,#adc6ff_100%)] flex items-center justify-center px-4">
      <div className="w-full max-w-[1080px] grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
        <section className="text-slate-900">
          <div className="inline-flex items-center rounded-full border border-white/70 bg-white/70 px-4 py-1 text-sm font-medium text-blue-700 shadow-sm">
            SteelLink 采购平台
          </div>
          <h1 className="mt-6 text-4xl font-black leading-tight text-slate-900">
            在线询价、一键下单、全程可追踪
          </h1>
          <Paragraph className="mt-5 max-w-[620px] text-base leading-7 text-slate-600">
            SteelLink 为钢材采购方提供一站式在线交易服务。浏览商品、比价下单、合同签署到提货确认，全流程线上完成。
          </Paragraph>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white/85 p-4 shadow-sm ring-1 ring-white/60">
              <div className="text-sm text-slate-500">海量商品</div>
              <div className="mt-2 text-lg font-semibold">多品类钢材现货</div>
            </div>
            <div className="rounded-2xl bg-white/85 p-4 shadow-sm ring-1 ring-white/60">
              <div className="text-sm text-slate-500">透明报价</div>
              <div className="mt-2 text-lg font-semibold">实时价格可比对</div>
            </div>
            <div className="rounded-2xl bg-white/85 p-4 shadow-sm ring-1 ring-white/60">
              <div className="text-sm text-slate-500">订单追踪</div>
              <div className="mt-2 text-lg font-semibold">全流程状态可见</div>
            </div>
          </div>
        </section>

        <Card className="rounded-3xl border-0 shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
          <div className="mb-6">
            <div className="text-2xl font-bold text-slate-900">买家登录</div>
            <Text type="secondary">登录后即可浏览商品、下单采购</Text>
          </div>

          <Tabs
            defaultActiveKey="login"
            items={[
              {
                key: 'login',
                label: '账号登录',
                children: (
                  <Form layout="vertical" onFinish={handleLogin} autoComplete="off">
                    <Form.Item
                      name="account"
                      label="手机号或邮箱"
                      rules={[{ required: true, message: '请输入手机号或邮箱' }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="请输入手机号或邮箱" size="large" />
                    </Form.Item>
                    <Form.Item
                      name="password"
                      label="密码"
                      rules={[{ required: true, message: '请输入密码' }]}
                    >
                      <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" size="large" />
                    </Form.Item>
                    <Form.Item className="mb-3">
                      <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                        登录
                      </Button>
                    </Form.Item>
                    <div className="text-right">
                      <Link to="#" className="text-blue-600 text-sm no-underline">忘记密码？</Link>
                    </div>
                  </Form>
                ),
              },
              {
                key: 'register',
                label: '注册账号',
                children: (
                  <Form layout="vertical" onFinish={handleRegister} autoComplete="off">
                    <Form.Item
                      name="phone"
                      label="手机号"
                      rules={[
                        { required: true, message: '请输入手机号' },
                        { pattern: /^1\d{10}$/, message: '请输入有效的 11 位手机号' },
                      ]}
                    >
                      <Input prefix={<MobileOutlined />} placeholder="请输入手机号" size="large" />
                    </Form.Item>
                    <Form.Item
                      name="email"
                      label="邮箱"
                      rules={[{ type: 'email', message: '请输入有效邮箱地址' }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="选填" size="large" />
                    </Form.Item>
                    <Form.Item
                      name="password"
                      label="密码"
                      rules={[
                        { required: true, message: '请设置密码' },
                        { min: 6, message: '密码至少 6 位' },
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined />} placeholder="请设置密码" size="large" />
                    </Form.Item>
                    <Form.Item className="mb-3">
                      <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                        注册
                      </Button>
                    </Form.Item>
                  </Form>
                ),
              },
            ]}
          />

          <div className="mt-4 text-center text-sm text-slate-500">
            登录即表示同意
            <Link to="#" className="text-blue-600 mx-1 no-underline">《用户协议》</Link>
            和
            <Link to="#" className="text-blue-600 mx-1 no-underline">《隐私政策》</Link>
          </div>

          <div className="mt-3 text-center">
            <Button type="link" onClick={() => navigate('/')} className="text-slate-400 text-sm">
              暂不登录，先逛逛 →
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
