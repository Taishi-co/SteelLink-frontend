import { Navigate } from 'react-router-dom'
import { useUserStore } from '@/stores'

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useUserStore()

  if (!isLoggedIn) {
    const currentPath = window.location.pathname + window.location.search
    return <Navigate to={`/login?redirect=${encodeURIComponent(currentPath)}`} replace />
  }

  return <>{children}</>
}
