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
import AddProductPage from './pages/AddProductPage';
import EditProductPage from './pages/EditProductPage';
import CreateSpizarniaPage from './pages/CreateSpizarniaPage';
import ManageLokalizacjePage from './pages/ManageLokalizacjePage';

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
          <Route 
            path="/dodaj-produkt" 
            element={
              <ProtectedRoute>
                <AddProductPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/edytuj-produkt" 
            element={
              <ProtectedRoute>
                <EditProductPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/nowa-spizarnia" 
            element={
              <ProtectedRoute>
                <CreateSpizarniaPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lokalizacje/:spizarniaId" 
            element={
              <ProtectedRoute>
                <ManageLokalizacjePage />
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
