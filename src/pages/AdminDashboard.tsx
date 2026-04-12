import React, { useState } from 'react';
import { useStore, User } from '../store/store';
import { Users, FileText, CreditCard, Plus, Trash2, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'users' | 'lessons' | 'payments'>('users');
  const { users, lessons, payments } = useStore();

  const studentsCount = users.filter(u => u.role === 'student').length;
  const lessonsCount = lessons.length;
  const pendingPaymentsCount = payments.filter(p => p.status === 'pending').length;

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">전체 원생</p>
            <p className="text-2xl font-bold text-slate-900">{studentsCount}명</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">누적 수업일지</p>
            <p className="text-2xl font-bold text-slate-900">{lessonsCount}건</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">미납 건수</p>
            <p className="text-2xl font-bold text-slate-900">{pendingPaymentsCount}건</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 text-sm font-bold rounded-t-xl transition-colors ${
            activeTab === 'users' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          계정 관리
        </button>
        <button
          onClick={() => setActiveTab('lessons')}
          className={`px-6 py-3 text-sm font-bold rounded-t-xl transition-colors ${
            activeTab === 'lessons' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          수업 일지 관리
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-6 py-3 text-sm font-bold rounded-t-xl transition-colors ${
            activeTab === 'payments' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          결제 관리
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 min-h-[500px]">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'lessons' && <LessonManagement />}
        {activeTab === 'payments' && <PaymentManagement />}
      </div>
    </div>
  );
}

function UserManagement() {
  const { currentUser, users, addUser, updateUser, deleteUser } = useStore();
  const [teacherName, setTeacherName] = useState(currentUser?.name || '');
  
  const [formData, setFormData] = useState({
    role: 'student' as 'student' | 'parent',
    name: '',
    username: '',
    password: '',
    phone: '',
    school: '',
    linkedId: '',
  });

  const handleUpdateTeacher = () => {
    if (currentUser) {
      updateUser(currentUser.id, { name: teacherName });
      alert('선생님 이름이 변경되었습니다.');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const userData: any = {
      role: formData.role,
      name: formData.name,
      username: formData.username,
      password: formData.password,
      phone: formData.phone,
    };

    if (formData.role === 'student') {
      if (formData.linkedId) userData.linkedParentId = formData.linkedId;
      if (formData.school) userData.school = formData.school;
    } else if (formData.role === 'parent') {
      if (formData.linkedId) userData.linkedStudentId = formData.linkedId;
    }

    // Remove any undefined or empty string values to prevent Firestore errors
    Object.keys(userData).forEach(key => {
      if (userData[key] === undefined || userData[key] === '') {
        delete userData[key];
      }
    });

    const newId = await addUser(userData);
    
    // 양방향 연결
    if (formData.role === 'student' && formData.linkedId) {
      await updateUser(formData.linkedId, { linkedStudentId: newId });
    } else if (formData.role === 'parent' && formData.linkedId) {
      await updateUser(formData.linkedId, { linkedParentId: newId });
    }

    setFormData({ role: 'student', name: '', username: '', password: '', phone: '', school: '', linkedId: '' });
    alert('계정이 생성되었습니다.');
  };

  const handleLink = async (studentId: string, parentId: string) => {
    await updateUser(studentId, { linkedParentId: parentId });
    await updateUser(parentId, { linkedStudentId: studentId });
    alert('계정이 연결되었습니다.');
  };

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`${user.name} ${user.role === 'student' ? '학생' : '학부모'} 계정을 삭제하시겠습니까?`)) {
      if (user.role === 'student' && user.linkedParentId) {
        await updateUser(user.linkedParentId, { linkedStudentId: '' });
      } else if (user.role === 'parent' && user.linkedStudentId) {
        await updateUser(user.linkedStudentId, { linkedParentId: '' });
      }
      await deleteUser(user.id);
      alert('삭제되었습니다.');
    }
  };

  const students = users.filter(u => u.role === 'student');
  const parents = users.filter(u => u.role === 'parent');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Left Column: Forms */}
      <div className="space-y-10">
        <section>
          <h3 className="text-lg font-bold text-slate-900 mb-4">내 정보 설정</h3>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">화면에 표시될 선생님 이름</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={teacherName}
                onChange={e => setTeacherName(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
              <button onClick={handleUpdateTeacher} className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors">
                변경
              </button>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold text-slate-900 mb-4">새 계정 생성</h3>
          <form onSubmit={handleAddUser} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">계정 유형</label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as any, linkedId: '' })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
              >
                <option value="student">학생 계정</option>
                <option value="parent">학부모 계정</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">이름</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="예: 홍길동"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">로그인 아이디</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                placeholder="예: student1"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">초기 비밀번호</label>
              <input
                type="text"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="예: 1234"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">전화번호</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="010-0000-0000"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            {formData.role === 'student' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">학교 (선택)</label>
                <input
                  type="text"
                  value={formData.school}
                  onChange={e => setFormData({ ...formData, school: e.target.value })}
                  placeholder="예: 서울고등학교"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {formData.role === 'student' ? '연결할 학부모 (선택)' : '연결할 학생 (선택)'}
              </label>
              <select
                value={formData.linkedId}
                onChange={e => setFormData({ ...formData, linkedId: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
              >
                <option value="">선택 안함</option>
                {formData.role === 'student'
                  ? users.filter(u => u.role === 'parent').map(p => <option key={p.id} value={p.id}>{p.name}</option>)
                  : users.filter(u => u.role === 'student').map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                }
              </select>
            </div>
            <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              계정 만들기
            </button>
          </form>
        </section>
      </div>

      {/* Right Column: List */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-6">등록된 계정 현황</h3>
        {users.filter(u => u.role !== 'admin').length === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
            생성된 학생/학부모 계정이 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {users.filter(u => u.role !== 'admin').map(user => {
              const linkedUser = user.role === 'student' 
                ? users.find(u => u.id === user.linkedParentId)
                : users.find(u => u.id === user.linkedStudentId);

              return (
                <div key={user.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${user.role === 'student' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {user.role === 'student' ? '학생' : '학부모'}
                      </span>
                      <span className="font-bold text-slate-900">{user.name}</span>
                    </div>
                    <p className="text-sm text-slate-500">ID: {user.username}</p>
                    <div className="text-xs text-slate-400 mt-1 flex gap-2">
                      {user.phone && <span>📞 {user.phone}</span>}
                      {user.school && <span>🏫 {user.school}</span>}
                    </div>
                    {linkedUser ? (
                      <p className="text-xs text-indigo-600 mt-1">
                        연결됨: {linkedUser.name} {linkedUser.role === 'student' ? '학생' : '학부모'}
                      </p>
                    ) : (
                      <div className="mt-2">
                        <select
                          onChange={(e) => {
                            if (user.role === 'student') handleLink(user.id, e.target.value);
                            else handleLink(e.target.value, user.id);
                          }}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-indigo-500"
                          defaultValue=""
                        >
                          <option value="" disabled>{user.role === 'student' ? '학부모 연결하기' : '학생 연결하기'}</option>
                          {user.role === 'student'
                            ? parents.filter(p => !p.linkedStudentId).map(p => <option key={p.id} value={p.id}>{p.name} 학부모</option>)
                            : students.filter(s => !s.linkedParentId).map(s => <option key={s.id} value={s.id}>{s.name} 학생</option>)
                          }
                        </select>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteUser(user)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="계정 삭제"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function LessonManagement() {
  const { users, lessons, addLesson } = useStore();
  const students = users.filter(u => u.role === 'student');
  
  const [formData, setFormData] = useState({
    studentId: '',
    date: '',
    lessonCount: '',
    progress: '',
    homework: '',
    feedback: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLesson({
      studentId: formData.studentId,
      date: formData.date,
      lessonCount: Number(formData.lessonCount),
      progress: formData.progress,
      homework: formData.homework,
      feedback: formData.feedback,
    });
    setFormData({ ...formData, progress: '', homework: '', feedback: '', lessonCount: String(Number(formData.lessonCount) + 1) });
    alert('일지가 등록되었습니다.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Left Column: Form */}
      <section>
        <h3 className="text-lg font-bold text-slate-900 mb-6">새 수업 일지 등록</h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">학생 선택</label>
            <select
              required
              value={formData.studentId}
              onChange={e => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
            >
              <option value="">학생을 지목하세요</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">수업 날짜</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">회차</label>
            <input
              type="number"
              required
              min="1"
              value={formData.lessonCount}
              onChange={e => setFormData({ ...formData, lessonCount: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">진도</label>
            <input
              type="text"
              required
              value={formData.progress}
              onChange={e => setFormData({ ...formData, progress: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">숙제</label>
            <textarea
              required
              rows={3}
              value={formData.homework}
              onChange={e => setFormData({ ...formData, homework: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">피드백</label>
            <textarea
              required
              rows={3}
              value={formData.feedback}
              onChange={e => setFormData({ ...formData, feedback: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>
          <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            일지 등록하기
          </button>
        </form>
      </section>

      {/* Right Column: List */}
      <section>
        <h3 className="text-lg font-bold text-slate-900 mb-6">최근 등록된 일지</h3>
        {lessons.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
            등록된 수업 일지가 없습니다.
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(lesson => {
              const student = students.find(s => s.id === lesson.studentId);
              return (
                <div key={lesson.id} className="p-5 border border-slate-100 rounded-2xl hover:shadow-md transition-shadow bg-white">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{student?.name}</span>
                      <span className="text-sm text-slate-500">{lesson.date}</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">{lesson.lessonCount}회차</span>
                  </div>
                  <p className="text-sm font-medium text-indigo-600 mb-2">{lesson.progress}</p>
                  <p className="text-sm text-slate-600 line-clamp-2">{lesson.feedback}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function PaymentManagement() {
  const { users, payments, addPayment, confirmPayment } = useStore();
  const parents = users.filter(u => u.role === 'parent');
  
  const [formData, setFormData] = useState({
    parentId: '',
    title: '',
    amount: '',
    dueDate: '',
    accountInfo: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPayment({
      parentId: formData.parentId,
      studentId: '', // Will be handled by relation if needed
      title: formData.title,
      amount: Number(formData.amount),
      dueDate: formData.dueDate,
      accountInfo: formData.accountInfo,
    });
    setFormData({ ...formData, title: '', amount: '' });
    alert('입금 안내문이 생성되었습니다.');
  };

  const handleConfirmPayment = (id: string) => {
    if (window.confirm('입금 확인 처리하시겠습니까?')) {
      confirmPayment(id);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Left Column: Form */}
      <section>
        <h3 className="text-lg font-bold text-slate-900 mb-6">결제(입금) 요청하기</h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">작성 대상 (학부모)</label>
            <select
              required
              value={formData.parentId}
              onChange={e => setFormData({ ...formData, parentId: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
            >
              <option value="">학부모를 지목하세요</option>
              {parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">안내 제목</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="예: 5월 수학 정규 수업료"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">청구 금액 (원)</label>
            <input
              type="number"
              required
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">기한/날짜</label>
            <input
              type="date"
              required
              value={formData.dueDate}
              onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">입금 계좌</label>
            <input
              type="text"
              required
              value={formData.accountInfo}
              onChange={e => setFormData({ ...formData, accountInfo: e.target.value })}
              placeholder="카카오뱅크 3333-01-xxxxxx 김선생"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            입금 안내문 생성
          </button>
        </form>
      </section>

      {/* Right Column: List */}
      <section>
        <h3 className="text-lg font-bold text-slate-900 mb-6">결제 현황</h3>
        {payments.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
            등록된 결제 요청이 없습니다.
          </div>
        ) : (
          <div className="space-y-4">
            {payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(payment => {
              const parent = parents.find(p => p.id === payment.parentId);
              return (
                <div key={payment.id} className="p-5 border border-slate-100 rounded-2xl hover:shadow-md transition-shadow bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-slate-900">{payment.title}</h4>
                      <p className="text-sm text-slate-500">{parent?.name} 학부모님</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${payment.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {payment.status === 'completed' ? '결제완료' : '입금대기'}
                      </span>
                      {payment.status === 'pending' && (
                        <button
                          onClick={() => handleConfirmPayment(payment.id)}
                          className="text-xs font-medium bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-md hover:bg-indigo-100 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          입금 확인
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <p className="text-sm text-slate-500">기한: {payment.dueDate}</p>
                    <p className="font-bold text-indigo-600 text-lg">{payment.amount.toLocaleString()}원</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
