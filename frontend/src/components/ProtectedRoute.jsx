import { useAuth } from './useAuth'
import { Navigate } from 'react-router-dom'

const demoLoginStorageKey = 'circlos_home_mock_login'

export default function ProtectedRoute({ children }) {
  const { user } = useAuth()

  const isDemoLoggedIn =
    typeof window !== 'undefined' && window.localStorage.getItem(demoLoginStorageKey) === 'true'

  if (!user && !isDemoLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return children
}