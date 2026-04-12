import { create } from 'zustand';
import { db } from '../firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

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
  
  // Setters for syncing from Firestore
  setUsers: (users: User[]) => void;
  setLessons: (lessons: Lesson[]) => void;
  setPayments: (payments: Payment[]) => void;
  
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  
  addUser: (user: Omit<User, 'id'>) => Promise<string>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  
  addLesson: (lesson: Omit<Lesson, 'id'>) => Promise<void>;
  updateLesson: (id: string, lesson: Partial<Lesson>) => Promise<void>;
  deleteLesson: (id: string) => Promise<void>;
  
  addPayment: (payment: Omit<Payment, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  confirmPayment: (id: string) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  currentUser: null,
  users: [],
  lessons: [],
  payments: [],

  setUsers: (users) => {
    set({ users });
    // Update currentUser if it exists in the new users list
    const current = get().currentUser;
    if (current) {
      const updatedCurrent = users.find(u => u.id === current.id);
      if (updatedCurrent) {
        set({ currentUser: updatedCurrent });
      } else {
        set({ currentUser: null });
      }
    }
  },
  setLessons: (lessons) => set({ lessons }),
  setPayments: (payments) => set({ payments }),

  login: (username, password) => {
    const user = get().users.find(u => u.username === username && u.password === password);
    if (user) {
      set({ currentUser: user });
      return true;
    }
    return false;
  },
  logout: () => set({ currentUser: null }),

  addUser: async (userData) => {
    const newRef = doc(collection(db, 'users'));
    const newUser = { ...userData, id: newRef.id };
    Object.keys(newUser).forEach(key => {
      if ((newUser as any)[key] === undefined) {
        delete (newUser as any)[key];
      }
    });
    await setDoc(newRef, newUser);
    return newRef.id;
  },
  updateUser: async (id, userData) => {
    const ref = doc(db, 'users', id);
    const updateData = { ...userData };
    Object.keys(updateData).forEach(key => {
      if ((updateData as any)[key] === undefined) {
        delete (updateData as any)[key];
      }
    });
    await updateDoc(ref, updateData);
  },
  deleteUser: async (id) => {
    await deleteDoc(doc(db, 'users', id));
  },

  addLesson: async (lessonData) => {
    const newRef = doc(collection(db, 'lessons'));
    const newLesson = { ...lessonData, id: newRef.id };
    Object.keys(newLesson).forEach(key => {
      if ((newLesson as any)[key] === undefined) {
        delete (newLesson as any)[key];
      }
    });
    await setDoc(newRef, newLesson);
  },
  updateLesson: async (id, lessonData) => {
    const ref = doc(db, 'lessons', id);
    const updateData = { ...lessonData };
    Object.keys(updateData).forEach(key => {
      if ((updateData as any)[key] === undefined) {
        delete (updateData as any)[key];
      }
    });
    await updateDoc(ref, updateData);
  },
  deleteLesson: async (id) => {
    await deleteDoc(doc(db, 'lessons', id));
  },

  addPayment: async (paymentData) => {
    const newRef = doc(collection(db, 'payments'));
    const newPayment = { 
      ...paymentData, 
      id: newRef.id, 
      status: 'pending' as const, 
      createdAt: new Date().toISOString() 
    };
    Object.keys(newPayment).forEach(key => {
      if ((newPayment as any)[key] === undefined) {
        delete (newPayment as any)[key];
      }
    });
    await setDoc(newRef, newPayment);
  },
  confirmPayment: async (id) => {
    const ref = doc(db, 'payments', id);
    await updateDoc(ref, { status: 'completed' });
  },
  deletePayment: async (id) => {
    await deleteDoc(doc(db, 'payments', id));
  },
}));
