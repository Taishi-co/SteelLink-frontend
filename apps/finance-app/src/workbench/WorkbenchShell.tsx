import type { ReactNode } from 'react'
import { Badge, Button, Layout, List, Space, Typography } from 'antd'
import { AuditOutlined, HomeOutlined } from '@ant-design/icons'
import type { MenuGroupKey, TabKey } from './config'

const { Content, Header, Sider } = Layout
const { Text } = Typography

interface MenuItem {
  key: TabKey
  label: string
  icon: ReactNode
  group: MenuGroupKey
}

interface MenuGroup {
  key: MenuGroupKey
  label: string
}

interface WorkbenchShellProps {
  activeTab: TabKey
  badgeCounts?: Partial<Record<TabKey, number>>
  children: ReactNode
  menuGroups: MenuGroup[]
  menuItems: MenuItem[]
  onRefresh: () => void
  onTabChange: (tab: TabKey) => void
}

export function WorkbenchShell({
  activeTab,
  badgeCounts = {},
  children,
  menuGroups,
  menuItems,
  onRefresh,
  onTabChange,
}: WorkbenchShellProps) {
  return (
    <Layout className="service-shell">
      <Sider width={232} theme="light">
        <div style={{ height: 78, display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid #eadcc7', background: 'linear-gradient(135deg, rgba(255,253,248,.92), rgba(248,240,228,.72))' }}>
          <Space>
            <span style={{ display: 'inline-grid', width: 36, height: 36, placeItems: 'center', borderRadius: 16, background: '#214332', color: '#f3c17c', fontWeight: 900 }}>R</span>
            <span>
              <Text strong style={{ display: 'block', color: '#17221b' }}>锐联资金</Text>
              <Text style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', color: '#a4662c' }}>RecoLink</Text>
            </span>
          </Space>
        </div>
        <div style={{ padding: 16 }}>
          <div className="space-y-2">
            {menuGroups.map((group, index) => (
              <div key={group.key}>
                {index > 0 && <div className="border-t border-slate-200 my-2" />}
                <div className="px-3 py-2">
                  <Text className="text-xs font-medium text-slate-500">{group.label}</Text>
                </div>
                {menuItems.filter((item) => item.group === group.key).map((item) => (
                  <List.Item
                    key={item.key}
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
                ))}
              </div>
            ))}
          </div>
        </div>
      </Sider>
      <Layout>
        <Header style={{ background: 'rgba(255,253,248,.92)', height: 64, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Text strong style={{ display: 'block', color: '#17221b', fontSize: 16 }}>资金服务方工作台</Text>
            <Text style={{ color: '#7a847a', fontSize: 12 }}>金融产品、风控审批、债务合同、放款与质押监控</Text>
          </div>
          <Space>
            <Button icon={<AuditOutlined />} onClick={onRefresh}>
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
