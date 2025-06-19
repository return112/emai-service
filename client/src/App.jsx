import React from 'react'
import Login from './components/Login'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import './App.css'
import Register from './components/Register'
import Homepage from './components/Homepage'

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      <BrowserRouter>
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  )
}

export default App
