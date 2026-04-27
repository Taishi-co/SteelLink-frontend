import { Typography } from 'antd'

const { Title, Paragraph } = Typography

export default function FinancePage() {
  return (
    <div>
      <Title level={4}>凭单融资</Title>
      <Paragraph className="text-gray-400">
        订单融资、还款管理与资金流水，功能开发中...
      </Paragraph>
    </div>
  )
}
