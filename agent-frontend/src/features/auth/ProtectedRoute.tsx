import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import React from 'react';
import { IChildren } from '../../types/global';
import MainLoader from '../../components/MainLoader';

const ProtectedRoute: React.FC<IChildren> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <MainLoader />;

  if (!user?.id) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
