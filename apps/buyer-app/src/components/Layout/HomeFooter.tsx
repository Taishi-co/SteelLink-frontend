import { Layout, Row, Col, Typography, Space } from 'antd'
import { Link } from 'react-router-dom'

const { Footer: AntFooter } = Layout
const { Text } = Typography
const sellerEntryHref = '/dashboard/enterprise'
const sellerDashboardHref = import.meta.env.DEV ? 'http://localhost:5174/seller/dashboard' : '/seller/dashboard'

export default function HomeFooter() {
  return (
    <AntFooter className="border-t border-[#eadcc7] bg-[#fffaf1] px-6 py-12 text-[#17221b] md:px-10">
      <div className="mx-auto max-w-7xl">
        <Row gutter={[40, 40]}>
          <Col xs={24} lg={8}>
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#214332] text-lg font-black text-[#f3c17c]">
                R
              </span>
              <div>
                <Text className="block text-xl font-black text-[#17221b]">锐联产业协同平台</Text>
                <Text className="text-xs font-bold tracking-[0.12em] text-[#a4662c]">RecoLink</Text>
              </div>
            </div>
            <p className="max-w-sm text-[#5f6b61]">
              专业产业资源协同平台，为钢铁行业提供现货交易、竞价采购、仓储物流和供应链金融等一站式解决方案。
            </p>
          </Col>
          <Col xs={12} md={6} lg={4}>
            <Text className="mb-4 block font-bold text-[#17221b]">平台服务</Text>
            <Space direction="vertical">
              <Link to="/mall" className="text-[#5f6b61] hover:text-[#9f5f23]">现货商城</Link>
              <Link to="/matching" className="text-[#5f6b61] hover:text-[#9f5f23]">供求信息</Link>
              <Link to="/ai-procurement" className="text-[#5f6b61] hover:text-[#9f5f23]">AI采购</Link>
              <Link to="/bidding" className="text-[#5f6b61] hover:text-[#9f5f23]">竞价交易</Link>
              <Link to="/procurement" className="text-[#5f6b61] hover:text-[#9f5f23]">集采大厅</Link>
            </Space>
          </Col>
          <Col xs={12} md={6} lg={4}>
            <Text className="mb-4 block font-bold text-[#17221b]">服务资源</Text>
            <Space direction="vertical">
              <Link to="/service-market" className="text-[#5f6b61] hover:text-[#9f5f23]">仓储物流</Link>
              <Link to="/dashboard/finance" className="text-[#5f6b61] hover:text-[#9f5f23]">资金服务</Link>
              <Link to="/dashboard/services" className="text-[#5f6b61] hover:text-[#9f5f23]">服务入口</Link>
            </Space>
          </Col>
          <Col xs={12} md={6} lg={4}>
            <Text className="mb-4 block font-bold text-[#17221b]">商家服务</Text>
            <Space direction="vertical">
              <a href={sellerEntryHref} className="text-[#5f6b61] hover:text-[#9f5f23]">企业入驻</a>
              <a href={sellerDashboardHref} className="text-[#5f6b61] hover:text-[#9f5f23]">商家中心</a>
              <Link to="/about" className="text-[#5f6b61] hover:text-[#9f5f23]">平台介绍</Link>
            </Space>
          </Col>
          <Col xs={12} md={6} lg={4}>
            <Text className="mb-4 block font-bold text-[#17221b]">联系方式</Text>
            <Space direction="vertical">
              <Text className="text-[#5f6b61]">客服热线：400-888-8888</Text>
              <Text className="text-[#5f6b61]">工作时间：9:00-18:00</Text>
              <Text className="text-[#5f6b61]">邮箱：contact@recolink.com</Text>
            </Space>
          </Col>
        </Row>
        <div className="mt-10 border-t border-[#eadcc7] pt-8 text-center text-[#7a847a]">
          <p>© 2026 锐联产业协同平台 RecoLink. All rights reserved.</p>
        </div>
      </div>
    </AntFooter>
  )
}
