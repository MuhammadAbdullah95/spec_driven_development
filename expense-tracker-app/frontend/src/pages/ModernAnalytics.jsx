import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  PieChart,
  BarChart3,
  Download,
  Filter,
  X,
  Search,
  Coffee,
  Car,
  Gamepad2,
  Home,
  ShoppingBag,
  Heart,
  Tag,
  ArrowUp,
  ArrowDown,
  Minus,
  FileText
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatCard from '../components/features/StatCard';
import { SpendingChart, CategoryChart, TrendChart } from '../components/features/Charts';
import { useApp } from '../context/AppContext.jsx';
import { formatCurrency, formatRelativeTime } from '../utils/formatters.js';

const ModernAnalytics = ({ onNavigate }) => {
  const { state } = useApp();
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [filters, setFilters] = useState({
    minAmount: '',
    maxAmount: '',
    searchTerm: '',
    dateFrom: '',
    dateTo: ''
  });

  // Calculate analytics data
  const analytics = useMemo(() => {
    const now = new Date();
    const expenses = state.expenses || [];
    
    // Filter by time range
    const getDateThreshold = (range) => {
      const date = new Date(now);
      switch (range) {
        case '7d': date.setDate(date.getDate() - 7); break;
        case '30d': date.setDate(date.getDate() - 30); break;
        case '90d': date.setDate(date.getDate() - 90); break;
        case '1y': date.setFullYear(date.getFullYear() - 1); break;
        default: return new Date(0);
      }
      return date;
    };

    const threshold = getDateThreshold(timeRange);
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      
      // Time range filter
      if (expenseDate < threshold) return false;
      
      // Category filter
      if (selectedCategory !== 'all' && expense.category !== selectedCategory) return false;
      
      // Advanced filters
      if (filters.minAmount && expense.amount < parseFloat(filters.minAmount)) return false;
      if (filters.maxAmount && expense.amount > parseFloat(filters.maxAmount)) return false;
      if (filters.searchTerm && !expense.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
      if (filters.dateFrom && expenseDate < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && expenseDate > new Date(filters.dateTo)) return false;
      
      return true;
    });

    // Calculate totals
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const count = filteredExpenses.length;
    const average = count > 0 ? total / count : 0;

    // Calculate previous period for comparison
    const prevThreshold = new Date(threshold);
    prevThreshold.setTime(prevThreshold.getTime() - (now.getTime() - threshold.getTime()));
    const prevExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= prevThreshold && expenseDate < threshold;
    });
    const prevTotal = prevExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate trend
    const trend = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;

    // Category breakdown
    const categoryTotals = filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    const categoryData = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount
    })).sort((a, b) => b.amount - a.amount);

    // Daily spending data for chart
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayExpenses = filteredExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.toDateString() === date.toDateString();
      });
      const dayTotal = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      dailyData.push({
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        amount: dayTotal
      });
    }

    // Top expenses
    const topExpenses = [...filteredExpenses]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Day of week analysis
    const dayOfWeekData = Array(7).fill(0).map((_, index) => ({
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index],
      amount: 0,
      count: 0
    }));

    filteredExpenses.forEach(expense => {
      const dayIndex = new Date(expense.date).getDay();
      dayOfWeekData[dayIndex].amount += expense.amount;
      dayOfWeekData[dayIndex].count += 1;
    });

    // Monthly comparison (current month vs previous month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const currentMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const previousMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === previousMonth && expenseDate.getFullYear() === previousYear;
    });

    const currentMonthTotal = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const previousMonthTotal = previousMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const monthlyChange = previousMonthTotal > 0 ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100 : 0;

    return {
      total,
      count,
      average,
      trend,
      categoryData,
      dailyData,
      topExpenses,
      filteredExpenses,
      dayOfWeekData,
      currentMonthTotal,
      previousMonthTotal,
      monthlyChange
    };
  }, [state.expenses, timeRange, selectedCategory, filters]);

  const timeRangeOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ];

  // Category icon mapping
  const categoryIcons = {
    'Food': Coffee,
    'Transport': Car,
    'Entertainment': Gamepad2,
    'Bills': Home,
    'Shopping': ShoppingBag,
    'Health': Heart
  };

  // Export functionality
  const handleExport = () => {
    const csvContent = [
      ['Date', 'Description', 'Category', 'Amount'],
      ...analytics.filteredExpenses.map(expense => [
        expense.date,
        expense.description,
        expense.category,
        expense.amount
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expense-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      minAmount: '',
      maxAmount: '',
      searchTerm: '',
      dateFrom: '',
      dateTo: ''
    });
    setSelectedCategory('all');
    setTimeRange('30d');
  };

  return (
    <Layout currentPage="analytics" onNavigate={onNavigate}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Button
                variant="ghost"
                onClick={() => onNavigate('dashboard')}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <ArrowLeft size={20} />
              </Button>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-800">
                Analytics & Insights
              </h1>
            </div>
            <p className="text-slate-600 ml-12">
              Analyze your spending patterns and trends
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              className="flex items-center gap-2"
              onClick={handleExport}
              disabled={analytics.filteredExpenses.length === 0}
            >
              <Download size={20} />
              Export ({analytics.filteredExpenses.length})
            </Button>
            <Button 
              variant={showAdvancedFilter ? "primary" : "secondary"} 
              className="flex items-center gap-2"
              onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
            >
              <Filter size={20} />
              {showAdvancedFilter ? 'Hide Filters' : 'Advanced Filter'}
            </Button>
          </div>
        </div>

        {/* Time Range & Category Filters */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Time Range */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Time Range
              </label>
              <div className="flex gap-2">
                {timeRangeOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={timeRange === option.value ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setTimeRange(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Category Filter
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`p-3 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                    selectedCategory === 'all'
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/25'
                      : 'border-slate-200 bg-white/80 hover:bg-white/90 hover:border-slate-300'
                  }`}
                >
                  <Tag size={20} className={selectedCategory === 'all' ? 'text-primary' : 'text-slate-500'} />
                  <span className={`text-xs font-medium ${selectedCategory === 'all' ? 'text-primary' : 'text-slate-700'}`}>
                    All
                  </span>
                </button>
                
                {state.categories.map((category) => {
                  const IconComponent = categoryIcons[category.name] || Tag;
                  const isSelected = selectedCategory === category.name;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`p-3 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-lg shadow-primary/25'
                          : 'border-slate-200 bg-white/80 hover:bg-white/90 hover:border-slate-300'
                      }`}
                    >
                      <IconComponent size={20} className={isSelected ? 'text-primary' : 'text-slate-500'} />
                      <span className={`text-xs font-medium ${isSelected ? 'text-primary' : 'text-slate-700'}`}>
                        {category.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* Advanced Filters */}
        {showAdvancedFilter && (
          <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Filter size={20} className="text-primary" />
                Advanced Filters
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedFilter(false)}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X size={16} />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search Term */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Search Description
                </label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    placeholder="Search expense descriptions..."
                    className="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 text-sm"
                  />
                </div>
              </div>

              {/* Amount Range */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Amount Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.minAmount}
                    onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                    placeholder="Min"
                    className="flex-1 px-3 py-3 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 text-sm"
                  />
                  <span className="flex items-center text-slate-500">to</span>
                  <input
                    type="number"
                    value={filters.maxAmount}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                    placeholder="Max"
                    className="flex-1 px-3 py-3 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 text-sm"
                  />
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Custom Date Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    className="flex-1 px-3 py-3 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 text-sm"
                  />
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    className="flex-1 px-3 py-3 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                {analytics.filteredExpenses.length} expenses match your filters
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear All
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAdvancedFilter(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 hover:shadow-xl transition-all duration-300 animate-fadeIn bg-gradient-to-br from-white to-sky-50/30">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-lg">
                <DollarSign size={24} />
              </div>
              {analytics.trend !== 0 && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  analytics.trend > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                }`}>
                  {analytics.trend > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  {Math.abs(analytics.trend).toFixed(1)}%
                </div>
              )}
            </div>
            <h3 className="text-sm font-medium text-slate-600 mb-2">Total Spending</h3>
            <p className="text-3xl font-bold text-slate-800">{formatCurrency(analytics.total)}</p>
            <p className="text-xs text-slate-500 mt-2">
              {analytics.trend > 0 ? 'Increased' : analytics.trend < 0 ? 'Decreased' : 'No change'} from previous period
            </p>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 animate-fadeIn bg-gradient-to-br from-white to-cyan-50/30" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg">
                <BarChart3 size={24} />
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-600">
                <FileText size={12} />
                {analytics.count}
              </div>
            </div>
            <h3 className="text-sm font-medium text-slate-600 mb-2">Transactions</h3>
            <p className="text-3xl font-bold text-slate-800">{analytics.count}</p>
            <p className="text-xs text-slate-500 mt-2">
              Total expense entries recorded
            </p>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 animate-fadeIn bg-gradient-to-br from-white to-purple-50/30" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
                <TrendingUp size={24} />
              </div>
              {analytics.monthlyChange !== 0 && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  analytics.monthlyChange > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                }`}>
                  {analytics.monthlyChange > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  {Math.abs(analytics.monthlyChange).toFixed(1)}%
                </div>
              )}
            </div>
            <h3 className="text-sm font-medium text-slate-600 mb-2">Avg per Transaction</h3>
            <p className="text-3xl font-bold text-slate-800">{formatCurrency(analytics.average)}</p>
            <p className="text-xs text-slate-500 mt-2">
              Monthly comparison indicator
            </p>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 animate-fadeIn bg-gradient-to-br from-white to-emerald-50/30" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
                <PieChart size={24} />
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-600">
                <Tag size={12} />
                {analytics.categoryData.length}
              </div>
            </div>
            <h3 className="text-sm font-medium text-slate-600 mb-2">Categories Used</h3>
            <p className="text-3xl font-bold text-slate-800">{analytics.categoryData.length}</p>
            <p className="text-xs text-slate-500 mt-2">
              Active expense categories
            </p>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Spending Over Time */}
          <SpendingChart
            data={analytics.dailyData}
            className="animate-fadeIn"
          />

          {/* Category Breakdown */}
          <CategoryChart
            data={analytics.categoryData}
            className="animate-fadeIn"
          />
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Day of Week Analysis */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Spending by Day of Week</h3>
              <Calendar size={20} className="text-sky-600" />
            </div>

            <div className="space-y-4">
              {analytics.dayOfWeekData.map((day, index) => {
                const maxAmount = Math.max(...analytics.dayOfWeekData.map(d => d.amount));
                const percentage = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;
                const isWeekend = index === 0 || index === 6;

                return (
                  <div key={day.day} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-medium ${isWeekend ? 'text-sky-600' : 'text-slate-700'} w-10`}>
                          {day.day}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({day.count} {day.count === 1 ? 'transaction' : 'transactions'})
                        </span>
                      </div>
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(day.amount)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-1000 ${
                          isWeekend
                            ? 'bg-gradient-to-r from-sky-500 to-cyan-500'
                            : 'bg-gradient-to-r from-purple-500 to-pink-500'
                        }`}
                        style={{
                          width: `${percentage}%`,
                          animationDelay: `${index * 100}ms`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-br from-sky-50 to-cyan-50 rounded-xl">
              <p className="text-sm text-slate-700">
                <span className="font-semibold">Insight:</span>{' '}
                {(() => {
                  const weekdayTotal = analytics.dayOfWeekData.slice(1, 6).reduce((sum, d) => sum + d.amount, 0);
                  const weekendTotal = analytics.dayOfWeekData[0].amount + analytics.dayOfWeekData[6].amount;
                  return weekdayTotal > weekendTotal
                    ? 'You spend more on weekdays than weekends.'
                    : 'Your weekend spending is higher than weekdays.';
                })()}
              </p>
            </div>
          </Card>

          {/* Monthly Comparison */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Monthly Comparison</h3>
              <TrendChart size={20} className="text-sky-600" />
            </div>

            <div className="space-y-6">
              {/* Current Month */}
              <div className="p-4 bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl border-2 border-sky-200/50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-medium text-sky-600 mb-1">Current Month</p>
                    <p className="text-sm text-slate-600">
                      {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-800">
                      {formatCurrency(analytics.currentMonthTotal)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Previous Month */}
              <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-200/50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-1">Previous Month</p>
                    <p className="text-sm text-slate-600">
                      {new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-800">
                      {formatCurrency(analytics.previousMonthTotal)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Change Indicator */}
              <div className={`p-4 rounded-2xl border-2 ${
                analytics.monthlyChange > 0
                  ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200/50'
                  : analytics.monthlyChange < 0
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50'
                  : 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200/50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      analytics.monthlyChange > 0
                        ? 'bg-red-200'
                        : analytics.monthlyChange < 0
                        ? 'bg-green-200'
                        : 'bg-slate-200'
                    }`}>
                      {analytics.monthlyChange > 0 ? (
                        <ArrowUp size={20} className="text-red-600" />
                      ) : analytics.monthlyChange < 0 ? (
                        <ArrowDown size={20} className="text-green-600" />
                      ) : (
                        <Minus size={20} className="text-slate-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">Month-over-Month Change</p>
                      <p className="text-xs text-slate-500">
                        {analytics.monthlyChange > 0 ? 'Spending increased' : analytics.monthlyChange < 0 ? 'Spending decreased' : 'No change'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${
                      analytics.monthlyChange > 0
                        ? 'text-red-600'
                        : analytics.monthlyChange < 0
                        ? 'text-green-600'
                        : 'text-slate-600'
                    }`}>
                      {analytics.monthlyChange > 0 ? '+' : ''}{analytics.monthlyChange.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">Recommendation:</span>{' '}
                  {analytics.monthlyChange > 10
                    ? 'Consider reviewing your budget to identify areas where you can cut back.'
                    : analytics.monthlyChange < -10
                    ? 'Great job! Keep up the good spending habits.'
                    : 'Your spending is relatively stable month-over-month.'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Expenses */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">
              Largest Expenses
            </h3>
            
            {analytics.topExpenses.length > 0 ? (
              <div className="space-y-4">
                {analytics.topExpenses.map((expense, index) => (
                  <div 
                    key={expense.id} 
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800">
                        {expense.description}
                      </div>
                      <div className="text-sm text-slate-500">
                        {expense.category} • {formatRelativeTime(expense.date)}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-slate-800">
                      {formatCurrency(expense.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                No expenses in selected period
              </div>
            )}
          </Card>

          {/* Category Performance */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">
              Category Breakdown
            </h3>
            
            {analytics.categoryData.length > 0 ? (
              <div className="space-y-4">
                {analytics.categoryData.slice(0, 5).map((item, index) => {
                  const percentage = analytics.total > 0 ? (item.amount / analytics.total) * 100 : 0;
                  const IconComponent = categoryIcons[item.category] || Tag;
                  
                  return (
                    <div key={item.category} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-primary/10">
                            <IconComponent size={16} className="text-primary" />
                          </div>
                          <span className="font-medium text-slate-700">
                            {item.category}
                          </span>
                        </div>
                        <span className="font-semibold text-slate-800">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-1000 shadow-sm"
                          style={{ 
                            width: `${percentage}%`,
                            animationDelay: `${index * 100}ms`
                          }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">
                          {percentage.toFixed(1)}% of total spending
                        </span>
                        <span className="text-slate-600 font-medium">
                          {analytics.filteredExpenses.filter(e => e.category === item.category).length} transactions
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                No category data available
              </div>
            )}
          </Card>
        </div>

        {/* Insights & Recommendations */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">
            💡 Insights & Recommendations
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Spending Trend Insight */}
            <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20">
              <div className="flex items-center gap-3 mb-3">
                {analytics.trend > 0 ? (
                  <TrendingUp className="text-red-500" size={24} />
                ) : analytics.trend < 0 ? (
                  <TrendingDown className="text-green-500" size={24} />
                ) : (
                  <Calendar className="text-slate-500" size={24} />
                )}
                <h4 className="font-semibold text-slate-800">Spending Trend</h4>
              </div>
              <p className="text-sm text-slate-600">
                {analytics.trend > 5 
                  ? `Your spending increased by ${analytics.trend.toFixed(1)}% compared to the previous period. Consider reviewing your budget.`
                  : analytics.trend < -5
                  ? `Great job! Your spending decreased by ${Math.abs(analytics.trend).toFixed(1)}% compared to the previous period.`
                  : 'Your spending is relatively stable compared to the previous period.'
                }
              </p>
            </div>

            {/* Top Category Insight */}
            {analytics.categoryData.length > 0 && (
              <div className="p-4 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-2xl border border-secondary/20">
                <div className="flex items-center gap-3 mb-3">
                  <PieChart className="text-secondary" size={24} />
                  <h4 className="font-semibold text-slate-800">Top Category</h4>
                </div>
                <p className="text-sm text-slate-600">
                  Most of your spending ({((analytics.categoryData[0].amount / analytics.total) * 100).toFixed(1)}%) 
                  goes to <strong>{analytics.categoryData[0].category}</strong>. 
                  Consider if this aligns with your priorities.
                </p>
              </div>
            )}

            {/* Average Transaction Insight */}
            <div className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl border border-accent/20">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="text-accent" size={24} />
                <h4 className="font-semibold text-slate-800">Transaction Size</h4>
              </div>
              <p className="text-sm text-slate-600">
                Your average transaction is {formatCurrency(analytics.average)}. 
                {analytics.average > 50 
                  ? ' Consider tracking smaller daily expenses for better insights.'
                  : ' You\'re doing well tracking both large and small expenses!'
                }
              </p>
            </div>
          </div>
        </Card>

        {/* Empty State */}
        {analytics.filteredExpenses.length === 0 && (
          <Card className="p-12 text-center">
            <div className="max-w-sm mx-auto">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <BarChart3 size={32} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                No data for selected period
              </h3>
              <p className="text-slate-500 mb-6">
                Try selecting a different time range or add some expenses to see analytics.
              </p>
              <Button 
                variant="primary"
                onClick={() => onNavigate('dashboard')}
              >
                Add Your First Expense
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ModernAnalytics;
