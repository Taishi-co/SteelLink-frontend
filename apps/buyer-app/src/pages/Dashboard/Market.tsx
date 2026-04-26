import { Typography } from 'antd'

const { Title, Paragraph } = Typography

export default function MarketPage() {
  return (
    <div>
      <Title level={4}>钢材行情</Title>
      <Paragraph className="text-gray-400">
        实时钢材价格走势与市场行情分析，功能开发中...
      </Paragraph>
    </div>
  )
}
