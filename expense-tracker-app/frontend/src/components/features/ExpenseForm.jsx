import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Calendar, 
  FileText, 
  Tag,
  ShoppingBag, 
  Car, 
  Coffee, 
  Home, 
  Heart, 
  Gamepad2,
  Check,
  Sparkles,
  Loader2
} from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Card from '../ui/Card';
import { aiService } from '../../services/aiService.js';

const ExpenseForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null,
  categories = [],
  recentExpenses = [],
  className = '' 
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [parsedPreview, setParsedPreview] = useState(null);
  const [isParsing, setIsParsing] = useState(false);

  const iconMap = {
    'Coffee': Coffee,
    'Car': Car,
    'Gamepad2': Gamepad2,
    'Home': Home,
    'ShoppingBag': ShoppingBag,
    'Heart': Heart,
    'Tag': Tag,
    // Additional mappings for common category names
    'Food': Coffee,
    'Transport': Car,
    'Entertainment': Gamepad2,
    'Bills': Home,
    'Shopping': ShoppingBag,
    'Health': Heart
  };

  const defaultCategories = [
    { id: 'food', name: 'Food', icon: 'Coffee', color: 'text-orange-500 bg-orange-100' },
    { id: 'transport', name: 'Transport', icon: 'Car', color: 'text-blue-500 bg-blue-100' },
    { id: 'entertainment', name: 'Entertainment', icon: 'Gamepad2', color: 'text-purple-500 bg-purple-100' },
    { id: 'bills', name: 'Bills', icon: 'Home', color: 'text-green-500 bg-green-100' },
    { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: 'text-pink-500 bg-pink-100' },
    { id: 'health', name: 'Health', icon: 'Heart', color: 'text-red-500 bg-red-100' },
  ];

  const allCategories = categories.length > 0 ? categories : defaultCategories;

  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: initialData.amount.toString(),
        category: initialData.category,
        description: initialData.description,
        date: initialData.date
      });
    } else {
      setFormData({
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setErrors({});
    setShowSuccess(false);
  }, [initialData, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a description';
    }

    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        id: initialData?.id || Date.now().toString()
      };

      await onSubmit(expenseData);
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error submitting expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatAmountInput = (value) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    return numericValue;
  };

  const parseNaturalLanguage = async () => {
    if (!naturalLanguageInput.trim() || isParsing) return;

    setIsParsing(true);
    setParsedPreview(null);

    try {
      // Parse natural language expense input
      const expensePatterns = [
        /(?:add|spent|paid|bought)\s+\$?(\d+(?:\.\d{2})?)\s+(?:for|on)\s+(.+?)(?:\s+yesterday|\s+today|$)/i,
        /\$?(\d+(?:\.\d{2})?)\s+(?:for|on)\s+(.+?)(?:\s+yesterday|\s+today|$)/i,
        /(?:add|spent|paid)\s+(.+?)\s+\$?(\d+(?:\.\d{2})?)/i,
      ];

      let amount = null;
      let description = null;
      let date = new Date().toISOString().split('T')[0];
      const lowerInput = naturalLanguageInput.toLowerCase();

      // Check if message mentions yesterday
      if (lowerInput.includes('yesterday')) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        date = yesterday.toISOString().split('T')[0];
      }

      // Try to match patterns
      for (const pattern of expensePatterns) {
        const match = naturalLanguageInput.match(pattern);
        if (match) {
          if (pattern.toString().includes('spent|paid|bought')) {
            amount = match[1];
            description = match[2];
          } else if (match[2] && match[1]) {
            amount = match[1];
            description = match[2];
          }
          break;
        }
      }

      if (!amount || !description) {
        alert('Could not parse expense. Try formats like:\n"spent $20 on lunch"\n"add $50 for groceries yesterday"');
        setIsParsing(false);
        return;
      }

      // Try to infer category from description
      const categoryKeywords = {
        'Food': ['lunch', 'dinner', 'breakfast', 'food', 'meal', 'restaurant', 'coffee', 'groceries', 'snack', 'eat'],
        'Transport': ['gas', 'fuel', 'uber', 'taxi', 'bus', 'train', 'parking', 'ride', 'transport', 'car'],
        'Entertainment': ['movie', 'cinema', 'game', 'concert', 'show', 'ticket', 'entertainment', 'streaming'],
        'Bills': ['bill', 'rent', 'utility', 'internet', 'phone', 'electricity', 'water', 'insurance'],
        'Shopping': ['shopping', 'clothes', 'clothing', 'store', 'bought', 'purchase', 'electronics'],
        'Health': ['doctor', 'hospital', 'medicine', 'pharmacy', 'health', 'medical', 'gym', 'fitness']
      };

      let category = 'Shopping'; // Default category
      const descLower = description.toLowerCase();

      for (const [cat, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => descLower.includes(keyword))) {
          category = cat;
          break;
        }
      }

      const parsed = {
        amount: parseFloat(amount),
        category,
        description: description.trim().charAt(0).toUpperCase() + description.trim().slice(1),
        date
      };

      setParsedPreview(parsed);
    } catch (error) {
      console.error('Failed to parse natural language input:', error);
      alert('Failed to parse expense. Please try again.');
    } finally {
      setIsParsing(false);
    }
  };

  const applyParsedExpense = () => {
    if (!parsedPreview) return;

    setFormData({
      amount: parsedPreview.amount.toString(),
      category: parsedPreview.category,
      description: parsedPreview.description,
      date: parsedPreview.date
    });

    // Clear preview and input
    setParsedPreview(null);
    setNaturalLanguageInput('');
  };

  const getAISuggestion = async () => {
    if (isGeneratingAI) return;

    // Validate that we have enough context for a good suggestion
    if (!formData.category) {
      alert('Please select a category first to get better AI suggestions!');
      return;
    }

    setIsGeneratingAI(true);

    try {
      console.log('Generating AI suggestion with context:', {
        amount: formData.amount,
        category: formData.category,
        recentExpenses: recentExpenses?.length || 0
      });

      const suggestion = await aiService.generateExpenseSuggestion(
        formData.amount,
        formData.category,
        { recentExpenses: recentExpenses || [] }
      );

      if (suggestion) {
        handleInputChange('description', suggestion);
      } else {
        throw new Error('No suggestion received from AI service');
      }
    } catch (error) {
      console.error('Failed to generate AI suggestion:', error);

      // Enhanced fallback based on selected category
      const categoryFallbacks = {
        'Food': [
          'Lunch at local restaurant',
          'Coffee and pastry',
          'Grocery shopping trip',
          'Dinner with friends',
          'Quick breakfast bite'
        ],
        'Transport': [
          'Gas station fill-up',
          'Uber ride downtown',
          'Public transport pass',
          'Parking meter fee',
          'Taxi to meeting'
        ],
        'Entertainment': [
          'Movie theater tickets',
          'Streaming subscription',
          'Concert tickets',
          'Book purchase',
          'Gaming expense'
        ],
        'Bills': [
          'Monthly utility bill',
          'Internet service payment',
          'Phone bill',
          'Insurance premium',
          'Subscription renewal'
        ],
        'Shopping': [
          'Clothing purchase',
          'Home essentials',
          'Personal care items',
          'Electronics accessory',
          'Gift for friend'
        ],
        'Health': [
          'Pharmacy purchase',
          'Doctor visit copay',
          'Vitamins and supplements',
          'Dental appointment',
          'Medical supplies'
        ]
      };

      const categoryKey = formData.category;
      const suggestions = categoryFallbacks[categoryKey] || [
        'Daily expense',
        'Regular purchase',
        'Service payment'
      ];

      const fallback = suggestions[Math.floor(Math.random() * suggestions.length)];
      handleInputChange('description', fallback);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  if (showSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="sm">
        <Modal.Content>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success text-white flex items-center justify-center animate-scaleIn">
              <Check size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Expense {initialData ? 'Updated' : 'Added'}!
            </h3>
            <p className="text-slate-600">
              Your expense has been successfully {initialData ? 'updated' : 'saved'}.
            </p>
          </div>
        </Modal.Content>
      </Modal>
    );
  }

  // Mobile: Full screen modal, Desktop: Regular modal
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={initialData ? 'Edit Expense' : 'Add New Expense'}
      size="md"
      className="md:max-w-lg"
    >
      <Modal.Content>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Natural Language Input Section */}
          <div className="bg-gradient-to-br from-sky-50 to-cyan-50 p-5 rounded-2xl border-2 border-sky-200/50">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-sky-600" />
              <label className="text-sm font-semibold text-sky-900">
                Quick Add with Natural Language
              </label>
            </div>
            <p className="text-xs text-sky-700 mb-3">
              Try typing: "spent $20 on lunch" or "add $50 for groceries yesterday"
            </p>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={naturalLanguageInput}
                onChange={(e) => setNaturalLanguageInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    parseNaturalLanguage();
                  }
                }}
                placeholder="Type your expense naturally..."
                className="flex-1 px-4 py-3 bg-white border-2 border-sky-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-500/20 focus:border-sky-400 text-sm placeholder-slate-400 text-slate-800"
              />
              <Button
                type="button"
                variant="primary"
                onClick={parseNaturalLanguage}
                disabled={!naturalLanguageInput.trim() || isParsing}
                loading={isParsing}
                className="px-4 py-3 bg-gradient-to-br from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600"
              >
                {isParsing ? 'Parsing...' : 'Parse'}
              </Button>
            </div>

            {/* Parsed Preview Card */}
            {parsedPreview && (
              <div className="bg-white p-4 rounded-xl border-2 border-sky-300 animate-fadeIn">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Check size={16} className="text-green-600" />
                    Parsed Expense
                  </h4>
                  <button
                    type="button"
                    onClick={() => setParsedPreview(null)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Amount</p>
                    <p className="font-semibold text-slate-800">${parsedPreview.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Category</p>
                    <p className="font-semibold text-slate-800">{parsedPreview.category}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500 mb-1">Description</p>
                    <p className="font-semibold text-slate-800">{parsedPreview.description}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500 mb-1">Date</p>
                    <p className="font-semibold text-slate-800">{parsedPreview.date}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  onClick={applyParsedExpense}
                  className="w-full py-2 bg-gradient-to-br from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  Apply to Form
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Or fill manually</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
          </div>

          {/* Amount Input */}
          <div>
            <Input
              label="Amount"
              type="text"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', formatAmountInput(e.target.value))}
              error={errors.amount}
              icon={DollarSign}
              placeholder="0.00"
              required
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-3">
              Category <span className="text-red-500">*</span>
              <span className="block text-xs font-normal text-slate-500 mt-1">Select the category that best fits your expense</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {allCategories.map((category) => {
                // Handle both string and component icons
                const Icon = typeof category.icon === 'string' 
                  ? iconMap[category.icon] || Tag 
                  : category.icon || Tag;
                const isSelected = formData.category === category.name;
                
                
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleInputChange('category', category.name)}
                    className={`
                      p-4 rounded-2xl border-2 transition-all duration-200
                      flex flex-col items-center gap-3 hover:scale-105
                      ${isSelected 
                        ? 'border-primary bg-primary/10 shadow-lg shadow-primary/25' 
                        : 'border-slate-200 bg-white/80 hover:bg-white/90 hover:border-slate-300'
                      }
                    `}
                  >
                    <div className={`p-3 rounded-xl ${category.color || 'text-slate-500 bg-slate-100'}`}>
                      {Icon ? <Icon size={24} /> : <Tag size={24} />}
                    </div>
                    <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-slate-700'}`}>
                      {category.name}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.category && (
              <p className="mt-2 text-sm text-red-500 animate-fadeIn">
                {errors.category}
              </p>
            )}
          </div>

          {/* Description Input */}
          <div>
            <Input
              label="Description"
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              error={errors.description}
              icon={FileText}
              placeholder="What did you spend on?"
              required
            />
            <div className="flex items-center gap-3 mt-3">
              <button
                type="button"
                onClick={getAISuggestion}
                disabled={isGeneratingAI}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary-600 transition-colors px-2 py-1 rounded-lg hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingAI ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                {isGeneratingAI ? 'Generating...' : 'Get AI suggestion'}
              </button>
              
              {/* AI Status Indicator */}
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <div className={`w-2 h-2 rounded-full ${aiService.getStatus().hasApiKey ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span>{aiService.getStatus().hasApiKey ? 'AI Ready' : 'Fallback Mode'}</span>
              </div>
            </div>
          </div>

          {/* Date Input */}
          <div>
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              error={errors.date}
              icon={Calendar}
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1 py-3"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              className="flex-1 py-3 font-semibold"
            >
              {initialData ? 'Update Expense' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </Modal.Content>
    </Modal>
  );
};

export default ExpenseForm;
