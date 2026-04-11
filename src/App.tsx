import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ParentDashboard from './pages/ParentDashboard';
import StudentDashboard from './pages/StudentDashboard';
import { useStore, Role, User, Lesson, Payment } from './store/store';
import { db } from './firebase';
import { collection, onSnapshot, setDoc, doc, getDoc } from 'firebase/firestore';

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
  const { setUsers, setLessons, setPayments } = useStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Bootstrap default admin if not exists
    const bootstrapAdmin = async () => {
      try {
        const adminDoc = await getDoc(doc(db, 'users', 'admin'));
        if (!adminDoc.exists()) {
          await setDoc(doc(db, 'users', 'admin'), {
            id: 'admin',
            role: 'admin',
            name: '선생님',
            username: 'admin',
            password: '123',
            phone: '010-1234-5678'
          });
        }
      } catch (error) {
        console.error("Error bootstrapping admin:", error);
      }
    };

    bootstrapAdmin();

    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => doc.data() as User);
      setUsers(usersData);
    });

    const unsubscribeLessons = onSnapshot(collection(db, 'lessons'), (snapshot) => {
      const lessonsData = snapshot.docs.map(doc => doc.data() as Lesson);
      setLessons(lessonsData);
    });

    const unsubscribePayments = onSnapshot(collection(db, 'payments'), (snapshot) => {
      const paymentsData = snapshot.docs.map(doc => doc.data() as Payment);
      setPayments(paymentsData);
    });

    // Mark as ready after a short delay to allow initial data load
    setTimeout(() => setIsReady(true), 500);

    return () => {
      unsubscribeUsers();
      unsubscribeLessons();
      unsubscribePayments();
    };
  }, [setUsers, setLessons, setPayments]);

  if (!isReady) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">데이터를 불러오는 중입니다...</div>;
  }

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
