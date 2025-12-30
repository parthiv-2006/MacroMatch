import { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import AuthContext from '../context/AuthContext'
import LoadingScreen from './LoadingScreen'

export default function ProtectedRoute() {
  const { user, loading } = useContext(AuthContext)
  
  if (loading) {
    return <LoadingScreen message="Verifying session..." />
  }

  const token = user?.token

  if (!token) return <Navigate to="/login" replace />
  return <Outlet />
}