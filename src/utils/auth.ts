// Auth utility functions for local storage and token management

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Save token and user data to local storage
export const saveAuthData = (token: string, user: User): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Get token from local storage
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Get user data from local storage
export const getUser = (): User | null => {
  const userData = localStorage.getItem(USER_KEY);
  if (!userData) return null;
  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Clear auth data from local storage
export const clearAuthData = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Mock authentication service
// TODO: Replace with actual API calls when backend is ready
export const authService = {
  // Mock login
  login: async (email: string, password: string): Promise<AuthResponse> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock validation
    if (!email || !password) {
      throw new Error('Email va parol kiritilishi shart');
    }

    // Mock token generation
    const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user: User = {
      id: `user_${Date.now()}`,
      email,
      name: email.split('@')[0],
    };

    return {
      token: mockToken,
      user,
    };
  },

  // Mock registration
  register: async (email: string, password: string): Promise<AuthResponse> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock validation
    if (!email || !password) {
      throw new Error('Email va parol kiritilishi shart');
    }

    if (password.length < 6) {
      throw new Error('Parol kamida 6 belgidan iborat bo\'lishi kerak');
    }

    // Mock token generation
    const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user: User = {
      id: `user_${Date.now()}`,
      email,
      name: email.split('@')[0],
    };

    return {
      token: mockToken,
      user,
    };
  },

  // Mock email confirmation
  confirmEmail: async (code: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock validation - accept any 6-digit code except test codes
    if (code === '111111' || code === '000000') {
      throw new Error('Неверный код');
    }

    if (code.length !== 6) {
      throw new Error('Код должен состоять из 6 цифр');
    }

    return true;
  },

  // Mock password creation
  createPassword: async (password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (!password || password.length < 6) {
      throw new Error('Parol kamida 6 belgidan iborat bo\'lishi kerak');
    }

    return true;
  },

  // Mock resend code
  resendCode: async (email: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (!email) {
      throw new Error('Email kiritilishi shart');
    }

    return true;
  },
};











