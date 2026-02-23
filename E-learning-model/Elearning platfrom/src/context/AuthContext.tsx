import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCallback, useMemo } from 'react';
import * as authAPI from '@/api/auth';

export interface User {
  [x: string]: string | number | undefined;
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: 'Admin' | 'Instructor' | 'Student';
  avatar?: string;
  profilePhotoUrl?: string;
  bio?: string;
  company?: string;
  address?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  departmentId?: number;
  department?: string;
  enrollmentDate?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword: string, role: string, departmentId?: number, profileData?: {
    bio?: string;
    address?: string;
    dateOfBirth?: string;
    company?: string;
    profileImage?: File;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      const { token, refreshToken, user: userData } = response;

      if (!userData) {
        throw new Error('No user data returned from server');
      }

      const userObj: User = {
        id: userData.id || '',
        name: userData.name || userData.userName || undefined,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: (userData.role as 'Admin' | 'Instructor' | 'Student') || 'Student',
        profilePhotoUrl: userData.profilePhotoUrl,
        bio: userData.bio,
        company: userData.company,
        address: userData.address,
        dateOfBirth: userData.dateOfBirth,
        phoneNumber: userData.phoneNumber,
        departmentId: userData.departmentId,
        department: userData.department,
        enrollmentDate: userData.enrollmentDate,
        avatar: undefined,
      };

      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Login failed. Please check your credentials.';
      throw new Error(errorMessage);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, confirmPassword: string, role: string, departmentId?: number, profileData?: {
    bio?: string;
    address?: string;
    dateOfBirth?: string;
    company?: string;
    profileImage?: File;
  }) => {
    try {
      const response = await authAPI.register({
        email,
        password,
        confirmPassword,
        userName: name,
        role: role as 'Student' | 'Instructor' | 'Admin',
        departmentId: departmentId || null,
        bio: profileData?.bio,
        address: profileData?.address,
        dateOfBirth: profileData?.dateOfBirth,
        company: profileData?.company,
        profileImage: profileData?.profileImage,
      });

      const { token, refreshToken, user: userData } = response;

      if (!userData) {
        throw new Error('No user data returned from server');
      }

      const userObj: User = {
        id: userData.id || '',
        name: userData.name || userData.userName || undefined,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: (userData.role as 'Admin' | 'Instructor' | 'Student') || 'Student',
        profilePhotoUrl: userData.profilePhotoUrl,
        bio: userData.bio,
        company: userData.company,
        address: userData.address,
        dateOfBirth: userData.dateOfBirth,
        phoneNumber: userData.phoneNumber,
        departmentId: userData.departmentId,
        department: userData.department,
        enrollmentDate: userData.enrollmentDate,
        avatar: undefined,
      };

      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);
    } catch (error: unknown) {
      console.error('Register error:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Registration failed.';
      throw new Error(errorMessage);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authAPI.getMe();

      const userObj: User = {
        id: userData.id || '',
        name: userData.name,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: (userData.role as 'Admin' | 'Instructor' | 'Student') || 'Student',
        profilePhotoUrl: userData.profilePhotoUrl,
        bio: userData.bio,
        company: userData.company,
        address: userData.address,
        dateOfBirth: userData.dateOfBirth,
        phoneNumber: userData.phoneNumber,
        departmentId: userData.departmentId,
        department: userData.department,
        enrollmentDate: userData.enrollmentDate,
        avatar: undefined,
      };

      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      throw error;
    }
  }, []);

  const value: AuthContextType = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    refreshUser,
  }), [user, loading, login, register, logout, refreshUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
