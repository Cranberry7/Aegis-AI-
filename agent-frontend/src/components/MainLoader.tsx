import React from 'react';
import AnimatedLogo from './AnimatedLogo';
import { useTheme } from './theme-provider';
const MainLoader: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div
      className="h-screen w-screen flex justify-center items-center bg-background"
      style={{
        background: theme === 'dark' ? '#000' : '#fff',
      }}
    >
      <div className="aspect-square h-[80vh]">
        <AnimatedLogo />
      </div>
    </div>
  );
};

export default MainLoader;
