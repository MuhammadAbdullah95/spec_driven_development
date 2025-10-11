import React from 'react';
import { CategoryManager } from '../components/CategoryManager.jsx';
import { useApp } from '../context/AppContext.jsx';

export function Categories({ onBack }) {
  const { state } = useApp();

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem'
    }}>
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <button
            onClick={onBack}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'white',
              color: '#007bff',
              border: '1px solid #007bff',
              borderRadius: '4px',
              fontSize: '0.95rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            ← Back to Dashboard
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>
            Categories
          </h1>
        </div>
        <p style={{ color: '#666' }}>
          Manage your expense categories - {state.categories.length} total ({state.categories.filter(c => c.type === 'custom').length} custom)
        </p>
      </header>

      <CategoryManager />
    </div>
  );
}
