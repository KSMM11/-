import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { BookOpen, User, KeyRound } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, currentUser } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') navigate('/admin');
      else if (currentUser.role === 'parent') navigate('/parent');
      else if (currentUser.role === 'student') navigate('/student');
    }
  }, [currentUser, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (!success) {
      setError('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-sm sm:rounded-2xl border border-slate-100">
          <div className="flex flex-col items-center mb-10">
            <BookOpen className="w-12 h-12 text-indigo-600 mb-4" strokeWidth={1.5} />
            <h2 className="text-3xl font-bold text-indigo-600 tracking-tight mb-2">
              TutorSpace
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              학습의 모든 순간을 함께합니다
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all"
                  placeholder="아이디"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all"
                  placeholder="비밀번호"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center font-medium">
                {error}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                로그인
              </button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center">
            <p className="text-xs text-slate-500 mb-3">테스트 계정 안내 (pw: 123)</p>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">admin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
