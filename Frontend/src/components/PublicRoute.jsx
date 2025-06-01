import { Navigate } from 'react-router-dom'

function PublicRoute({ children }) {
  const user = sessionStorage.getItem('user')
  if (user) {
    return <Navigate to="/" replace />
  }
  return children
}

export default PublicRoute
