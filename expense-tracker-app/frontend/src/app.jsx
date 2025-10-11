import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from './context/AppContext.jsx';
import ModernDashboard from './pages/ModernDashboard.jsx';
import ModernCategories from './pages/ModernCategories.jsx';
import ModernAnalytics from './pages/ModernAnalytics.jsx';
import AddExpense from './pages/AddExpense.jsx';
import Settings from './pages/Settings.jsx';
import './styles/tailwind.css';
import './styles/modern.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const navigate = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      {currentPage === 'dashboard' && <ModernDashboard onNavigate={navigate} />}
      {currentPage === 'categories' && <ModernCategories onNavigate={navigate} />}
      {currentPage === 'analytics' && <ModernAnalytics onNavigate={navigate} />}
      {currentPage === 'add-expense' && <AddExpense onNavigate={navigate} />}
      {currentPage === 'settings' && <Settings onNavigate={navigate} />}
    </>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
