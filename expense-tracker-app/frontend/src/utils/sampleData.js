/**
 * Sample data utility for testing the expense tracker
 */

export const sampleExpenses = [
  {
    id: 'sample-1',
    amount: 45.50,
    category: 'Food',
    description: 'Lunch at downtown cafe',
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  },
  {
    id: 'sample-2',
    amount: 85.00,
    category: 'Transport',
    description: 'Gas for weekly commute',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'sample-3',
    amount: 120.00,
    category: 'Shopping',
    description: 'New running shoes',
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'sample-4',
    amount: 25.75,
    category: 'Entertainment',
    description: 'Movie tickets',
    date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 259200000).toISOString()
  },
  {
    id: 'sample-5',
    amount: 67.30,
    category: 'Food',
    description: 'Grocery shopping',
    date: new Date(Date.now() - 345600000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 345600000).toISOString()
  },
  {
    id: 'sample-6',
    amount: 15.99,
    category: 'Entertainment',
    description: 'Netflix subscription',
    date: new Date(Date.now() - 432000000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 432000000).toISOString()
  },
  {
    id: 'sample-7',
    amount: 200.00,
    category: 'Bills',
    description: 'Monthly electricity bill',
    date: new Date(Date.now() - 518400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 518400000).toISOString()
  }
];

export const sampleCategories = [
  {
    id: 'cat-1',
    name: 'Food',
    icon: 'Coffee',
    color: 'text-orange-500 bg-orange-100',
    isCustom: false
  },
  {
    id: 'cat-2',
    name: 'Transport',
    icon: 'Car',
    color: 'text-blue-500 bg-blue-100',
    isCustom: false
  },
  {
    id: 'cat-3',
    name: 'Entertainment',
    icon: 'Gamepad2',
    color: 'text-purple-500 bg-purple-100',
    isCustom: false
  },
  {
    id: 'cat-4',
    name: 'Bills',
    icon: 'Home',
    color: 'text-green-500 bg-green-100',
    isCustom: false
  },
  {
    id: 'cat-5',
    name: 'Shopping',
    icon: 'ShoppingBag',
    color: 'text-pink-500 bg-pink-100',
    isCustom: false
  },
  {
    id: 'cat-6',
    name: 'Health',
    icon: 'Heart',
    color: 'text-red-500 bg-red-100',
    isCustom: false
  }
];

/**
 * Load sample data into the application
 * @param {Object} actions - Actions from useApp context
 */
export const loadSampleData = async (actions) => {
  try {
    // Add sample expenses
    for (const expense of sampleExpenses) {
      await actions.addExpense(expense);
    }
    
    console.log('Sample data loaded successfully!');
    return true;
  } catch (error) {
    console.error('Error loading sample data:', error);
    return false;
  }
};

/**
 * Clear all data from the application
 * @param {Object} state - State from useApp context
 * @param {Object} actions - Actions from useApp context
 */
export const clearAllData = async (state, actions) => {
  try {
    // Delete all expenses
    for (const expense of state.expenses || []) {
      await actions.deleteExpense(expense.id);
    }
    
    // Delete custom categories (keep default ones)
    for (const category of state.categories || []) {
      if (category.isCustom) {
        await actions.deleteCategory(category.id);
      }
    }
    
    console.log('All data cleared successfully!');
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};
