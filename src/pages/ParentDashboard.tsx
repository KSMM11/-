import React, { useState } from 'react';
import { useStore } from '../store/store';
import { BookOpen, CreditCard, CheckCircle, AlertCircle, User as UserIcon } from 'lucide-react';

export default function ParentDashboard() {
  const { currentUser, users, lessons, payments } = useStore();
  const [activeTab, setActiveTab] = useState<'lessons' | 'payments'>('lessons');

  if (!currentUser || currentUser.role !== 'parent') return null;

  const linkedStudent = users.find(u => u.id === currentUser.linkedStudentId);
  const studentLessons = lessons.filter(l => l.studentId === currentUser.linkedStudentId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const myPayments = payments.filter(p => p.parentId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2">환영합니다, {currentUser.name} 학부모님</h2>
        <p className="text-slate-600">
          {linkedStudent ? (
            <span><strong className="text-indigo-600">{linkedStudent.name}</strong> 학생의 학습 현황과 결제 내역을 확인할 수 있습니다.</span>
          ) : (
            <span className="text-red-500">아직 연결된 학생 계정이 없습니다. 선생님께 문의해주세요.</span>
          )}
        </p>
      </div>

      {linkedStudent && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <UserIcon className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">기본 정보</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h4 className="font-bold text-indigo-600 mb-3">학생 정보</h4>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between"><span className="text-slate-500">이름</span> <span className="font-medium text-slate-900">{linkedStudent.name}</span></p>
                  <p className="flex justify-between"><span className="text-slate-500">학교</span> <span className="font-medium text-slate-900">{linkedStudent.school || '-'}</span></p>
                  <p className="flex justify-between"><span className="text-slate-500">연락처</span> <span className="font-medium text-slate-900">{linkedStudent.phone || '-'}</span></p>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h4 className="font-bold text-emerald-600 mb-3">학부모 정보 (나)</h4>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between"><span className="text-slate-500">이름</span> <span className="font-medium text-slate-900">{currentUser.name}</span></p>
                  <p className="flex justify-between"><span className="text-slate-500">연락처</span> <span className="font-medium text-slate-900">{currentUser.phone || '-'}</span></p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-1 bg-slate-200 p-1 rounded-xl max-w-xs">
            <button
              onClick={() => setActiveTab('lessons')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'lessons' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              학습 현황
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'payments' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              결제 내역
              {myPayments.some(p => p.status === 'pending') && (
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
              )}
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            {activeTab === 'lessons' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 mb-4">최근 수업 기록</h3>
                {studentLessons.map(lesson => (
                  <div key={lesson.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-medium text-slate-500">{lesson.date}</span>
                      <span className="badge badge-neutral">{lesson.lessonCount}회차</span>
                    </div>
                    <div className="mb-3">
                      <h4 className="text-sm font-bold text-slate-700 mb-1">진도</h4>
                      <p className="text-slate-900">{lesson.progress}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-white p-3 rounded border border-slate-100">
                        <span className="block font-bold text-indigo-600 mb-1">숙제</span>
                        <p className="text-slate-700">{lesson.homework}</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-slate-100">
                        <span className="block font-bold text-emerald-600 mb-1">선생님 피드백</span>
                        <p className="text-slate-700">{lesson.feedback}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {studentLessons.length === 0 && (
                  <div className="text-center py-8 text-slate-500">등록된 수업 기록이 없습니다.</div>
                )}
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 mb-4">수업료 결제 안내 및 내역</h3>
                
                {myPayments.filter(p => p.status === 'pending').map(payment => (
                  <div key={payment.id} className="bg-indigo-50 border border-indigo-100 rounded-lg p-5 mb-6">
                    <div className="flex items-center gap-2 text-indigo-800 font-bold mb-2">
                      <AlertCircle className="w-5 h-5" />
                      입금 요청 안내
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <span className="block text-sm text-indigo-600/80 mb-1">청구 금액</span>
                        <span className="text-xl font-bold text-indigo-900">{payment.amount.toLocaleString()}원</span>
                      </div>
                      <div>
                        <span className="block text-sm text-indigo-600/80 mb-1">입금 기한</span>
                        <span className="text-lg font-medium text-indigo-900">{payment.dueDate} 까지</span>
                      </div>
                      <div className="md:col-span-2 bg-white/60 p-3 rounded-md border border-indigo-100/50">
                        <span className="block text-sm text-indigo-600/80 mb-1">입금 계좌</span>
                        <span className="font-medium text-slate-800">{payment.accountInfo}</span>
                      </div>
                    </div>
                    <p className="text-xs text-indigo-600/70 mt-4">
                      * 입금 후 선생님이 확인하여 수동으로 결제 완료 처리됩니다.
                    </p>
                  </div>
                ))}

                <div className="mt-8">
                  <h4 className="text-md font-bold text-slate-800 mb-3">전체 결제 내역</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-sm text-slate-500">
                          <th className="py-3 px-4 font-medium">상태</th>
                          <th className="py-3 px-4 font-medium">금액</th>
                          <th className="py-3 px-4 font-medium">기한/완료일</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {myPayments.map(payment => (
                          <tr key={payment.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4">
                              {payment.status === 'completed' ? (
                                <span className="badge badge-success gap-1"><CheckCircle className="w-3 h-3" /> 결제완료</span>
                              ) : (
                                <span className="badge badge-pending">입금대기</span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-medium">{payment.amount.toLocaleString()}원</td>
                            <td className="py-3 px-4 text-slate-600">{payment.dueDate}</td>
                          </tr>
                        ))}
                        {myPayments.length === 0 && (
                          <tr>
                            <td colSpan={3} className="py-8 text-center text-slate-500">결제 내역이 없습니다.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
