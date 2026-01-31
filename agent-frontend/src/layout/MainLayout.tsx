import React from 'react';
import ChatInterface from '../pages/ChatInterface';

const MainLayout: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 40px)',
        height: '100%',
        position: 'relative',
        flex: 1,
      }}
    >
      <ChatInterface />
    </div>
  );
};

export default MainLayout;
