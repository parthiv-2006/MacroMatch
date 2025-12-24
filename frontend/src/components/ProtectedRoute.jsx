import { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import AuthContext from '../context/AuthContext'

export default function ProtectedRoute() {
  const { user } = useContext(AuthContext)
  const token = user?.token

  if (!token) return <Navigate to="/login" replace />
  return <Outlet />
}