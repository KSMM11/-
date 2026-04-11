import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { LogOut, BookOpen } from 'lucide-react';

export default function Layout() {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <header className="bg-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          <div className="flex items-center gap-2 text-indigo-600">
            <BookOpen className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">TutorSpace</h1>
          </div>
          
          {currentUser && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                  {currentUser.role === 'admin' ? '선생님' : currentUser.role === 'parent' ? '학부모' : '학생'}
                </span>
                <span className="font-bold text-slate-900">{currentUser.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>로그아웃</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <Outlet />
      </main>
    </div>
  );
}
