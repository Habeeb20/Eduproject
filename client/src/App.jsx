import React from 'react'
import { BrowserRouter, Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'sonner';
import SignupPage from './pages/auth/Signup';
import LoginPage from './pages/auth/Login';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import Navbar from './components/Navbar';
const App = () => {
  return (
    <>
      <div className="min-h-screen ">
        <Toaster richColors position="top-right" />
        <Navbar />
        
        <Routes>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
  
          <Route path="/dashboard" element={<DashboardLayout />} />
 

          <Route path="*" element={<Navigate to="/signup" replace />} />
        </Routes>
      </div>
    </>
  )
}

export default App