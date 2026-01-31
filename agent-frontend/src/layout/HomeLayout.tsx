import React, { useEffect } from 'react';
import Login from '../pages/Login';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import AnimatedLogo from '@/components/AnimatedLogo';

const HomeLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user?.id) {
      navigate('/', { replace: true });
    }
  }, [user?.id, navigate, loading]);

  return (
    <div className="flex-1 w-screen">
      <div className="h-16" /> {/* Toolbar replacement */}
      <div className="flex justify-evenly">
        <div className="aspect-square h-[80vh]">
          <AnimatedLogo />
        </div>
        <Login />
      </div>
    </div>
  );
};

export default HomeLayout;
