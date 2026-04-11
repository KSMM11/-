import { create } from 'zustand';

export type Role = 'admin' | 'parent' | 'student';

export interface User {
  id: string;
  role: Role;
  name: string;
  username: string;
  password?: string;
  linkedStudentId?: string; // For parents
  linkedParentId?: string; // For students
  phone?: string;
  school?: string;
}

export interface Lesson {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  homework: string;
  progress: string;
  feedback: string;
  lessonCount: number;
}

export interface Payment {
  id: string;
  parentId: string;
  studentId: string;
  title: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  accountInfo: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

interface StoreState {
  currentUser: User | null;
  users: User[];
  lessons: Lesson[];
  payments: Payment[];
  
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  
  addUser: (user: Omit<User, 'id'>) => string;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  addLesson: (lesson: Omit<Lesson, 'id'>) => void;
  updateLesson: (id: string, lesson: Partial<Lesson>) => void;
  deleteLesson: (id: string) => void;
  
  addPayment: (payment: Omit<Payment, 'id' | 'status' | 'createdAt'>) => void;
  confirmPayment: (id: string) => void;
  deletePayment: (id: string) => void;
}

const initialUsers: User[] = [
  { id: '1', role: 'admin', name: '선생님', username: 'admin', password: '123', phone: '010-1234-5678' },
];

const initialLessons: Lesson[] = [];

const initialPayments: Payment[] = [];

export const useStore = create<StoreState>((set, get) => ({
  currentUser: null,
  users: initialUsers,
  lessons: initialLessons,
  payments: initialPayments,

  login: (username, password) => {
    const user = get().users.find(u => u.username === username && u.password === password);
    if (user) {
      set({ currentUser: user });
      return true;
    }
    return false;
  },
  logout: () => set({ currentUser: null }),

  addUser: (userData) => {
    const newId = Date.now().toString();
    set(state => ({
      users: [...state.users, { ...userData, id: newId }]
    }));
    return newId;
  },
  updateUser: (id, userData) => set(state => {
    const updatedUsers = state.users.map(u => u.id === id ? { ...u, ...userData } : u);
    const isCurrentUser = state.currentUser?.id === id;
    return {
      users: updatedUsers,
      currentUser: isCurrentUser ? { ...state.currentUser!, ...userData } : state.currentUser
    };
  }),
  deleteUser: (id) => set(state => ({
    users: state.users.filter(u => u.id !== id)
  })),

  addLesson: (lessonData) => set(state => ({
    lessons: [...state.lessons, { ...lessonData, id: Date.now().toString() }]
  })),
  updateLesson: (id, lessonData) => set(state => ({
    lessons: state.lessons.map(l => l.id === id ? { ...l, ...lessonData } : l)
  })),
  deleteLesson: (id) => set(state => ({
    lessons: state.lessons.filter(l => l.id !== id)
  })),

  addPayment: (paymentData) => set(state => ({
    payments: [...state.payments, { ...paymentData, id: Date.now().toString(), status: 'pending', createdAt: new Date().toISOString() }]
  })),
  confirmPayment: (id) => set(state => ({
    payments: state.payments.map(p => p.id === id ? { ...p, status: 'completed' } : p)
  })),
  deletePayment: (id) => set(state => ({
    payments: state.payments.filter(p => p.id !== id)
  })),
}));
