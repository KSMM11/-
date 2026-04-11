import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ParentDashboard from './pages/ParentDashboard';
import StudentDashboard from './pages/StudentDashboard';
import { useStore, Role } from './store/store';

const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole?: Role }) => {
  const { currentUser } = useStore();
  
  if (!currentUser) return <Navigate to="/" replace />;
  if (allowedRole && currentUser.role !== allowedRole) {
    if (currentUser.role === 'admin') return <Navigate to="/admin" replace />;
    if (currentUser.role === 'parent') return <Navigate to="/parent" replace />;
    if (currentUser.role === 'student') return <Navigate to="/student" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<Layout />}>
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/parent" 
            element={
              <ProtectedRoute allowedRole="parent">
                <ParentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student" 
            element={
              <ProtectedRoute allowedRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
