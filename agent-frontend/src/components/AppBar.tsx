import React from 'react';
import ModeToggle from '../components/ModeToggle';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SidebarTrigger } from './ui/sidebar';
import { useAuth } from '@/hooks/useAuth';

const AppBar: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const setSearchParams = useSearchParams()[1];

  return (
    <div className="w-full border-b h-10 flex justify-between items-center">
      <div className="flex gap-3 items-center h-full px-2 ">
        {user.id && <SidebarTrigger className="cursor-pointer" />}
        <img
          src="/assets/sarvaha-banner-logo.svg"
          alt="Sarvaha Logo"
          className="h-6 w-auto cursor-pointer"
          onClick={() => {
            navigate('');
            setSearchParams(undefined);
          }}
        />
      </div>
      <div className="px-1 flex gap-2 items-center">
        <ModeToggle />
      </div>
    </div>
  );
};

export default AppBar;
