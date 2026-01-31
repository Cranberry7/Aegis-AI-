import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './context/AuthProvider.tsx';
import { SnackbarProvider } from 'notistack';
import { SessionProvider } from './context/SessionProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <SessionProvider>
    <AuthProvider>
      <SnackbarProvider maxSnack={3}>
        <App />
      </SnackbarProvider>
    </AuthProvider>
  </SessionProvider>,
);
