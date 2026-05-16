import { useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { useUserStore } from '@/stores'
import { certificationService } from '@/services/certificationService'
import { hasEnterpriseAccess } from '@/services/auth'

type Capability = 'sales' | 'procurement' | 'logistics' | 'warehouse' | 'finance'

interface DashboardAccessGateProps {
  children: React.ReactNode
  services?: Capability[]
}

export default function DashboardAccessGate({ children, services = [] }: DashboardAccessGateProps) {
  const user = useUserStore((state) => state.user)
  const isEnterprise = hasEnterpriseAccess(user)

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-access-services'],
    queryFn: () => certificationService.getMyServices(),
    enabled: isEnterprise,
    staleTime: 30_000,
  })

  const approvedServices = useMemo(() => {
    return new Set(
      (data?.data?.permissions ?? [])
        .filter((permission) => permission.status === 2)
        .map((permission) => permission.service),
    )
  }, [data?.data?.permissions])

  if (!isEnterprise) {
    return <Navigate to="/dashboard" replace />
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Spin />
      </div>
    )
  }

  if (services.length && !services.some((service) => approvedServices.has(service))) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
