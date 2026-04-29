import { useNavigate } from 'react-router-dom'
import { Card, Button, Typography, Steps } from 'antd'
import {
  UserAddOutlined,
  SafetyCertificateOutlined,
  BankOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  IdcardOutlined,
  PhoneOutlined,
  BankFilled,
} from '@ant-design/icons'
import { useUserStore } from '@/stores'

const { Title, Paragraph } = Typography

const flowSteps = [
  {
    title: '注册 / 登录',
    icon: <UserAddOutlined />,
    description: '使用手机号注册账号并登录平台',
  },
  {
    title: '个人实名认证',
    icon: <SafetyCertificateOutlined />,
    description: '提交真实姓名、身份证号及身份证照片，完成个人实名',
  },
  {
    title: '提交企业资料',
    icon: <BankOutlined />,
    description: '填写企业信息、上传营业执照，提交企业入驻申请',
  },
  {
    title: '审核通过',
    icon: <CheckCircleOutlined />,
    description: '平台审核通过后即可发布商品、参与交易',
  },
]

const materials = [
  { icon: <FileTextOutlined />, label: '营业执照', desc: '清晰的营业执照扫描件或照片' },
  { icon: <IdcardOutlined />, label: '法人身份信息', desc: '法人姓名及身份证号' },
  { icon: <PhoneOutlined />, label: '联系方式', desc: '企业联系人手机号' },
  { icon: <BankFilled />, label: '对公银行账户', desc: '开户行、账户名称及账号' },
]

export default function EnterpriseIntroPage() {
  const navigate = useNavigate()
  const { isLoggedIn, user } = useUserStore()

  const handleStart = () => {
    if (!isLoggedIn) {
      navigate('/login?redirect=/dashboard/enterprise')
      return
    }
    navigate('/dashboard/enterprise')
  }

  const currentStep = !isLoggedIn
    ? 0
    : (user?.identityStatus ?? 0) < 2
      ? 1
      : !user?.enterpriseCode
        ? 2
        : 3

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f0f5ff_0%,#d6e4ff_48%,#adc6ff_100%)] py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center rounded-full border border-white/70 bg-white/70 px-4 py-1 text-sm font-medium text-blue-700 shadow-sm mb-6">
            SteelLink 企业入驻
          </div>
          <Title level={2} className="!mb-3">成为 SteelLink 企业会员</Title>
          <Paragraph className="text-base text-slate-500 max-w-lg mx-auto">
            入驻平台后可发布商品、参与竞价采购、智能撮合交易，开启钢材数字化交易之旅
          </Paragraph>
        </div>

        <Card className="rounded-2xl shadow-lg border-0 mb-8">
          <Title level={4} className="!mb-6 text-center">入驻流程</Title>
          <Steps
            current={currentStep}
            items={flowSteps.map((s) => ({
              title: s.title,
              icon: s.icon,
              description: s.description,
            }))}
            className="mb-8"
          />
          <div className="text-center">
            <Button type="primary" size="large" onClick={handleStart}>
              {!isLoggedIn
                ? '注册 / 登录'
                : (user?.identityStatus ?? 0) < 2
                  ? '去实名认证'
                  : !user?.enterpriseCode
                    ? '提交企业资料'
                    : '查看企业信息'}
            </Button>
          </div>
        </Card>

        <Card className="rounded-2xl shadow-lg border-0 mb-8">
          <Title level={4} className="!mb-6 text-center">认证所需材料</Title>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {materials.map((m) => (
              <div key={m.label} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
                <span className="text-2xl text-blue-500 mt-0.5">{m.icon}</span>
                <div>
                  <div className="font-medium text-slate-800">{m.label}</div>
                  <div className="text-sm text-slate-500">{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white/85 p-5 shadow-sm ring-1 ring-white/60 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">1-2</div>
            <div className="text-sm text-slate-500">工作日内完成审核</div>
          </div>
          <div className="rounded-2xl bg-white/85 p-5 shadow-sm ring-1 ring-white/60 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">0</div>
            <div className="text-sm text-slate-500">入驻费用</div>
          </div>
          <div className="rounded-2xl bg-white/85 p-5 shadow-sm ring-1 ring-white/60 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">5</div>
            <div className="text-sm text-slate-500">种企业角色可选</div>
          </div>
        </div>
      </div>
    </div>
  )
}
