import React, { useState } from 'react';

/**
 * Expense Preview Component
 * Shows parsed expense data from AI services with editable fields before confirmation
 */
const ExpensePreview = ({ 
  parseResult, 
  onConfirm, 
  onCancel, 
  onEdit,
  categories = [],
  isLoading = false 
}) => {
  const [editedFields, setEditedFields] = useState({
    amount: parseResult?.extractedFields?.amount || '',
    category: parseResult?.extractedFields?.category || parseResult?.extractedFields?.categoryHint || '',
    date: parseResult?.extractedFields?.date ? parseResult.extractedFields.date.split('T')[0] : '',
    description: parseResult?.extractedFields?.description || parseResult?.extractedFields?.merchant || ''
  });

  const [errors, setErrors] = useState({});

  if (!parseResult) return null;

  const { extractedFields, confidence, inputType, error } = parseResult;

  /**
   * Handle field changes
   */
  const handleFieldChange = (field, value) => {
    setEditedFields(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  /**
   * Validate fields
   */
  const validateFields = () => {
    const newErrors = {};

    if (!editedFields.amount || isNaN(editedFields.amount) || parseFloat(editedFields.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }

    if (!editedFields.category) {
      newErrors.category = 'Category is required';
    }

    if (!editedFields.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(editedFields.date);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.date = 'Date cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle confirm
   */
  const handleConfirm = () => {
    if (!validateFields()) return;

    const expenseData = {
      amount: parseFloat(editedFields.amount),
      category: editedFields.category,
      date: editedFields.date,
      description: editedFields.description.trim() || null,
      source: inputType === 'image' ? 'receipt_scan' : 'natural_language'
    };

    onConfirm?.(expenseData);
  };

  /**
   * Get confidence color
   */
  const getConfidenceColor = (confidenceScore) => {
    if (confidenceScore >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidenceScore >= 0.5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  /**
   * Get confidence label
   */
  const getConfidenceLabel = (confidenceScore) => {
    if (confidenceScore >= 0.8) return 'High';
    if (confidenceScore >= 0.5) return 'Medium';
    return 'Low';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
            {inputType === 'image' ? (
              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {inputType === 'image' ? 'Receipt Scanned' : 'Expense Parsed'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Review and edit the extracted information
            </p>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Amount Field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount
            </label>
            {confidence?.amount !== undefined && (
              <span className={`text-xs ${getConfidenceColor(confidence.amount)}`}>
                {getConfidenceLabel(confidence.amount)} confidence
              </span>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={editedFields.amount}
              onChange={(e) => handleFieldChange('amount', e.target.value)}
              className={`w-full pl-8 pr-3 py-2 border rounded-md bg-white dark:bg-gray-700 
                         text-gray-900 dark:text-white
                         ${errors.amount 
                           ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500' 
                           : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                         }`}
              placeholder="0.00"
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.amount}</p>
          )}
        </div>

        {/* Category Field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            {confidence?.category !== undefined && (
              <span className={`text-xs ${getConfidenceColor(confidence.category)}`}>
                {getConfidenceLabel(confidence.category)} confidence
              </span>
            )}
          </div>
          <select
            value={editedFields.category}
            onChange={(e) => handleFieldChange('category', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 
                       text-gray-900 dark:text-white
                       ${errors.category 
                         ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500' 
                         : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                       }`}
          >
            <option value="">Select category</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>
          )}
        </div>

        {/* Date Field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date
            </label>
            {confidence?.date !== undefined && (
              <span className={`text-xs ${getConfidenceColor(confidence.date)}`}>
                {getConfidenceLabel(confidence.date)} confidence
              </span>
            )}
          </div>
          <input
            type="date"
            value={editedFields.date}
            onChange={(e) => handleFieldChange('date', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 
                       text-gray-900 dark:text-white
                       ${errors.date 
                         ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500' 
                         : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                       }`}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</p>
          )}
        </div>

        {/* Description Field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            {confidence?.description !== undefined && (
              <span className={`text-xs ${getConfidenceColor(confidence.description)}`}>
                {getConfidenceLabel(confidence.description)} confidence
              </span>
            )}
          </div>
          <input
            type="text"
            value={editedFields.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-blue-500 focus:border-blue-500"
            placeholder="Optional description"
            maxLength={500}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 
                     hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md font-medium text-sm
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400
                     text-white rounded-md font-medium text-sm
                     disabled:cursor-not-allowed transition-colors
                     flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </>
            ) : (
              'Add Expense'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpensePreview;
