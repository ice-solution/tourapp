import { Navigate, useParams } from 'react-router-dom'
import { useEventUserAuth } from '../context/EventUserAuthContext.jsx'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

const ProtectedEventRoute = ({ children }) => {
  const { eventId } = useParams()
  const { isAuthenticated, loading } = useEventUserAuth()

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={`/${eventId}/login`} replace />
  }

  return children
}

export default ProtectedEventRoute

