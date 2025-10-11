import React, { useState } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  ArrowLeft,
  Coffee,
  Car,
  Gamepad2,
  Home,
  ShoppingBag,
  Heart,
  Palette,
  Check,
  X,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Target
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { useApp } from '../context/AppContext.jsx';

const ModernCategories = ({ onNavigate }) => {
  const { state, actions } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: 'ShoppingBag',
    color: 'text-primary bg-primary/10',
    budget: ''
  });
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState(null);
  const [budgetAmount, setBudgetAmount] = useState('');

  const defaultIcons = [
    { name: 'Coffee', icon: Coffee, label: 'Food & Drinks' },
    { name: 'Car', icon: Car, label: 'Transport' },
    { name: 'Gamepad2', icon: Gamepad2, label: 'Entertainment' },
    { name: 'Home', icon: Home, label: 'Bills & Utilities' },
    { name: 'ShoppingBag', icon: ShoppingBag, label: 'Shopping' },
    { name: 'Heart', icon: Heart, label: 'Health & Fitness' },
  ];

  const colorOptions = [
    { name: 'Primary', class: 'text-primary bg-primary/10' },
    { name: 'Secondary', class: 'text-secondary bg-secondary/10' },
    { name: 'Accent', class: 'text-accent bg-accent/10' },
    { name: 'Success', class: 'text-success bg-success/10' },
    { name: 'Purple', class: 'text-purple-500 bg-purple-500/10' },
    { name: 'Pink', class: 'text-pink-500 bg-pink-500/10' },
    { name: 'Indigo', class: 'text-indigo-500 bg-indigo-500/10' },
    { name: 'Orange', class: 'text-orange-500 bg-orange-500/10' },
  ];

  const handleAddCategory = async () => {
    try {
      const categoryData = {
        id: Date.now().toString(),
        name: newCategory.name,
        icon: newCategory.icon,
        color: newCategory.color,
        budget: newCategory.budget ? parseFloat(newCategory.budget) : 0,
        isCustom: true
      };

      await actions.addCategory(categoryData);
      setShowAddModal(false);
      setNewCategory({ name: '', icon: 'ShoppingBag', color: 'text-primary bg-primary/10', budget: '' });
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      icon: category.icon,
      color: category.color,
      budget: category.budget || ''
    });
    setShowAddModal(true);
  };

  const handleUpdateCategory = async () => {
    try {
      const updates = {
        ...newCategory,
        budget: newCategory.budget ? parseFloat(newCategory.budget) : 0
      };
      await actions.updateCategory(editingCategory.id, updates);
      setShowAddModal(false);
      setEditingCategory(null);
      setNewCategory({ name: '', icon: 'ShoppingBag', color: 'text-primary bg-primary/10', budget: '' });
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleSetBudget = (category) => {
    setBudgetCategory(category);
    setBudgetAmount(category.budget || '');
    setShowBudgetModal(true);
  };

  const handleSaveBudget = async () => {
    try {
      await actions.updateCategory(budgetCategory.id, {
        ...budgetCategory,
        budget: budgetAmount ? parseFloat(budgetAmount) : 0
      });
      setShowBudgetModal(false);
      setBudgetCategory(null);
      setBudgetAmount('');
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await actions.deleteCategory(categoryId);
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const getIconComponent = (iconName) => {
    const iconMap = {
      Coffee, Car, Gamepad2, Home, ShoppingBag, Heart
    };
    return iconMap[iconName] || ShoppingBag;
  };

  return (
    <Layout currentPage="categories" onNavigate={onNavigate}>
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
                Categories
              </h1>
            </div>
            <p className="text-slate-600 ml-12">
              Manage your expense categories - {state.categories.length} total
            </p>
          </div>
          
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            Add Category
          </Button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {state.categories.map((category, index) => {
            const IconComponent = getIconComponent(category.icon);
            const categoryExpenses = state.expenses.filter(e => e.category === category.name);
            const totalSpent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
            const budget = category.budget || 0;
            const budgetPercentage = budget > 0 ? (totalSpent / budget) * 100 : 0;
            const isOverBudget = budget > 0 && totalSpent > budget;
            const isNearLimit = budget > 0 && budgetPercentage >= 80 && budgetPercentage < 100;

            return (
              <Card
                key={category.id}
                className={`p-6 group hover:scale-105 transition-all duration-300 ${
                  isOverBudget
                    ? 'border-2 border-red-300 bg-gradient-to-br from-red-50/50 to-white'
                    : isNearLimit
                    ? 'border-2 border-yellow-300 bg-gradient-to-br from-yellow-50/50 to-white'
                    : ''
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${category.color} shadow-md`}>
                    <IconComponent size={24} />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetBudget(category)}
                      className="p-2 hover:bg-sky-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      title="Set Budget"
                    >
                      <Target size={16} className="text-sky-600" />
                    </Button>
                    {category.isCustom && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                          className="p-2 hover:bg-slate-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <Edit3 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-2 hover:bg-red-100 hover:text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {category.isCustom ? 'Custom category' : 'Default category'}
                  </p>
                </div>

                {/* Budget Progress */}
                {budget > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 font-medium">Budget Progress</span>
                      <span className={`font-bold ${
                        isOverBudget ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {budgetPercentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-1000 ${
                          isOverBudget
                            ? 'bg-gradient-to-r from-red-500 to-red-600'
                            : isNearLimit
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                            : 'bg-gradient-to-r from-green-500 to-emerald-500'
                        }`}
                        style={{
                          width: `${Math.min(budgetPercentage, 100)}%`,
                          animationDelay: `${index * 100}ms`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className={`font-semibold ${
                        isOverBudget ? 'text-red-600' : 'text-slate-700'
                      }`}>
                        ${totalSpent.toFixed(2)}
                      </span>
                      <span className="text-slate-500">
                        of ${budget.toFixed(2)}
                      </span>
                    </div>
                    {isOverBudget && (
                      <div className="flex items-center gap-1 text-xs text-red-600 font-medium mt-1">
                        <AlertTriangle size={12} />
                        Over budget by ${(totalSpent - budget).toFixed(2)}
                      </div>
                    )}
                    {isNearLimit && !isOverBudget && (
                      <div className="flex items-center gap-1 text-xs text-yellow-600 font-medium mt-1">
                        <AlertTriangle size={12} />
                        Approaching limit
                      </div>
                    )}
                  </div>
                )}

                {/* Usage Stats */}
                <div className={`${budget > 0 ? 'mt-4' : 'mt-4'} pt-4 border-t border-slate-100`}>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Spent</p>
                      <p className="font-semibold text-slate-800">${totalSpent.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Transactions</p>
                      <p className="font-semibold text-slate-800">{categoryExpenses.length}</p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          {/* Add New Category Card */}
          <Card 
            className="p-6 border-2 border-dashed border-slate-300 hover:border-primary hover:bg-primary/5 transition-all duration-200 cursor-pointer group"
            onClick={() => setShowAddModal(true)}
          >
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="p-4 rounded-2xl bg-slate-100 group-hover:bg-primary/10 transition-colors duration-200 mb-4">
                <Plus size={32} className="text-slate-400 group-hover:text-primary transition-colors duration-200" />
              </div>
              <h3 className="font-semibold text-slate-600 group-hover:text-primary transition-colors duration-200">
                Add New Category
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Create a custom category
              </p>
            </div>
          </Card>
        </div>

        {/* Category Statistics */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Category Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {state.categories.length}
              </div>
              <div className="text-slate-600">Total Categories</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2">
                {state.categories.filter(c => c.isCustom).length}
              </div>
              <div className="text-slate-600">Custom Categories</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-success mb-2">
                {state.categories.filter(c => !c.isCustom).length}
              </div>
              <div className="text-slate-600">Default Categories</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Add/Edit Category Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingCategory(null);
          setNewCategory({ name: '', icon: 'ShoppingBag', color: 'text-primary bg-primary/10' });
        }}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        size="md"
      >
        <Modal.Content>
          <div className="space-y-6">
            {/* Category Name */}
            <Input
              label="Category Name"
              value={newCategory.name}
              onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter category name"
              required
            />

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Choose Icon
              </label>
              <div className="grid grid-cols-3 gap-3">
                {defaultIcons.map((iconOption) => {
                  const IconComponent = iconOption.icon;
                  const isSelected = newCategory.icon === iconOption.name;
                  
                  return (
                    <button
                      key={iconOption.name}
                      type="button"
                      onClick={() => setNewCategory(prev => ({ ...prev, icon: iconOption.name }))}
                      className={`
                        p-4 rounded-2xl border-2 transition-all duration-200
                        flex flex-col items-center gap-2 hover:scale-105
                        ${isSelected 
                          ? 'border-primary bg-primary/10 shadow-lg shadow-primary/25' 
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                        }
                      `}
                    >
                      <IconComponent size={24} className={isSelected ? 'text-primary' : 'text-slate-600'} />
                      <span className="text-xs font-medium text-slate-600">
                        {iconOption.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Choose Color
              </label>
              <div className="grid grid-cols-4 gap-3">
                {colorOptions.map((colorOption) => {
                  const isSelected = newCategory.color === colorOption.class;
                  
                  return (
                    <button
                      key={colorOption.name}
                      type="button"
                      onClick={() => setNewCategory(prev => ({ ...prev, color: colorOption.class }))}
                      className={`
                        p-3 rounded-xl border-2 transition-all duration-200
                        flex items-center justify-center hover:scale-105
                        ${isSelected 
                          ? 'border-primary shadow-lg shadow-primary/25' 
                          : 'border-slate-200 hover:border-slate-300'
                        }
                      `}
                    >
                      <div className={`w-6 h-6 rounded-full ${colorOption.class.split(' ')[1]}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget Input */}
            <div>
              <Input
                label="Monthly Budget (Optional)"
                type="number"
                value={newCategory.budget}
                onChange={(e) => setNewCategory(prev => ({ ...prev, budget: e.target.value }))}
                placeholder="0.00"
                icon={DollarSign}
              />
              <p className="text-xs text-slate-500 mt-2">
                Set a monthly spending limit for this category
              </p>
            </div>

            {/* Preview */}
            <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="text-sm font-medium text-slate-700 mb-3">Preview:</p>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${newCategory.color}`}>
                  {React.createElement(getIconComponent(newCategory.icon), { size: 24 })}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-800">
                    {newCategory.name || 'Category Name'}
                  </div>
                  <div className="text-sm text-slate-500">
                    {newCategory.budget ? `Budget: $${parseFloat(newCategory.budget).toFixed(2)}/month` : 'Custom category'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal.Content>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowAddModal(false);
              setEditingCategory(null);
              setNewCategory({ name: '', icon: 'ShoppingBag', color: 'text-primary bg-primary/10' });
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
            disabled={!newCategory.name.trim()}
          >
            {editingCategory ? 'Update Category' : 'Add Category'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Budget Setting Modal */}
      <Modal
        isOpen={showBudgetModal}
        onClose={() => {
          setShowBudgetModal(false);
          setBudgetCategory(null);
          setBudgetAmount('');
        }}
        title="Set Category Budget"
        size="sm"
      >
        <Modal.Content>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-sky-50 to-cyan-50 rounded-xl">
              <div className="flex items-center gap-3">
                {budgetCategory && (
                  <>
                    <div className={`p-3 rounded-xl ${budgetCategory.color}`}>
                      {React.createElement(getIconComponent(budgetCategory.icon), { size: 24 })}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{budgetCategory.name}</p>
                      <p className="text-sm text-slate-600">Set monthly spending limit</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <Input
              label="Monthly Budget"
              type="number"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              placeholder="0.00"
              icon={DollarSign}
              required
            />

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-xs text-yellow-800">
                <strong>Tip:</strong> Setting a budget helps you track spending and get alerts when you're approaching or exceeding your limit.
              </p>
            </div>
          </div>
        </Modal.Content>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowBudgetModal(false);
              setBudgetCategory(null);
              setBudgetAmount('');
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveBudget}
            disabled={!budgetAmount || parseFloat(budgetAmount) <= 0}
          >
            Save Budget
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
};

export default ModernCategories;
