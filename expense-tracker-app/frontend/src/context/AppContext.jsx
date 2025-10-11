import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { LocalStorageAdapter } from '../services/LocalStorageAdapter.js';
import { PREDEFINED_CATEGORIES } from '../models/Category.js';

const AppContext = createContext();

const initialState = {
  expenses: [],
  categories: [],
  filters: {
    categoryId: null,
    dateRange: null,
    searchQuery: ''
  },
  ui: {
    loading: false,
    error: null
  }
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, ui: { ...state.ui, loading: action.payload } };

    case 'SET_ERROR':
      return { ...state, ui: { ...state.ui, error: action.payload } };

    case 'LOAD_EXPENSES':
      return { ...state, expenses: action.payload };

    case 'ADD_EXPENSE':
      return { ...state, expenses: [action.payload, ...state.expenses] };

    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(e =>
          e.id === action.payload.id ? action.payload : e
        )
      };

    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(e => e.id !== action.payload)
      };

    case 'LOAD_CATEGORIES':
      return { ...state, categories: action.payload };

    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };

    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(c =>
          c.id === action.payload.id ? action.payload : c
        )
      };

    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(c => c.id !== action.payload)
      };

    case 'SET_FILTER':
      return {
        ...state,
        filters: { ...state.filters, [action.payload.key]: action.payload.value }
      };

    case 'CLEAR_FILTERS':
      return { ...state, filters: initialState.filters };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const storage = new LocalStorageAdapter();

  // Initialize categories on first load
  useEffect(() => {
    async function initializeCategories() {
      try {
        const categories = await storage.getCategories();
        if (categories.length === 0) {
          // First load - save predefined categories
          await storage.saveCategories(PREDEFINED_CATEGORIES);
          dispatch({ type: 'LOAD_CATEGORIES', payload: PREDEFINED_CATEGORIES });
        } else {
          dispatch({ type: 'LOAD_CATEGORIES', payload: categories });
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    }
    initializeCategories();
  }, []);

  // Load expenses on mount
  useEffect(() => {
    async function loadExpenses() {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const expenses = await storage.getAll();
        dispatch({ type: 'LOAD_EXPENSES', payload: expenses });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
    loadExpenses();
  }, []);

  const actions = {
    addExpense: async (expenseData) => {
      try {
        dispatch({ type: 'SET_ERROR', payload: null });
        const expense = await storage.create(expenseData);
        dispatch({ type: 'ADD_EXPENSE', payload: expense });
        return expense;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    updateExpense: async (id, updates) => {
      try {
        dispatch({ type: 'SET_ERROR', payload: null });
        const updated = await storage.update(id, updates);
        dispatch({ type: 'UPDATE_EXPENSE', payload: updated });
        return updated;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    deleteExpense: async (id) => {
      try {
        dispatch({ type: 'SET_ERROR', payload: null });
        await storage.delete(id);
        dispatch({ type: 'DELETE_EXPENSE', payload: id });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    addCategory: async (category) => {
      try {
        const categories = [...state.categories, category];
        await storage.saveCategories(categories);
        dispatch({ type: 'ADD_CATEGORY', payload: category });
        return category;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    updateCategory: async (id, updates) => {
      try {
        const updated = { ...state.categories.find(c => c.id === id), ...updates };
        const categories = state.categories.map(c => c.id === id ? updated : c);
        await storage.saveCategories(categories);
        dispatch({ type: 'UPDATE_CATEGORY', payload: updated });
        return updated;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    deleteCategory: async (id) => {
      try {
        const categories = state.categories.filter(c => c.id !== id);
        await storage.saveCategories(categories);
        dispatch({ type: 'DELETE_CATEGORY', payload: id });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    setFilter: (key, value) => {
      dispatch({ type: 'SET_FILTER', payload: { key, value } });
    },

    clearFilters: () => {
      dispatch({ type: 'CLEAR_FILTERS' });
    }
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
