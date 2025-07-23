import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage'; // Importujemy komponent strony logowania
import WelcomePageNew from './pages/WelcomePageNew'; // Importujemy nowy komponent strony powitalnej
// import WelcomePage from './pages/WelcomePage'; // Stary komponent strony powitalnej - można usunąć później
// import ListPage from './pages/ListPage'; // W przyszłości zaimportujemy stronę listy

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        {/* Trasa dla nowej strony powitalnej */}
        <Route path="/welcome" element={<WelcomePageNew />} />

        {/* Trasa dla strony logowania */}
        <Route path="/logowanie" element={<LoginPage />} />

        {/* Trasa dla strony listy */}
        {/* element={<ListPage />} */}
        <Route path="/lista" element={<div>Strona Listy</div>} />

        {/* Przekierowanie ze ścieżki głównej na stronę logowania */}
        <Route path="/" element={<Navigate to="/logowanie" replace />} />

        {/* Domyślna trasa dla nieznalezionych ścieżek */}
        <Route path="*" element={<div>Strona nie znaleziona</div>} />
      </Routes>
    </Router>
  </StrictMode>
);
