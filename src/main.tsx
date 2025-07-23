import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// W przyszłości zaimportujemy tutaj nasze komponenty stron, np.:
// import LoginPage from './pages/LoginPage';
// import ListPage from './pages/ListPage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        {/* Trasa dla strony logowania */}
        {/* element={<LoginPage />} */}
        <Route path="/logowanie" element={<div>Strona Logowania</div>} />

        {/* Trasa dla strony listy */}
        {/* element={<ListPage />} */}
        <Route path="/lista" element={<div>Strona Listy</div>} />

        {/* Domyślna trasa lub przekierowanie */}
        {/* Możemy tutaj dodać np. przekierowanie na stronę logowania */}
        <Route path="*" element={<div>Strona nie znaleziona lub domyślna</div>} />
      </Routes>
    </Router>
  </StrictMode>
);
