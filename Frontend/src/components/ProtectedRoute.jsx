import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children, allowedRoles }) {
  const userString = sessionStorage.getItem('user')
  if (!userString) {
    return <Navigate to="/login" replace />
  }

  const user = JSON.parse(userString)

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />
    }
  }

  return children
}

export default ProtectedRoute
