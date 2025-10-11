import React, { useState } from 'react';
import { 
  Edit3, 
  Trash2, 
  ShoppingBag, 
  Car, 
  Coffee, 
  Home, 
  Heart, 
  Gamepad2,
  MoreHorizontal 
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const ExpenseList = ({ 
  expenses = [], 
  onDelete, 
  onEdit, 
  loading = false,
  className = '' 
}) => {
  const [swipedItem, setSwipedItem] = useState(null);

  const categoryIcons = {
    Food: Coffee,
    Transport: Car,
    Entertainment: Gamepad2,
    Bills: Home,
    Shopping: ShoppingBag,
    Health: Heart,
  };

  const categoryColors = {
    Food: 'text-orange-500 bg-orange-100',
    Transport: 'text-blue-500 bg-blue-100',
    Entertainment: 'text-purple-500 bg-purple-100',
    Bills: 'text-green-500 bg-green-100',
    Shopping: 'text-pink-500 bg-pink-100',
    Health: 'text-red-500 bg-red-100',
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleSwipe = (expenseId, direction) => {
    if (direction === 'left') {
      setSwipedItem(expenseId);
    } else {
      setSwipedItem(null);
    }
  };

  const handleDelete = (expense) => {
    onDelete?.(expense);
    setSwipedItem(null);
  };

  const handleEdit = (expense) => {
    onEdit?.(expense);
    setSwipedItem(null);
  };

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded-2xl"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-20"></div>
                </div>
                <div className="h-5 bg-slate-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (expenses.length === 0) {
    return (
      <Card className={`p-12 text-center ${className}`}>
        <div className="max-w-sm mx-auto">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
            <ShoppingBag size={32} className="text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            No expenses yet
          </h3>
          <p className="text-slate-500 mb-6">
            Start tracking your expenses by adding your first transaction.
          </p>
          <Button variant="primary">
            Add Your First Expense
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800">Recent Expenses</h2>
        <Button variant="ghost" size="sm">
          <MoreHorizontal size={20} />
        </Button>
      </div>

      <div className="space-y-3">
        {expenses.map((expense, index) => {
          const Icon = categoryIcons[expense.category] || ShoppingBag;
          const colorClasses = categoryColors[expense.category] || 'text-slate-500 bg-slate-100';
          const isSwipedLeft = swipedItem === expense.id;

          return (
            <div
              key={expense.id}
              className="relative overflow-hidden rounded-2xl"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Swipe Actions Background */}
              <div className="absolute inset-0 flex items-center justify-end pr-4 bg-gradient-to-l from-red-500 to-red-400">
                <div className="flex items-center gap-3 text-white">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(expense)}
                    className="text-white hover:bg-white/20 p-2"
                  >
                    <Edit3 size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(expense)}
                    className="text-white hover:bg-white/20 p-2"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>

              {/* Main Content */}
              <div
                className={`
                  relative bg-white/70 backdrop-blur-xl border border-white/20 p-4 
                  transition-transform duration-200 cursor-pointer
                  hover:bg-white/80 group
                  ${isSwipedLeft ? 'transform -translate-x-24' : ''}
                `}
                onTouchStart={(e) => {
                  const startX = e.touches[0].clientX;
                  const handleTouchMove = (e) => {
                    const currentX = e.touches[0].clientX;
                    const diffX = startX - currentX;
                    if (diffX > 50) {
                      handleSwipe(expense.id, 'left');
                    } else if (diffX < -50) {
                      handleSwipe(expense.id, 'right');
                    }
                  };
                  document.addEventListener('touchmove', handleTouchMove);
                  document.addEventListener('touchend', () => {
                    document.removeEventListener('touchmove', handleTouchMove);
                  }, { once: true });
                }}
              >
                <div className="flex items-center gap-4">
                  {/* Category Icon */}
                  <div className={`p-3 rounded-2xl ${colorClasses}`}>
                    <Icon size={20} />
                  </div>

                  {/* Expense Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate">
                      {expense.description}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span>{expense.category}</span>
                      <span>•</span>
                      <span>{formatDate(expense.date)}</span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p className="font-bold text-slate-800">
                      {formatAmount(expense.amount)}
                    </p>
                  </div>

                  {/* Desktop Actions */}
                  <div className="hidden lg:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(expense)}
                      className="p-2 hover:bg-slate-100"
                    >
                      <Edit3 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(expense)}
                      className="p-2 hover:bg-red-100 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default ExpenseList;
