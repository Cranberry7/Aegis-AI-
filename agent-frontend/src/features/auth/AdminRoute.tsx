import { useAuth } from '../../hooks/useAuth';
import React from 'react';
import { IChildren } from '../../types/global';
import MainLoader from '../../components/MainLoader';
import { RoleCodes } from '../../enums/global.enum';
import Unauthorised from '@/pages/Unauthorised';

const AdminRoute: React.FC<IChildren> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <MainLoader />;

  const isAdmin =
    user?.role?.code == RoleCodes.ADMIN ||
    user?.role?.code == RoleCodes.SUPERADMIN;
  if (!isAdmin) {
    return <Unauthorised />;
  }
  return children;
};

export default AdminRoute;
