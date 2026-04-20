import { Card, Form, Input, Button, Upload, Avatar, message, Typography, Divider } from 'antd'
import { UserOutlined, UploadOutlined } from '@ant-design/icons'

const { Title } = Typography

export default function SettingsPage() {
  const [form] = Form.useForm()

  const handleSave = () => {
    form.validateFields().then(() => {
      message.success('店铺信息已保存')
    })
  }

  return (
    <div>
      <Title level={4} className="!mb-6">店铺设置</Title>

      <Card className="mb-6">
        <div className="flex items-center gap-6 mb-6">
          <Avatar size={80} icon={<UserOutlined />} className="bg-primary-500" />
          <div>
            <Upload showUploadList={false}>
              <Button icon={<UploadOutlined />}>更换头像</Button>
            </Upload>
            <p className="text-gray-400 text-sm mt-2">支持 JPG、PNG 格式，大小不超过 2MB</p>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            shopName: '上海钢铁贸易有限公司',
            contact: '张经理',
            phone: '13800138000',
            email: 'contact@steeltrade.com',
            address: '上海市宝山区钢铁产业园A栋',
            description: '专业钢材供应商，主营热轧、冷轧、中厚板等各类钢材，品质保证，价格优惠。',
          }}
        >
          <Form.Item name="shopName" label="店铺名称" rules={[{ required: true }]}>
            <Input placeholder="请输入店铺名称" />
          </Form.Item>
          <Form.Item name="contact" label="联系人" rules={[{ required: true }]}>
            <Input placeholder="请输入联系人姓名" />
          </Form.Item>
          <Form.Item name="phone" label="联系电话" rules={[{ required: true }]}>
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item name="email" label="电子邮箱">
            <Input placeholder="请输入电子邮箱" />
          </Form.Item>
          <Form.Item name="address" label="经营地址" rules={[{ required: true }]}>
            <Input placeholder="请输入经营地址" />
          </Form.Item>
          <Form.Item name="description" label="店铺简介">
            <Input.TextArea rows={4} placeholder="请输入店铺简介" />
          </Form.Item>

          <Divider />

          <Button type="primary" onClick={handleSave}>
            保存修改
          </Button>
        </Form>
      </Card>

      <Card title="认证信息">
        <Form layout="vertical">
          <Form.Item label="营业执照">
            <Upload>
              <Button icon={<UploadOutlined />}>上传营业执照</Button>
            </Upload>
          </Form.Item>
          <Form.Item label="开户许可证">
            <Upload>
              <Button icon={<UploadOutlined />}>上传开户许可证</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
