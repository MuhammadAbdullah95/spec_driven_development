import React, { useState, useRef, useEffect } from 'react';
import { AIServiceError } from '../../services/ai/index.js';

/**
 * Chat Interface Component
 * Provides conversational AI for spending insights and queries
 */
const ChatInterface = ({ 
  chatService, 
  expenseContext, 
  onError,
  className = '' 
}) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate suggested questions when expense context changes
  useEffect(() => {
    if (chatService && expenseContext) {
      const suggestions = chatService.generateSuggestedQuestions(expenseContext);
      setSuggestedQuestions(suggestions);
    }
  }, [chatService, expenseContext]);

  /**
   * Send message to AI
   */
  const sendMessage = async (message = inputValue.trim()) => {
    if (!message || !chatService || !expenseContext) return;

    // Add user message
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get AI response
      const response = await chatService.query(message, expenseContext, messages);
      
      if (response.error) {
        onError?.(response.error);
      } else {
        setMessages(prev => [...prev, response]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your question. Please try again or rephrase your query.',
        timestamp: new Date().toISOString(),
        error: error.message
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      if (error instanceof AIServiceError) {
        if (error.code === 'RATE_LIMIT') {
          onError?.('Rate limit reached. Please wait a moment before asking another question.');
        } else if (error.code === 'API_KEY_INVALID') {
          onError?.('AI service configuration error. Please check your API key.');
        } else {
          onError?.('Chat service temporarily unavailable.');
        }
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
      sendMessage();
    }
  };

  /**
   * Clear chat history
   */
  const clearChat = () => {
    setMessages([]);
    chatService?.clearHistory();
  };

  /**
   * Format message content with basic markdown-like formatting
   */
  const formatMessageContent = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  };

  const hasMessages = messages.length > 0;
  const hasExpenseData = expenseContext?.expenses?.length > 0;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Spending Insights</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ask questions about your expenses
            </p>
          </div>
        </div>

        {hasMessages && (
          <button
            onClick={clearChat}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm"
          >
            Clear
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {!hasExpenseData ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Add some expenses first to start asking questions about your spending patterns.
            </p>
          </div>
        ) : !hasMessages ? (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Ask me anything about your spending! Here are some ideas:
            </p>
            <div className="grid grid-cols-1 gap-2">
              {suggestedQuestions.slice(0, 4).map((question, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(question)}
                  disabled={isLoading}
                  className="text-left p-3 text-sm bg-gray-50 dark:bg-gray-700 
                           hover:bg-gray-100 dark:hover:bg-gray-600
                           rounded-lg border border-gray-200 dark:border-gray-600
                           text-gray-700 dark:text-gray-300
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-colors"
                >
                  💬 {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <div
                    className="text-sm"
                    dangerouslySetInnerHTML={{
                      __html: formatMessageContent(message.content)
                    }}
                  />
                  <div className={`text-xs mt-1 opacity-70 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {hasExpenseData && (
        <div className="border-t border-gray-200 dark:border-gray-600 p-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your spending..."
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         placeholder-gray-500 dark:placeholder-gray-400
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         disabled:opacity-50 disabled:cursor-not-allowed
                         resize-none"
                rows={1}
                maxLength={500}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400
                       text-white rounded-md
                       disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Press Enter to send • Ask about spending patterns, categories, trends, and more
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
