import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { bootstrapAuth } from './redux/authSlice';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import CurriculumPlayerPage from './pages/CurriculumPlayerPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookmarksPage from './pages/BookmarksPage';
import HistoryPage from './pages/HistoryPage';

export default function App() {
  const dispatch = useDispatch();
  
  useEffect(() => { dispatch(bootstrapAuth()); }, [dispatch]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Replace /courses with the new DashboardPage */}
        <Route path="/courses" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        
        {/* Masterclass specific route */}
        <Route path="/course/german/lesson/:id" element={<ProtectedRoute><CurriculumPlayerPage /></ProtectedRoute>} />
        
        {/* Legacy route fallback */}
        <Route path="/course/:id" element={<Navigate to="/courses" replace />} />
        
        <Route path="/bookmarks" element={<ProtectedRoute><BookmarksPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}
