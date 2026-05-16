import { Layout, Row, Col, Typography, Space } from 'antd'
import { Link } from 'react-router-dom'

const { Footer: AntFooter } = Layout
const { Text } = Typography
const sellerEntryHref = '/dashboard/enterprise'
const sellerDashboardHref = import.meta.env.DEV ? 'http://localhost:5174/seller/dashboard' : '/seller/dashboard'

export default function HomeFooter() {
  return (
    <AntFooter className="border-t border-white/10 bg-[#111813] px-6 py-14 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <Row gutter={[40, 40]}>
          <Col xs={24} lg={8}>
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#efb56f] text-lg font-black text-[#17221b]">
                R
              </span>
              <div>
                <Text className="block text-2xl font-black text-white">RecoLink</Text>
                <Text className="text-xs uppercase tracking-[0.22em] text-[#efb56f]">Steel Network</Text>
              </div>
            </div>
            <p className="max-w-sm text-white/54">
              专业产业资源协同平台，为钢铁行业提供现货交易、竞价采购、仓储物流和供应链金融等一站式解决方案。
            </p>
          </Col>
          <Col xs={12} md={6} lg={4}>
            <Text className="mb-4 block font-bold text-white">平台服务</Text>
            <Space direction="vertical">
              <Link to="/mall" className="text-white/54 hover:text-[#efb56f]">现货商城</Link>
              <Link to="/matching" className="text-white/54 hover:text-[#efb56f]">供求信息</Link>
              <Link to="/ai-procurement" className="text-white/54 hover:text-[#efb56f]">AI采购</Link>
              <Link to="/bidding" className="text-white/54 hover:text-[#efb56f]">竞价交易</Link>
              <Link to="/procurement" className="text-white/54 hover:text-[#efb56f]">集采大厅</Link>
            </Space>
          </Col>
          <Col xs={12} md={6} lg={4}>
            <Text className="mb-4 block font-bold text-white">服务资源</Text>
            <Space direction="vertical">
              <Link to="/service-market" className="text-white/54 hover:text-[#efb56f]">仓储物流</Link>
              <Link to="/dashboard/finance" className="text-white/54 hover:text-[#efb56f]">资金服务</Link>
              <Link to="/dashboard/services" className="text-white/54 hover:text-[#efb56f]">服务入口</Link>
            </Space>
          </Col>
          <Col xs={12} md={6} lg={4}>
            <Text className="mb-4 block font-bold text-white">商家服务</Text>
            <Space direction="vertical">
              <a href={sellerEntryHref} className="text-white/54 hover:text-[#efb56f]">企业入驻</a>
              <a href={sellerDashboardHref} className="text-white/54 hover:text-[#efb56f]">商家中心</a>
              <Link to="/about" className="text-white/54 hover:text-[#efb56f]">平台介绍</Link>
            </Space>
          </Col>
          <Col xs={12} md={6} lg={4}>
            <Text className="mb-4 block font-bold text-white">联系方式</Text>
            <Space direction="vertical">
              <Text className="text-white/54">客服热线：400-888-8888</Text>
              <Text className="text-white/54">工作时间：9:00-18:00</Text>
              <Text className="text-white/54">邮箱：contact@steellink.com</Text>
            </Space>
          </Col>
        </Row>
        <div className="mt-10 border-t border-white/10 pt-8 text-center text-white/38">
          <p>© 2026 RecoLink. All rights reserved. | 产业资源协同平台</p>
        </div>
      </div>
    </AntFooter>
  )
}
