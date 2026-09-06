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

interface AuthContextType {
  user: User | null;
  school: School | null;
  schools: School[];
  loading: boolean;
  login: (schoolCode: string, email: string, password: string) => Promise<void>;
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

  const login = async (schoolCode: string, email: string, password: string) => {
    ApiClient.setTenantCode(schoolCode);
    const res = await ApiClient.post<{ token: string; user: User; school: School }>('/auth/login', {
      schoolCode,
      email,
      password,
    });

    ApiClient.setToken(res.token);
    setUser(res.user);
    setSchool(res.school);
    localStorage.setItem('schoolmate_user', JSON.stringify(res.user));
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

      await login(newSchool.code, email, 'password123');
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
        login,
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
