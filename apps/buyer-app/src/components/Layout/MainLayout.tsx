import { Outlet } from 'react-router-dom'
import { Layout } from 'antd'
import HomeHeader from './HomeHeader'
import Footer from './Footer'

const { Content } = Layout

export default function MainLayout() {
  return (
    <Layout className="min-h-screen">
      <HomeHeader />
      <Content className="bg-gray-50 mt-16">
        <Outlet />
      </Content>
      <Footer />
    </Layout>
  )
}
