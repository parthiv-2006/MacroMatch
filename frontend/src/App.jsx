import { useState } from 'react'
import {Routes, Route} from 'react-router-dom'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CreateIngredient from './pages/CreateIngredient'
import Generator from './pages/Generator'

import ProtectedRoute from './components/ProtectedRoute'

import { AuthProvider } from './context/AuthContext'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {

  return (
    <AuthProvider>
      <div>
        <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path='/' element={<Dashboard />}/>
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path='/new-ingredient' element={<CreateIngredient />}/>
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path='/generate' element={<Generator />}/>
            </Route>
            <Route path='/login' element={<Login />}/>
            <Route path='/register' element={<Register />}/>
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </AuthProvider>
  )
}

export default App
