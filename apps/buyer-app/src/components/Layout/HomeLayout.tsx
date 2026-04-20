import { Outlet } from 'react-router-dom'
import { Layout } from 'antd'
import HomeHeader from './HomeHeader'
import HomeFooter from './HomeFooter'

const { Content } = Layout

export default function HomeLayout() {
  return (
    <Layout className="min-h-screen">
      <HomeHeader />
      <Content className="mt-16">
        <Outlet />
      </Content>
      <HomeFooter />
    </Layout>
  )
}
