import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiClient } from '../services/api';

export interface School {
  id: string;
  name: string;
  code: string;
  tagline?: string;
  logoUrl?: string;
  accentColor?: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  phone?: string;
  school?: School;
}

export interface SchoolRegistrationData {
  name: string;
  code: string;
  adminFirstName: string;
  adminLastName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  tagline?: string;
}

export interface TeacherRegistrationData {
  schoolCode: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export type AuthModalMode = 'login' | 'register-teacher' | 'register-school';

interface AuthContextType {
  user: User | null;
  school: School | null;
  schools: School[];
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  openAuthModal: (mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  login: (emailOrCode: string, passwordOrEmail: string, optionalPassword?: string) => Promise<any>;
  registerSchool: (data: SchoolRegistrationData) => Promise<void>;
  registerTeacher: (data: TeacherRegistrationData) => Promise<void>;
  logout: () => void;
  switchSchool: (school: School) => Promise<void>;
  selectSchoolTenant: (code: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  // Global Auth Modal controls
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login');

  const openAuthModal = (mode: AuthModalMode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Fetch all schools for tenant switcher
  const fetchSchools = async () => {
    try {
      const list = await ApiClient.get<School[]>('/schools');
      setSchools(list);
      return list;
    } catch (err) {
      console.error('Failed to load schools:', err);
      return [];
    }
  };

  // Check existing session
  const initializeAuth = async () => {
    try {
      const allSchools = await fetchSchools();
      const token = localStorage.getItem('schoolmate_token');
      const savedTenantCode = localStorage.getItem('schoolmate_tenant_code') || 'OAKRIDGE';

      const initialSchool = allSchools.find(
        (s) => s.code.toUpperCase() === savedTenantCode.toUpperCase()
      ) || allSchools[0];

      if (initialSchool) {
        setSchool(initialSchool);
        ApiClient.setTenantCode(initialSchool.code);
      }

      if (token) {
        try {
          const profile = await ApiClient.get<User>('/auth/me');
          setUser(profile);
          if (profile.school) {
            setSchool(profile.school);
            ApiClient.setTenantCode(profile.school.code);
          }
        } catch {
          ApiClient.clearAuth();
          setUser(null);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();

    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  /**
   * Universal Login supporting both:
   * 1. Modern: login(email, password, optionalSchoolCode)
   * 2. Legacy: login(schoolCode, email, password)
   */
  const login = async (
    arg1: string,
    arg2: string,
    arg3?: string
  ) => {
    let email = '';
    let password = '';
    let schoolCode: string | undefined = undefined;

    // Check whether arg1 is an email or schoolCode
    if (arg1.includes('@')) {
      email = arg1;
      password = arg2;
      schoolCode = arg3;
    } else {
      schoolCode = arg1;
      email = arg2;
      password = arg3 || '';
    }

    if (schoolCode) {
      ApiClient.setTenantCode(schoolCode);
    }

    const res = await ApiClient.post<{
      token?: string;
      user?: User;
      school?: School;
      requiresSchoolSelection?: boolean;
      schools?: any[];
      message?: string;
    }>('/auth/login', {
      email,
      password,
      schoolCode,
    });

    if (res.requiresSchoolSelection) {
      return {
        requiresSchoolSelection: true,
        schools: res.schools || [],
        message: res.message,
      };
    }

    if (res.token && res.user && res.school) {
      ApiClient.setToken(res.token);
      ApiClient.setTenantCode(res.school.code);
      setUser(res.user);
      setSchool(res.school);
      localStorage.setItem('schoolmate_user', JSON.stringify(res.user));
      setIsAuthModalOpen(false);
    }
  };

  /**
   * Register a New School Institution
   */
  const registerSchool = async (data: SchoolRegistrationData) => {
    const res = await ApiClient.post<{ token: string; user: User; school: School }>(
      '/auth/register-school',
      data
    );

    ApiClient.setToken(res.token);
    ApiClient.setTenantCode(res.school.code);
    setUser(res.user);
    setSchool(res.school);
    localStorage.setItem('schoolmate_user', JSON.stringify(res.user));
    await fetchSchools();
    setIsAuthModalOpen(false);
  };

  /**
   * Register a Teacher Under an Existing School
   */
  const registerTeacher = async (data: TeacherRegistrationData) => {
    const res = await ApiClient.post<{ token: string; user: User; school: School }>(
      '/auth/register-teacher',
      data
    );

    ApiClient.setToken(res.token);
    ApiClient.setTenantCode(res.school.code);
    setUser(res.user);
    setSchool(res.school);
    localStorage.setItem('schoolmate_user', JSON.stringify(res.user));
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    ApiClient.clearAuth();
    setUser(null);
  };

  const selectSchoolTenant = (code: string) => {
    ApiClient.setTenantCode(code);
    const found = schools.find((s) => s.code.toUpperCase() === code.toUpperCase());
    if (found) setSchool(found);
  };

  const switchSchool = async (newSchool: School) => {
    ApiClient.setTenantCode(newSchool.code);
    setSchool(newSchool);
    // Auto login demo teacher for instant seamless switching if user is demoing
    try {
      const email =
        newSchool.code === 'OAKRIDGE'
          ? 'sarah.jenkins@oakridge.edu'
          : 'robert.vance@stjude.edu';

      await login(email, 'password123', newSchool.code);
    } catch (err) {
      console.warn('Auto switch login fallback to login screen', err);
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        school,
        schools,
        loading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        registerSchool,
        registerTeacher,
        logout,
        switchSchool,
        selectSchoolTenant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
