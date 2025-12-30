import { Routes, Route } from 'react-router-dom'

import Login from './pages/Login'
import Register from './pages/Register'
import DashboardPage from './pages/DashboardPage'
import GeneratorPage from './pages/GeneratorPage'
import History from './pages/History'
import Recipes from './pages/Recipes'
import AnalyticsDashboard from './pages/AnalyticsDashboard'

import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/AppShell'

import { AuthProvider } from './context/AuthContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path='/' element={<DashboardPage />} />
            <Route path='/dashboard' element={<AnalyticsDashboard />} />
            <Route path='/generate' element={<GeneratorPage />} />
            <Route path='/history' element={<History />} />
            <Route path='/recipes' element={<Recipes />} />
          </Route>
        </Route>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Routes>
      <ToastContainer position='top-right' autoClose={3000} />
    </AuthProvider>
  )
}

export default App
