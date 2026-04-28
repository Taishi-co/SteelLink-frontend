import { Layout, Row, Col, Typography, Space } from 'antd'
import { Link } from 'react-router-dom'

const { Footer: AntFooter } = Layout
const { Text } = Typography
const sellerEntryHref = import.meta.env.DEV ? 'http://localhost:5174/seller/enterprise' : '/seller/enterprise'
const sellerDashboardHref = import.meta.env.DEV ? 'http://localhost:5174/seller/dashboard' : '/seller/dashboard'

export default function HomeFooter() {
  return (
    <AntFooter className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-8">
        <Row gutter={[48, 48]}>
          <Col span={8}>
            <Text className="text-white text-2xl font-bold">SteelLink</Text>
            <p className="text-gray-400 mt-4">
              专业B2B钢材交易平台，为钢铁行业提供现货交易、竞价采购、集采服务等一站式解决方案。
            </p>
          </Col>
          <Col span={4}>
            <Text className="text-white font-medium block mb-4">平台服务</Text>
            <Space direction="vertical" className="text-gray-400">
              <Link to="/products" className="text-gray-400 hover:text-white">现货商城</Link>
              <Link to="/matching" className="text-gray-400 hover:text-white">供求信息</Link>
              <Link to="/ai-procurement" className="text-gray-400 hover:text-white">AI采购</Link>
              <Link to="/bidding" className="text-gray-400 hover:text-white">竞价交易</Link>
              <Link to="/procurement" className="text-gray-400 hover:text-white">集采大厅</Link>
            </Space>
          </Col>
          <Col span={4}>
            <Text className="text-white font-medium block mb-4">关于我们</Text>
            <Space direction="vertical" className="text-gray-400">
              <Link to="/about" className="text-gray-400 hover:text-white">平台介绍</Link>
              <Link to="/about#contact" className="text-gray-400 hover:text-white">联系我们</Link>
              <Link to="/help" className="text-gray-400 hover:text-white">帮助中心</Link>
            </Space>
          </Col>
          <Col span={4}>
            <Text className="text-white font-medium block mb-4">商家服务</Text>
            <Space direction="vertical" className="text-gray-400">
              <a href={sellerEntryHref} className="text-gray-400 hover:text-white">企业入驻</a>
              <a href={sellerDashboardHref} className="text-gray-400 hover:text-white">商家中心</a>
              <Link to="/rules" className="text-gray-400 hover:text-white">平台规则</Link>
            </Space>
          </Col>
          <Col span={4}>
            <Text className="text-white font-medium block mb-4">联系方式</Text>
            <Space direction="vertical" className="text-gray-400">
              <Text className="text-gray-400">客服热线：400-888-8888</Text>
              <Text className="text-gray-400">工作时间：9:00-18:00</Text>
              <Text className="text-gray-400">邮箱：contact@steellink.com</Text>
            </Space>
          </Col>
        </Row>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-500">
          <p>© 2024 SteelLink. All rights reserved. | B2B钢材交易平台</p>
        </div>
      </div>
    </AntFooter>
  )
}
