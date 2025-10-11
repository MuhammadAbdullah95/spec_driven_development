import React, { useState, useEffect, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Plus,
  CreditCard,
  Target,
  PieChart
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import StatCard from '../components/features/StatCard';
import ExpenseList from '../components/features/ExpenseList';
import ExpenseForm from '../components/features/ExpenseForm';
import AIAssistant from '../components/features/AIAssistant';
import { SpendingChart, CategoryChart } from '../components/features/Charts';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useApp } from '../context/AppContext.jsx';
import { loadSampleData, clearAllData } from '../utils/sampleData.js';

const ModernDashboard = ({ onNavigate }) => {
  const { state, actions } = useApp();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // Calculate real-time statistics from actual data
  const stats = useMemo(() => {
    const expenses = state.expenses || [];
    const now = new Date();
    
    // Calculate total spending
    const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate this week's spending
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= weekAgo;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate this month's spending
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= monthStart;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate previous week for trend
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const previousWeek = expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= twoWeeksAgo && expenseDate < weekAgo;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate trends
    const weekTrend = previousWeek > 0 ? ((thisWeek - previousWeek) / previousWeek) * 100 : 0;
    
    return {
      totalSpending,
      thisWeek,
      thisMonth,
      expenseCount: expenses.length,
      weekTrend
    };
  }, [state.expenses]);

  const handleAddExpense = async (expenseData) => {
    try {
      await actions.addExpense(expenseData);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleDeleteExpense = async (expense) => {
    try {
      await actions.deleteExpense(expense.id);
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleEditExpense = async (expense, updatedData) => {
    try {
      await actions.updateExpense(expense.id, updatedData);
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  // Calculate category data from real expenses
  const getCategoryData = useMemo(() => {
    const expenses = state.expenses || [];
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount
    })).sort((a, b) => b.amount - a.amount);
  }, [state.expenses]);

  // Calculate spending data for chart from real expenses
  const getSpendingData = useMemo(() => {
    const expenses = state.expenses || [];
    const last7Days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.toDateString() === date.toDateString();
      });
      
      const total = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      last7Days.push({
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        amount: total
      });
    }
    return last7Days;
  }, [state.expenses]);

  const handleNavigation = (page) => {
    setCurrentPage(page);
    if (page === 'add-expense') {
      setShowExpenseForm(true);
      setCurrentPage('dashboard'); // Stay on dashboard but show form
    } else if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigation}>
      <div className="space-y-8 min-h-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-slate-600">
              Here's your financial overview for today
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowAIAssistant(true)}
              className="hidden lg:flex"
            >
              Ask AI Assistant
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowExpenseForm(true)}
              className="flex items-center gap-2"
            >
              <Plus size={20} />
              Add Expense
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Spending"
            amount={stats.totalSpending}
            icon={DollarSign}
            delay={0}
          />
          <StatCard
            title="This Week"
            amount={stats.thisWeek}
            icon={Calendar}
            trend={stats.weekTrend > 0 ? 'up' : stats.weekTrend < 0 ? 'down' : null}
            changePercentage={Math.abs(stats.weekTrend)}
            delay={100}
          />
          <StatCard
            title="This Month"
            amount={stats.thisMonth}
            icon={CreditCard}
            delay={200}
          />
          <StatCard
            title="Transactions"
            amount={stats.expenseCount}
            icon={Target}
            delay={300}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            <SpendingChart 
              data={getSpendingData}
              className="animate-fadeIn"
            />
            
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowExpenseForm(true)}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <Plus size={24} />
                  <span className="text-sm">Add Expense</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleNavigation('categories')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <PieChart size={24} />
                  <span className="text-sm">Categories</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleNavigation('analytics')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <TrendingUp size={24} />
                  <span className="text-sm">Analytics</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowAIAssistant(true)}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <DollarSign size={24} />
                  <span className="text-sm">AI Insights</span>
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column - Recent Expenses & Category Breakdown */}
          <div className="space-y-6">
            <ExpenseList
              expenses={(state.expenses || []).slice(0, 5)}
              onDelete={handleDeleteExpense}
              onEdit={handleEditExpense}
              className="animate-fadeIn"
            />
            
            <CategoryChart 
              data={getCategoryData}
              className="animate-fadeIn"
            />
          </div>
        </div>

        {/* Budget Overview */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Monthly Budget</h3>
            <span className="text-sm text-slate-500">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          
          {stats.thisMonth > 0 ? (
            (() => {
              const savedSettings = localStorage.getItem('expenseTrackerSettings');
              const settings = savedSettings ? JSON.parse(savedSettings) : { monthlyBudget: 1500 };
              const monthlyBudget = settings.monthlyBudget || 1500;
              
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Spent</span>
                    <span className="font-semibold text-slate-800">
                      ${stats.thisMonth.toFixed(2)} / ${monthlyBudget.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((stats.thisMonth / monthlyBudget) * 100, 100)}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {((stats.thisMonth / monthlyBudget) * 100).toFixed(1)}% used
                    </span>
                    <span className="text-slate-500">
                      ${Math.max(monthlyBudget - stats.thisMonth, 0).toFixed(2)} remaining
                    </span>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <Target size={32} className="text-primary" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">No expenses this month</h4>
              <p className="text-slate-500 mb-4">Start tracking your monthly spending</p>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => setShowExpenseForm(true)}
              >
                Add First Expense
              </Button>
            </div>
          )}
        </Card>

        {/* Developer Panel - Only show if no expenses exist */}
        {(!state.expenses || state.expenses.length === 0) && (
          <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">🚀 Getting Started</h3>
                <p className="text-slate-600">Load sample data to explore the features</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button
                variant="primary"
                onClick={() => loadSampleData(actions)}
                className="flex items-center gap-2"
              >
                📊 Load Sample Data
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowExpenseForm(true)}
                className="flex items-center gap-2"
              >
                <Plus size={20} />
                Add Real Expense
              </Button>
            </div>
            
            <div className="mt-4 p-4 bg-white/50 rounded-xl">
              <p className="text-sm text-slate-600">
                <strong>Sample data includes:</strong> 7 expenses across different categories, 
                spread over the last week to demonstrate charts, statistics, and trends.
              </p>
            </div>
          </Card>
        )}

        {/* Developer Controls - Only show if expenses exist */}
        {state.expenses && state.expenses.length > 0 && (
          <Card className="p-4 bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-700">Developer Controls</h4>
                <p className="text-sm text-slate-500">Manage your data</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                    clearAllData(state, actions);
                  }
                }}
                className="text-red-600 hover:bg-red-50"
              >
                Clear All Data
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Modals */}
      <ExpenseForm
        isOpen={showExpenseForm}
        onClose={() => setShowExpenseForm(false)}
        onSubmit={handleAddExpense}
        categories={state.categories}
        recentExpenses={state.expenses?.slice(0, 10) || []}
      />

      <AIAssistant
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        onSendMessage={(message) => console.log('AI Message:', message)}
      />
    </Layout>
  );
};

export default ModernDashboard;
