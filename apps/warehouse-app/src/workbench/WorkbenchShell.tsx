import type { ReactNode } from 'react'
import { Badge, Button, Layout, List, Space, Typography } from 'antd'
import { CalendarOutlined, HomeOutlined } from '@ant-design/icons'
import type { TabKey } from './config'

const { Content, Header, Sider } = Layout
const { Text } = Typography

interface MenuItem {
  key: TabKey
  label: string
  icon: ReactNode
}

interface WorkbenchShellProps {
  activeTab: TabKey
  badgeCounts?: Partial<Record<TabKey, number>>
  children: ReactNode
  menuItems: MenuItem[]
  onRefresh: () => void
  onTabChange: (tab: TabKey) => void
}

export function WorkbenchShell({
  activeTab,
  badgeCounts = {},
  children,
  menuItems,
  onRefresh,
  onTabChange,
}: WorkbenchShellProps) {
  return (
    <Layout className="service-shell">
      <Sider width={232} theme="light">
        <div
          style={{
            height: 78,
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            borderBottom: '1px solid #eadcc7',
            background: 'linear-gradient(135deg, rgba(255,253,248,.92), rgba(248,240,228,.72))',
          }}
        >
          <Space>
            <span style={{ display: 'inline-grid', width: 36, height: 36, placeItems: 'center', borderRadius: 16, background: '#214332', color: '#f3c17c', fontWeight: 900 }}>
              R
            </span>
            <span>
              <Text strong style={{ display: 'block', color: '#17221b' }}>锐联仓储</Text>
              <Text style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', color: '#a4662c' }}>RecoLink</Text>
            </span>
          </Space>
        </div>
        <div style={{ padding: 16 }}>
          <List
            size="small"
            dataSource={menuItems}
            renderItem={(item) => (
              <List.Item
                className="service-nav-item"
                style={{
                  border: 0,
                  padding: '11px 12px',
                  borderRadius: 14,
                  cursor: 'pointer',
                  marginBottom: 6,
                  background: activeTab === item.key ? '#214332' : 'transparent',
                  color: activeTab === item.key ? '#fffaf1' : '#5f6b61',
                }}
                onClick={() => onTabChange(item.key)}
              >
                <Space>
                  {item.icon}
                  <Text style={{ color: activeTab === item.key ? '#fffaf1' : '#5f6b61', fontWeight: 650 }}>
                    {item.label}
                    {!!badgeCounts[item.key] && <Badge count={badgeCounts[item.key]} style={{ marginLeft: 8 }} />}
                  </Text>
                </Space>
              </List.Item>
            )}
          />
        </div>
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            height: 64,
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <Text strong style={{ display: 'block', color: '#17221b', fontSize: 16 }}>仓储方工作台</Text>
            <Text style={{ color: '#7a847a', fontSize: 12 }}>仓库资源、出入库、库存快照与物流履约协同</Text>
          </div>
          <Space>
            <Button icon={<CalendarOutlined />} onClick={onRefresh}>
              刷新
            </Button>
            <Button icon={<HomeOutlined />} href="/">
              买家首页
            </Button>
          </Space>
        </Header>
        <Content className="service-content" style={{ padding: 24 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
