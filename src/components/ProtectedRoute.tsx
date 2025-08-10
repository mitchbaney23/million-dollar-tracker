import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from './Login';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { currentUser } = useAuth();

  return currentUser ? <>{children}</> : <Login />;
}