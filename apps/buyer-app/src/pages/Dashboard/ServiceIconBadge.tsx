import { DollarOutlined } from '@ant-design/icons'
import { getServiceDefinition, serviceIconMap, type ServiceKey } from './serviceAccess'

export default function ServiceIconBadge({ serviceKey }: { serviceKey: ServiceKey }) {
  const service = getServiceDefinition(serviceKey)
  const Icon = service ? serviceIconMap[service.iconType] : DollarOutlined

  return (
    <span
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white"
      style={{ backgroundColor: service?.color || '#2563eb' }}
    >
      <Icon />
    </span>
  )
}
