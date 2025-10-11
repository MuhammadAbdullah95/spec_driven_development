import React, { useState, useRef } from 'react';
import { AIServiceError } from '../../services/ai/index.js';

/**
 * Natural Language Expense Input Component
 * Allows users to enter expenses using natural language like "spent $50 on pizza yesterday"
 */
const NLExpenseInput = ({ 
  onExpenseParsed, 
  onError, 
  nlpParser, 
  isLoading: externalLoading = false,
  placeholder = "Try: 'spent $50 on pizza yesterday'" 
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [examples, setExamples] = useState([]);
  const [showExamples, setShowExamples] = useState(false);
  const inputRef = useRef(null);

  // Load examples when component mounts
  React.useEffect(() => {
    if (nlpParser) {
      setExamples(nlpParser.getExamples());
    }
  }, [nlpParser]);

  /**
   * Handle natural language input parsing
   */
  const handleParse = async () => {
    if (!input.trim()) {
      onError?.('Please enter an expense description');
      return;
    }

    if (!nlpParser) {
      onError?.('AI service not available');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await nlpParser.parse(input.trim());
      
      if (result.error) {
        onError?.(result.error);
      } else {
        onExpenseParsed?.(result);
        setInput(''); // Clear input on successful parse
      }
    } catch (error) {
      console.error('NL parsing error:', error);
      
      if (error instanceof AIServiceError) {
        if (error.code === 'RATE_LIMIT') {
          onError?.('Rate limit reached. Please wait a moment and try again.');
        } else if (error.code === 'API_KEY_INVALID') {
          onError?.('AI service configuration error. Please check your API key.');
        } else {
          onError?.('AI service temporarily unavailable. Please use manual entry.');
        }
      } else {
        onError?.('Failed to parse expense. Please try rephrasing or use manual entry.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle Enter key press
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleParse();
    }
  };

  /**
   * Insert example into input
   */
  const insertExample = (example) => {
    setInput(example);
    setShowExamples(false);
    inputRef.current?.focus();
  };

  /**
   * Get random placeholder
   */
  const getRandomPlaceholder = () => {
    if (examples.length > 0) {
      return examples[Math.floor(Math.random() * examples.length)];
    }
    return placeholder;
  };

  const isProcessing = isLoading || externalLoading;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">Smart Expense Entry</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Describe your expense in natural language
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Input Field */}
        <div className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={getRandomPlaceholder()}
            disabled={isProcessing}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     placeholder-gray-500 dark:placeholder-gray-400
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     disabled:opacity-50 disabled:cursor-not-allowed
                     resize-none"
            rows={2}
          />
          
          {/* Character count */}
          {input.length > 0 && (
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {input.length}/200
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300
                     flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {showExamples ? 'Hide examples' : 'Show examples'}
          </button>

          <button
            onClick={handleParse}
            disabled={!input.trim() || isProcessing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400
                     text-white rounded-md font-medium text-sm
                     disabled:cursor-not-allowed transition-colors
                     flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Parsing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Parse Expense
              </>
            )}
          </button>
        </div>

        {/* Examples */}
        {showExamples && examples.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Example phrases:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {examples.slice(0, 6).map((example, index) => (
                <button
                  key={index}
                  onClick={() => insertExample(example)}
                  className="text-left p-2 text-sm bg-gray-50 dark:bg-gray-700 
                           hover:bg-gray-100 dark:hover:bg-gray-600
                           rounded border border-gray-200 dark:border-gray-600
                           text-gray-700 dark:text-gray-300
                           transition-colors"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>💡 <strong>Tips:</strong> Include amount, what you bought, and when (optional)</p>
          <p>Press Enter to parse, or click examples above for inspiration</p>
        </div>
      </div>
    </div>
  );
};

export default NLExpenseInput;
