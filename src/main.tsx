import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage'; // Importujemy komponent strony logowania
import WelcomePageNew from './pages/WelcomePageNew'; // Importujemy nowy komponent strony powitalnej
import ListPage from './pages/ListPage'; // Importujemy komponent strony listy produktów
// import WelcomePage from './pages/WelcomePage'; // Stary komponent strony powitalnej - można usunąć później

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        {/* Trasa dla nowej strony powitalnej */}
        <Route path="/welcome" element={<WelcomePageNew />} />

        {/* Trasa dla strony logowania */}
        <Route path="/logowanie" element={<LoginPage />} />

        {/* Trasa dla strony listy */}
        <Route path="/lista" element={<ListPage />} /> {/* Używamy komponentu ListPage */}

        {/* Przekierowanie ze ścieżki głównej na stronę logowania (jak ustaliliśmy tymczasowo) */}
        <Route path="/" element={<Navigate to="/logowanie" replace />} />

        {/* Domyślna trasa dla nieznalezionych ścieżek */}
        <Route path="*" element={<div>Strona nie znaleziona</div>} />
      </Routes>
    </Router>
  </StrictMode>
);
