import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { bootstrapAuth } from './redux/authSlice';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CoursePlayerPage from './pages/CoursePlayerPage';

export default function App() {
  const dispatch = useDispatch();
  
  useEffect(() => { dispatch(bootstrapAuth()); }, [dispatch]);

  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Authenticated Platform Routes */}
        <Route path="/explore" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/course/:category" element={<ProtectedRoute><CoursePlayerPage /></ProtectedRoute>} />
        
        {/* Fallbacks */}
        <Route path="/feed" element={<Navigate to="/explore" replace />} />
        <Route path="/courses" element={<Navigate to="/explore" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
