import React, { useState } from 'react';
import { 
  ArrowLeft,
  DollarSign,
  Calendar,
  FileText,
  Tag,
  Check,
  Sparkles,
  Camera,
  Receipt,
  Coffee,
  Car,
  Gamepad2,
  Home,
  ShoppingBag,
  Heart
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useApp } from '../context/AppContext.jsx';

const AddExpense = ({ onNavigate }) => {
  const { state, actions } = useApp();
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);

  const categoryIcons = {
    'Food': Coffee,
    'Transport': Car,
    'Entertainment': Gamepad2,
    'Bills': Home,
    'Shopping': ShoppingBag,
    'Health': Heart,
  };

  const quickAmounts = [5, 10, 25, 50, 100, 200];
  
  const recentExpenses = state.expenses?.slice(0, 3) || [];

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
        amount: parseFloat(formData.amount)
      };

      await actions.addExpense(expenseData);
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onNavigate('dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error adding expense:', error);
      setErrors({ submit: 'Failed to add expense. Please try again.' });
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

  const handleQuickAmount = (amount) => {
    handleInputChange('amount', amount.toString());
  };

  const handleQuickCategory = (category) => {
    handleInputChange('category', category);
  };

  const getAISuggestion = () => {
    const suggestions = [
      'Lunch at downtown cafe',
      'Gas for weekly commute',
      'Monthly gym membership',
      'Grocery shopping',
      'Coffee with friends',
      'Movie tickets',
      'Uber ride home',
      'Phone bill payment'
    ];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  const formatAmountInput = (value) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return numericValue;
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage({
          file: file,
          preview: e.target.result,
          name: file.name
        });
        setErrors(prev => ({ ...prev, image: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use back camera on mobile
    input.onchange = handleImageUpload;
    input.click();
  };

  const handleReceiptScan = () => {
    if (!uploadedImage) {
      alert('Please upload an image first to scan for receipt data.');
      return;
    }

    // Simulate OCR processing
    setIsSubmitting(true);
    
    setTimeout(() => {
      // Mock OCR results - in real app, this would use OCR service
      const mockOCRResults = [
        { amount: '45.50', description: 'Coffee Shop Receipt', category: 'Food' },
        { amount: '23.99', description: 'Gas Station', category: 'Transport' },
        { amount: '67.80', description: 'Grocery Store', category: 'Food' },
        { amount: '15.00', description: 'Parking Fee', category: 'Transport' }
      ];
      
      const randomResult = mockOCRResults[Math.floor(Math.random() * mockOCRResults.length)];
      
      setFormData(prev => ({
        ...prev,
        amount: randomResult.amount,
        description: randomResult.description,
        category: randomResult.category
      }));
      
      setIsSubmitting(false);
      alert('Receipt scanned successfully! Check the filled fields.');
    }, 2000);
  };

  const removeImage = () => {
    setUploadedImage(null);
  };


  if (showSuccess) {
    return (
      <Layout currentPage="add-expense" onNavigate={onNavigate}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-12 text-center max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success text-white flex items-center justify-center animate-scaleIn">
              <Check size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Expense Added Successfully! 🎉
            </h2>
            <p className="text-slate-600 mb-6">
              Your expense of ${formData.amount} for "{formData.description}" has been saved.
            </p>
            <Button 
              variant="primary" 
              onClick={() => onNavigate('dashboard')}
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="add-expense" onNavigate={onNavigate}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => onNavigate('dashboard')}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-800">
              Add New Expense
            </h1>
            <p className="text-slate-600">
              Track your spending with detailed information
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Amount Section */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    💰 How much did you spend?
                  </h3>
                  
                  <Input
                    label="Amount"
                    type="text"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', formatAmountInput(e.target.value))}
                    error={errors.amount}
                    icon={DollarSign}
                    placeholder="0.00"
                    required
                    className="text-2xl font-bold"
                  />

                  {/* Quick Amount Buttons */}
                  <div className="mt-4">
                    <p className="text-sm font-medium text-slate-700 mb-3">Quick amounts:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickAmounts.map((amount) => (
                        <Button
                          key={amount}
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleQuickAmount(amount)}
                          className="hover:scale-105"
                        >
                          ${amount}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Category Section */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    🏷️ What category?
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(state.categories && state.categories.length > 0 ? state.categories : [
                      { id: 'food', name: 'Food', color: 'text-orange-500 bg-orange-100' },
                      { id: 'transport', name: 'Transport', color: 'text-blue-500 bg-blue-100' },
                      { id: 'entertainment', name: 'Entertainment', color: 'text-purple-500 bg-purple-100' },
                      { id: 'bills', name: 'Bills', color: 'text-green-500 bg-green-100' },
                      { id: 'shopping', name: 'Shopping', color: 'text-pink-500 bg-pink-100' },
                      { id: 'health', name: 'Health', color: 'text-red-500 bg-red-100' }
                    ]).map((category) => {
                      const Icon = categoryIcons[category.name] || Tag;
                      const isSelected = formData.category === category.name;
                      
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => handleQuickCategory(category.name)}
                          className={`
                            p-4 rounded-2xl border-2 transition-all duration-200
                            flex flex-col items-center gap-3 hover:scale-105
                            ${isSelected 
                              ? 'border-primary bg-primary/10 shadow-lg shadow-primary/25' 
                              : 'border-white/20 bg-white/50 hover:bg-white/70'
                            }
                          `}
                        >
                          <div className={`p-3 rounded-xl ${category.color || 'text-slate-500 bg-slate-100'}`}>
                            <Icon size={24} />
                          </div>
                          <span className="text-sm font-medium text-slate-700">
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

                {/* Description Section */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    📝 What was it for?
                  </h3>
                  
                  <Input
                    label="Description"
                    type="text"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    error={errors.description}
                    icon={FileText}
                    placeholder="Describe your expense..."
                    required
                  />
                  
                  <button
                    type="button"
                    onClick={() => handleInputChange('description', getAISuggestion())}
                    className="mt-3 flex items-center gap-2 text-sm text-primary hover:text-primary-600 transition-colors"
                  >
                    <Sparkles size={16} />
                    Get AI suggestion
                  </button>
                </div>

                {/* Date Section */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    📅 When did you spend it?
                  </h3>
                  
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

                {/* Submit Section */}
                <div className="pt-6 border-t border-slate-100">
                  {errors.submit && (
                    <p className="mb-4 text-sm text-red-500 animate-fadeIn">
                      {errors.submit}
                    </p>
                  )}
                  
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => onNavigate('dashboard')}
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={isSubmitting}
                      className="flex-1"
                    >
                      Add Expense
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={handleCameraCapture}
                >
                  <Camera size={20} className="mr-3" />
                  Take Photo
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  <Receipt size={20} className="mr-3" />
                  Upload Receipt
                </Button>
                {uploadedImage && (
                  <Button
                    variant="primary"
                    className="w-full justify-start"
                    onClick={handleReceiptScan}
                    loading={isSubmitting}
                  >
                    <Sparkles size={20} className="mr-3" />
                    Scan Receipt Data
                  </Button>
                )}
              </div>

              {/* Hidden file input */}
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Image Preview */}
              {uploadedImage && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Uploaded Image</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeImage}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </Button>
                  </div>
                  <img
                    src={uploadedImage.preview}
                    alt="Receipt preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <p className="text-xs text-slate-500 mt-2">{uploadedImage.name}</p>
                  {errors.image && (
                    <p className="text-xs text-red-500 mt-1">{errors.image}</p>
                  )}
                </div>
              )}
            </Card>

            {/* Recent Expenses */}
            {recentExpenses.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Recent Expenses</h3>
                <div className="space-y-3">
                  {recentExpenses.map((expense) => (
                    <button
                      key={expense.id}
                      type="button"
                      onClick={() => {
                        setFormData({
                          amount: expense.amount.toString(),
                          category: expense.category,
                          description: expense.description,
                          date: formData.date // Keep current date
                        });
                      }}
                      className="w-full p-3 text-left bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      <div className="font-medium text-slate-800">
                        ${expense.amount} - {expense.description}
                      </div>
                      <div className="text-sm text-slate-500">
                        {expense.category}
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* Tips */}
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
              <h3 className="font-semibold text-slate-800 mb-3">💡 Pro Tips</h3>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>• Be specific in descriptions for better tracking</li>
                <li>• Add expenses as soon as possible</li>
                <li>• Use consistent category names</li>
                <li>• Round amounts to nearest dollar for simplicity</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddExpense;
