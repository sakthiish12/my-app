'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs';

interface AuthContextType {
  user: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    isSignedIn: boolean;
  } | null;
  isLoaded: boolean;
  isSignedIn: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoaded: false,
  isSignedIn: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useClerkAuth();

  const authUser = user 
    ? {
        id: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.emailAddresses[0]?.emailAddress || '',
        isSignedIn: !!isSignedIn,
      }
    : null;

  const value = {
    user: authUser,
    isLoaded,
    isSignedIn: !!isSignedIn,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 