import { Typography } from 'antd'

const { Title, Paragraph } = Typography

export default function LogisticsPage() {
  return (
    <div>
      <Title level={4}>仓储物流</Title>
      <Paragraph className="text-gray-400">
        仓库管理、库存查看与物流追踪，功能开发中...
      </Paragraph>
    </div>
  )
}
