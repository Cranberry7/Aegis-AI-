import '@fontsource/roboto/300.css';
import React, { useEffect } from 'react';
import './app.scss';
import HomeLayout from './layout/HomeLayout';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ProtectedRoute from './features/auth/ProtectedRoute';
import AppDrawer from './components/AppDrawer';
import AppBar from './components/AppBar';
import { useAuth } from './hooks/useAuth';
import MainLoader from './components/MainLoader';
import MainLayout from './layout/MainLayout';
import UploadInterface from './pages/UploadInterface';
import DocumentHistory from './pages/DocumentHistory';
import { ThemeProvider } from '@/components/theme-provider';
import { SidebarProvider } from './components/ui/sidebar';
import { Settings } from './components/Settings';
import ManageUsers from './pages/ManageUsers';
import Conversations from './pages/Conversations';
import { NavigationRoutes } from './enums/global.enum';
import { ReadOnlyConversations } from './components/ReadOnlyConversations';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import PageNotFound from './pages/PageNotFound';
import AdminRoute from './features/auth/AdminRoute';
import ReferencePage from './pages/ReferencePage';
import { useStore } from './store/global';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const showSettings = useStore((state) => state.showSettings);

  // Need for settings Dialog component to close
  useEffect(() => {
    if (!showSettings) {
      document.body.style.pointerEvents = '';
    }
  }, [showSettings]);

  return (
    <LayoutGroup>
      <AnimatePresence mode="wait">
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          {loading ? (
            <MainLoader />
          ) : (
            <Router>
              <SidebarProvider>
                <div className="flex h-screen relative w-screen">
                  {user?.isEmailVerified &&
                    !location.pathname.includes(
                      NavigationRoutes.REFERENCES,
                    ) && <AppDrawer />}

                  <div className="flex flex-col flex-1 relative">
                    {!location.pathname.includes(
                      NavigationRoutes.REFERENCES,
                    ) && <AppBar />}

                    <div className="flex-1 relative">
                      <Routes>
                        <Route
                          path={NavigationRoutes.LOGIN}
                          element={<HomeLayout />}
                        />

                        {/* Protected routes */}
                        <Route
                          path="/"
                          element={
                            <ProtectedRoute>
                              <MainLayout />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path={NavigationRoutes.TRAIN}
                          element={
                            <ProtectedRoute>
                              <AdminRoute>
                                <UploadInterface />
                              </AdminRoute>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path={NavigationRoutes.HISTORY}
                          element={
                            <ProtectedRoute>
                              <AdminRoute>
                                <DocumentHistory />
                              </AdminRoute>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path={NavigationRoutes.USERS}
                          element={
                            <ProtectedRoute>
                              <AdminRoute>
                                <ManageUsers />
                              </AdminRoute>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path={NavigationRoutes.CONVERSATIONS}
                          element={
                            <ProtectedRoute>
                              <AdminRoute>
                                <Conversations />
                              </AdminRoute>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path={`${NavigationRoutes.CONVERSATIONS}/:sessionId`}
                          element={
                            <ProtectedRoute>
                              <AdminRoute>
                                <ReadOnlyConversations />
                              </AdminRoute>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path={NavigationRoutes.REFERENCES}
                          element={
                            <ProtectedRoute>
                              <ReferencePage />
                            </ProtectedRoute>
                          }
                        />
                        <Route path="*" element={<PageNotFound />} />
                      </Routes>
                    </div>
                  </div>
                  {showSettings && <Settings />}
                </div>
              </SidebarProvider>
            </Router>
          )}
        </ThemeProvider>
      </AnimatePresence>
    </LayoutGroup>
  );
};

export default App;
