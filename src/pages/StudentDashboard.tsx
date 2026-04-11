import React from 'react';
import { useStore } from '../store/store';
import { BookOpen, User as UserIcon } from 'lucide-react';

export default function StudentDashboard() {
  const { currentUser, users, lessons } = useStore();

  if (!currentUser || currentUser.role !== 'student') return null;

  const linkedParent = users.find(u => u.id === currentUser.linkedParentId);
  const myLessons = lessons.filter(l => l.studentId === currentUser.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2">환영합니다, {currentUser.name} 학생</h2>
        <p className="text-slate-600">
          나의 학습 진도와 숙제, 선생님의 피드백을 확인할 수 있습니다.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <UserIcon className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-slate-900">기본 정보</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <h4 className="font-bold text-indigo-600 mb-3">학생 정보 (나)</h4>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between"><span className="text-slate-500">이름</span> <span className="font-medium text-slate-900">{currentUser.name}</span></p>
              <p className="flex justify-between"><span className="text-slate-500">학교</span> <span className="font-medium text-slate-900">{currentUser.school || '-'}</span></p>
              <p className="flex justify-between"><span className="text-slate-500">연락처</span> <span className="font-medium text-slate-900">{currentUser.phone || '-'}</span></p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <h4 className="font-bold text-emerald-600 mb-3">학부모 정보</h4>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between"><span className="text-slate-500">이름</span> <span className="font-medium text-slate-900">{linkedParent?.name || '-'}</span></p>
              <p className="flex justify-between"><span className="text-slate-500">연락처</span> <span className="font-medium text-slate-900">{linkedParent?.phone || '-'}</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-slate-900">나의 학습 기록</h3>
        </div>

        <div className="space-y-4">
          {myLessons.map(lesson => (
            <div key={lesson.id} className="bg-slate-50 border border-slate-200 rounded-lg p-5 hover:border-indigo-200 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">{lesson.date}</span>
                <span className="badge badge-neutral">{lesson.lessonCount}회차</span>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-bold text-slate-700 mb-1">오늘의 진도</h4>
                <p className="text-lg font-medium text-slate-900">{lesson.progress}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
                  <span className="block font-bold text-indigo-600 mb-2 text-base">📝 숙제</span>
                  <p className="text-slate-700 leading-relaxed">{lesson.homework}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-emerald-100 shadow-sm">
                  <span className="block font-bold text-emerald-600 mb-2 text-base">💡 선생님 피드백</span>
                  <p className="text-slate-700 leading-relaxed">{lesson.feedback}</p>
                </div>
              </div>
            </div>
          ))}
          {myLessons.length === 0 && (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
              아직 등록된 수업 기록이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
