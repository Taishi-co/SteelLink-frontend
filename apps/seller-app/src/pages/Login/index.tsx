import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Card, Form, Input, Tabs, Typography, message } from 'antd'
import { LockOutlined, MobileOutlined, UserOutlined } from '@ant-design/icons'
import { getErrorMessage } from '@steellink/shared/utils'
import { saveSellerSession, sellerAuthService } from '@/services/auth'

const { Paragraph, Text } = Typography

interface LoginValues {
  account: string
  password: string
}

interface RegisterValues {
  phone: string
  password: string
  email?: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const params = new URLSearchParams(window.location.search)
  const redirect = params.get('redirect')
  const switchToken = params.get('switch_token')

  const goAfterLogin = useCallback(() => {
    if (redirect?.startsWith('/seller/')) {
      navigate(redirect.replace(/^\/seller/, '') || '/', { replace: true })
      return
    }
    navigate('/dashboard', { replace: true })
  }, [navigate, redirect])

  useEffect(() => {
    if (!switchToken) {
      return
    }

    let cancelled = false
    setLoading(true)
    sellerAuthService.consumeSwitchSession(switchToken)
      .then((response) => {
        if (cancelled) {
          return
        }
        if (response.code !== 0 || !response.data) {
          throw new Error(response.message || '切换登录失败')
        }
        const { access_token, user } = response.data
        saveSellerSession(access_token, user)
        message.success('已切换到卖家中心')
        goAfterLogin()
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          message.error(getErrorMessage(error, '切换登录失败，请手动登录'))
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [goAfterLogin, switchToken])

  const handleLogin = async (values: LoginValues) => {
    setLoading(true)
    try {
      const response = await sellerAuthService.login(values)
      if (response.code !== 0 || !response.data) {
        throw new Error(response.message || '登录失败')
      }
      const { access_token, user } = response.data
      saveSellerSession(access_token, user)
      message.success('卖家登录成功')
      goAfterLogin()
    } catch (error: unknown) {
      message.error(getErrorMessage(error, '登录失败，请检查账号密码或确认后端服务是否正常'))
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (values: RegisterValues) => {
    setLoading(true)
    try {
      const response = await sellerAuthService.register(values)
      if (response.code !== 0 || !response.data) {
        throw new Error(response.message || '注册失败')
      }
      const { access_token, user } = response.data
      saveSellerSession(access_token, user)
      message.success('注册成功，已自动登录')
      goAfterLogin()
    } catch (error: unknown) {
      message.error(getErrorMessage(error, '注册失败，请确认手机号未被占用'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#eef5ff_0%,#d8e7ff_48%,#c1d8ff_100%)] flex items-center justify-center px-4">
      <div className="w-full max-w-[1080px] grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
        <section className="text-slate-900">
          <div className="inline-flex items-center rounded-full border border-white/70 bg-white/70 px-4 py-1 text-sm font-medium text-sky-700 shadow-sm">
            SteelLink 卖家工作台
          </div>
          <h1 className="mt-6 text-4xl font-black leading-tight text-slate-900">
            提报商品、跟踪审核、协同订单
            <br />
            先把联调链路跑顺。
          </h1>
          <Paragraph className="mt-5 max-w-[620px] text-base leading-7 text-slate-600">
            这里直接连接本地联调中的主业务后端。登录后你就能提交商品，随后去管理端页面查看待审核记录和审核结果回写。
          </Paragraph>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white/85 p-4 shadow-sm ring-1 ring-white/60">
              <div className="text-sm text-slate-500">商品提报</div>
              <div className="mt-2 text-lg font-semibold">提交即入库</div>
            </div>
            <div className="rounded-2xl bg-white/85 p-4 shadow-sm ring-1 ring-white/60">
              <div className="text-sm text-slate-500">管理端同步</div>
              <div className="mt-2 text-lg font-semibold">待审核立即可见</div>
            </div>
            <div className="rounded-2xl bg-white/85 p-4 shadow-sm ring-1 ring-white/60">
              <div className="text-sm text-slate-500">审核回写</div>
              <div className="mt-2 text-lg font-semibold">状态实时更新</div>
            </div>
          </div>
        </section>

        <Card className="rounded-3xl border-0 shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
          <div className="mb-6">
            <div className="text-2xl font-bold text-slate-900">卖家入口</div>
            <Text type="secondary">可以直接用我刚创建的测试卖家账号登录体验。</Text>
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
                      initialValue="13900007578"
                      rules={[{ required: true, message: '请输入手机号或邮箱' }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="请输入手机号或邮箱" size="large" />
                    </Form.Item>
                    <Form.Item
                      name="password"
                      label="密码"
                      initialValue="Seller123"
                      rules={[{ required: true, message: '请输入密码' }]}
                    >
                      <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" size="large" />
                    </Form.Item>
                    <Form.Item className="mb-3">
                      <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                        进入卖家后台
                      </Button>
                    </Form.Item>
                  </Form>
                ),
              },
              {
                key: 'register',
                label: '注册卖家',
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
                      <Input prefix={<UserOutlined />} placeholder="选填，用于联调测试" size="large" />
                    </Form.Item>
                    <Form.Item
                      name="password"
                      label="密码"
                      rules={[
                        { required: true, message: '请输入密码' },
                        { min: 6, message: '密码至少 6 位' },
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined />} placeholder="请设置密码" size="large" />
                    </Form.Item>
                    <Form.Item className="mb-3">
                      <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                        注册并进入卖家后台
                      </Button>
                    </Form.Item>
                  </Form>
                ),
              },
            ]}
          />

          <div className="mt-4 text-sm text-slate-500">
            管理端入口：
            <Link to="/login" className="ml-1 text-sky-600 no-underline">
              当前页即卖家登录页
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
