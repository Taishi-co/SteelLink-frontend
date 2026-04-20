import { Outlet } from 'react-router-dom'
import { Layout } from 'antd'
import Header from './Header'
import Footer from './Footer'

const { Content } = Layout

export default function MainLayout() {
  return (
    <Layout className="min-h-screen">
      <Header />
      <Content className="bg-gray-50">
        <Outlet />
      </Content>
      <Footer />
    </Layout>
  )
}
