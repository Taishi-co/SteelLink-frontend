import { Layout } from 'antd'
import { Link } from 'react-router-dom'

const { Footer: AntFooter } = Layout

export default function Footer() {
  return (
    <AntFooter className="bg-gray-100 text-center py-6">
      <div className="text-gray-500">
        <p className="mb-2">
          <Link to="/" className="text-gray-600 hover:text-primary-600 mx-2">首页</Link>
          <Link to="/products" className="text-gray-600 hover:text-primary-600 mx-2">商品列表</Link>
          <Link to="/cart" className="text-gray-600 hover:text-primary-600 mx-2">购物车</Link>
        </p>
        <p>© 2024 SteelLink. B2B钢材交易平台</p>
      </div>
    </AntFooter>
  )
}
