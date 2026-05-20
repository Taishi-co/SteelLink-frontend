import type { ReactNode } from 'react'
import { Badge, Layout, Menu, Typography } from 'antd'
import { ArrowRightOutlined, AuditOutlined, HomeOutlined } from '@ant-design/icons'
import type { MenuGroupKey, TabKey } from './config'

const { Content, Sider } = Layout
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
    <Layout className="dashboard-shell service-shell">
      <Sider
        width={220}
        className="dashboard-sider"
        style={{ position: 'fixed', inset: '0 auto 0 0', overflow: 'auto' }}
        trigger={null}
      >
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <div className="dashboard-brand">
            <div className="dashboard-brand-row">
              <div className="dashboard-brand-mark">R</div>
              <div>
                <div className="dashboard-brand-title">锐联产业协同平台</div>
                <div className="dashboard-brand-subtitle">RecoLink Workbench</div>
              </div>
            </div>
          </div>
          <div className="dashboard-account-card">
            <div className="dashboard-account-eyebrow">当前工作台</div>
            <div className="dashboard-account-title">资金服务商</div>
            <div className="dashboard-account-desc">金融产品、风控审批、债务合同、放款与质押监控</div>
          </div>
          <nav className="dashboard-sidebar-nav">
            {menuGroups.map((group) => {
              const groupItems = menuItems.filter((item) => item.group === group.key)
              if (groupItems.length === 0) return null
              return (
                <div key={group.key}>
                  <div className="dashboard-sidebar-section">{group.label}</div>
                  <Menu
                    mode="inline"
                    selectedKeys={[activeTab]}
                    onClick={({ key }) => onTabChange(key as TabKey)}
                    items={groupItems.map((item) => ({
                      key: item.key,
                      icon: item.icon,
                      label: (
                        <span>
                          {item.label}
                          {!!badgeCounts[item.key] && (
                            <Badge count={badgeCounts[item.key]} style={{ marginLeft: 8 }} />
                          )}
                        </span>
                      ),
                    }))}
                    className="dashboard-menu"
                    style={{ border: 0, background: 'transparent' }}
                  />
                </div>
              )
            })}
          </nav>
          <div className="dashboard-sidebar-links">
            <div className="dashboard-quick-link" onClick={onRefresh}>
              <AuditOutlined style={{ color: '#2f6b49' }} />
              <span style={{ flex: 1, fontSize: 12, fontWeight: 650 }}>刷新当前页</span>
            </div>
            <a
              href={
                import.meta.env.DEV
                  ? `${window.location.protocol || 'http:'}//${window.location.hostname || 'localhost'}:5173/dashboard`
                  : '/dashboard'
              }
            >
              <div className="dashboard-quick-link">
                <HomeOutlined style={{ color: '#2f6b49' }} />
                <span style={{ flex: 1, fontSize: 12, fontWeight: 650 }}>返回买家工作台</span>
                <ArrowRightOutlined style={{ color: '#a4662c', fontSize: 10 }} />
              </div>
            </a>
          </div>
        </div>
      </Sider>
      <Layout style={{ marginLeft: 220 }}>
        <Content className="dashboard-content service-content">
          <div className="dashboard-workbench-header">
            <Text strong style={{ display: 'block', color: '#17221b', fontSize: 20 }}>工作台</Text>
            <Text type="secondary">资金服务商，欢迎回来！</Text>
          </div>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
