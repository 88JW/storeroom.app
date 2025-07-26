import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import WelcomePageNew from './pages/WelcomePageNew';
import ProductListPage from './pages/ProductListPage';
import SpizarniaListPage from './pages/SpizarniaListPage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          {/* Publiczne trasy */}
          <Route path="/welcome" element={<WelcomePageNew />} />
          <Route path="/logowanie" element={<LoginPage />} />

          {/* Chronione trasy */}
          <Route 
            path="/spiżarnie" 
            element={
              <ProtectedRoute>
                <SpizarniaListPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lista" 
            element={
              <ProtectedRoute>
                <ProductListPage />
              </ProtectedRoute>
            } 
          />

          {/* Przekierowanie ze ścieżki głównej */}
          <Route path="/" element={<Navigate to="/welcome" replace />} />

          {/* Domyślna trasa dla nieznalezionych ścieżek */}
          <Route path="*" element={<div>Strona nie znaleziona</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  </StrictMode>
);
