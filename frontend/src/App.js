import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { SidebarProvider } from './context/SidebarContext';
import { ChatProvider } from './context/ChatContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import FloatingMenuButton from './components/FloatingMenuButton';
import FloatingChat from './components/FloatingChat';
import MainLayout from './components/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Books from './pages/Books';
import Games from './pages/Games';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BookDetail from './pages/BookDetail';
import GameDetail from './pages/GameDetail';
import AdminPanel from './pages/AdminPanel';
import Settings from './pages/Settings';
import Favorites from './pages/Favorites';
import SubmitContent from './pages/SubmitContent';
import UserNotifications from './pages/UserNotifications';
import MyContent from './pages/MyContent';

import ProtectedRoute from './components/ProtectedRoute';
import './styles/App.css';
import './styles/theme.css';
import './styles/sidebar.css';
import './styles/floating-menu.css';
import './styles/UploadToggle.css';
import './styles/floating-chat.css';
import './styles/form-components.css';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <FavoritesProvider>
            <SidebarProvider>
              <Router>
                <ChatProvider>
              <div className="App">
                <Navbar />
                <Sidebar />
                <FloatingMenuButton />
                <FloatingChat />
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/books" element={<Books />} />
                    <Route path="/books/:id" element={<BookDetail />} />
                    <Route path="/games" element={<Games />} />
                    <Route path="/games/:id" element={<GameDetail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/submit" element={<SubmitContent />} />
                    <Route path="/notifications" element={<UserNotifications />} />
                    <Route path="/my-content" element={<MyContent />} />

                    <Route 
                      path="/admin" 
                      element={
                        <ProtectedRoute>
                          <AdminPanel />
                        </ProtectedRoute>
                      } 
                    />
                  </Routes>
                </MainLayout>
              </div>
                </ChatProvider>
              </Router>
            </SidebarProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;