import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserPreferences {
  theme: 'dark' | 'light';
  recentSearches: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  preferences: UserPreferences;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1' || 
   window.location.hostname === '[::1]');

export const API_BASE = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:5001/api' : '');

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if token exists in localStorage (or sessionStorage)
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      // Update theme on HTML tag
      const userTheme = parsedUser.preferences?.theme || 'dark';
      document.documentElement.classList.toggle('dark', userTheme === 'dark');
      document.documentElement.setAttribute('data-theme', userTheme);
    }
    setLoading(false);
  }, []);

  const clearError = () => setError(null);

  const signIn = async (email: string, password: string, rememberMe: boolean) => {
    setError(null);
    setLoading(true);
    try {
      if (!API_BASE) {
        throw new Error('Offline mode: No backend server configured.');
      }
      const response = await fetch(`${API_BASE}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to sign in');
      }

      const userTheme = data.user.preferences?.theme || 'light';
      document.documentElement.classList.toggle('dark', userTheme === 'dark');
      document.documentElement.setAttribute('data-theme', userTheme);

      setUser(data.user);
      setToken(data.token);

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', data.token);
      storage.setItem('user', JSON.stringify(data.user));
    } catch (err: any) {
      console.warn('Backend authentication failed, falling back to local database:', err);
      const localUsersStr = localStorage.getItem('mock_users') || '[]';
      const localUsers = JSON.parse(localUsersStr);
      const matchedUser = localUsers.find((u: any) => u.email === email && u.password === password);
      
      if (matchedUser) {
        const loggedInUser = {
          id: matchedUser.id,
          name: matchedUser.name,
          email: matchedUser.email,
          preferences: matchedUser.preferences || { theme: 'light', recentSearches: [] }
        };
        setUser(loggedInUser);
        setToken('mock-jwt-token');
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', 'mock-jwt-token');
        storage.setItem('user', JSON.stringify(loggedInUser));
      } else {
        const errMsg = err.message || 'Invalid credentials';
        setError(errMsg);
        throw new Error(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      if (!API_BASE) {
        throw new Error('Offline mode: No backend server configured.');
      }
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setUser(data.user);
      setToken(data.token);

      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
    } catch (err: any) {
      console.warn('Backend signup failed, falling back to local database:', err);
      const localUsersStr = localStorage.getItem('mock_users') || '[]';
      const localUsers = JSON.parse(localUsersStr);
      
      if (localUsers.some((u: any) => u.email === email)) {
        const errExist = 'Email already registered';
        setError(errExist);
        throw new Error(errExist);
      }

      const newUser = {
        id: Math.random().toString(36).substring(2, 9),
        name,
        email,
        password,
        preferences: { theme: 'light', recentSearches: [] }
      };
      
      localUsers.push(newUser);
      localStorage.setItem('mock_users', JSON.stringify(localUsers));

      const loggedInUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        preferences: newUser.preferences
      };

      setUser(loggedInUser);
      setToken('mock-jwt-token');
      sessionStorage.setItem('token', 'mock-jwt-token');
      sessionStorage.setItem('user', JSON.stringify(loggedInUser));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  };

  const updatePreferences = async (newPrefs: Partial<UserPreferences>) => {
    if (!token || !user) return;
    
    try {
      const updatedPrefs = { ...user.preferences, ...newPrefs };
      const updatedUser = { ...user, preferences: updatedPrefs };
      setUser(updatedUser);

      const isPersistent = localStorage.getItem('token') !== null;
      const storage = isPersistent ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(updatedUser));

      if (token === 'mock-jwt-token') {
        const localUsersStr = localStorage.getItem('mock_users') || '[]';
        const localUsers = JSON.parse(localUsersStr);
        const userIndex = localUsers.findIndex((u: any) => u.email === user.email);
        if (userIndex !== -1) {
          localUsers[userIndex].preferences = updatedPrefs;
          localStorage.setItem('mock_users', JSON.stringify(localUsers));
        }
      }

      if (newPrefs.theme) {
        document.documentElement.classList.toggle('dark', newPrefs.theme === 'dark');
        document.documentElement.setAttribute('data-theme', newPrefs.theme);
      }

      if (API_BASE && token !== 'mock-jwt-token') {
        await fetch(`${API_BASE}/auth/preferences`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ preferences: updatedPrefs })
        });
      }
    } catch (err: any) {
      console.error('Failed to save preferences:', err);
    }
  };

  const forgotPassword = async (email: string): Promise<string> => {
    try {
      if (!API_BASE) {
        throw new Error('Offline mode: No backend server configured.');
      }
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email');
      }
      return data.message;
    } catch (err: any) {
      console.warn('Backend forgot password failed, falling back to local database check:', err);
      const localUsersStr = localStorage.getItem('mock_users') || '[]';
      const localUsers = JSON.parse(localUsersStr);
      const matchedUser = localUsers.find((u: any) => u.email === email);
      if (matchedUser) {
        return `A password reset link would be sent to ${email} (Offline fallback mode: Account exists).`;
      } else {
        throw new Error('Email address not registered.');
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        error,
        signIn,
        signUp,
        logout,
        updatePreferences,
        forgotPassword,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
