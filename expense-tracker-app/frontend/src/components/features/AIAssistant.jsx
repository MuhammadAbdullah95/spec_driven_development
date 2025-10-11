import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  TrendingUp,
  PlusCircle,
  BarChart3,
  Mic,
  AlertTriangle,
  Target,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import { useApp } from '../../context/AppContext.jsx';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters.js';
import { aiService } from '../../services/aiService.js';

const AIAssistant = ({
  isOpen,
  onClose,
  onSendMessage,
  className = ''
}) => {
  const { state, actions } = useApp();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: `Hi! I'm your **AI expense assistant**. I can help you with:

## What I can do:
• **Add expenses naturally** - Type "spent $20 on lunch" or "add $50 for groceries yesterday"
• **Analyze spending patterns** - Get insights into your financial habits
• **Budget recommendations** - Personalized advice based on your data
• **Category insights** - Find areas to optimize your spending
• **Future planning** - Help plan next month's budget

*How can I help you today?*`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isQuickActionsExpanded, setIsQuickActionsExpanded] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickActions = [
    { id: 'spending-analysis', label: 'Analyze my spending patterns', icon: BarChart3 },
    { id: 'budget-advice', label: 'Give me budget advice', icon: Target },
    { id: 'category-insights', label: 'Which category should I reduce?', icon: AlertTriangle },
    { id: 'future-planning', label: 'Help me plan next month', icon: Calendar },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 300);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Parse natural language expense input
  const parseExpenseFromMessage = (message) => {
    const lowerMessage = message.toLowerCase();

    // Check if it's an expense add command
    const expensePatterns = [
      /(?:add|spent|paid|bought)\s+\$?(\d+(?:\.\d{2})?)\s+(?:for|on)\s+(.+?)(?:\s+yesterday|\s+today|$)/i,
      /\$?(\d+(?:\.\d{2})?)\s+(?:for|on)\s+(.+?)(?:\s+yesterday|\s+today|$)/i,
      /(?:add|spent|paid)\s+(.+?)\s+\$?(\d+(?:\.\d{2})?)/i,
    ];

    let amount = null;
    let description = null;
    let date = new Date().toISOString().split('T')[0];

    // Check if message mentions yesterday
    if (lowerMessage.includes('yesterday')) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      date = yesterday.toISOString().split('T')[0];
    }

    // Try to match patterns
    for (const pattern of expensePatterns) {
      const match = message.match(pattern);
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

    if (!amount || !description) return null;

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

    return {
      amount: parseFloat(amount),
      category,
      description: description.trim().charAt(0).toUpperCase() + description.trim().slice(1),
      date
    };
  };

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // First, check if this is an expense add command
      const expenseData = parseExpenseFromMessage(message);

      if (expenseData) {
        // Add the expense
        const addedExpense = await actions.addExpense({
          ...expenseData,
          id: Date.now().toString()
        });

        // Show confirmation message
        const confirmationMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: `## ✅ Expense Added Successfully!

**Details:**
• **Amount:** $${expenseData.amount.toFixed(2)}
• **Category:** ${expenseData.category}
• **Description:** ${expenseData.description}
• **Date:** ${expenseData.date}

Your expense has been recorded and added to your tracking dashboard. You can view it in your expense list.

*Is there anything else I can help you with?*`,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, confirmationMessage]);
        setIsTyping(false);
        onSendMessage?.(message);
        return;
      }

      // If not an expense command, proceed with regular AI chat
      // Get user settings for context
      const savedSettings = localStorage.getItem('expenseTrackerSettings');
      const settings = savedSettings ? JSON.parse(savedSettings) : {};

      // Prepare expense data for AI context
      const contextData = {
        expenses: state.expenses || [],
        categories: state.categories || [],
        settings: settings
      };

      console.log('AI Assistant: Generating response for:', message);
      console.log('AI Assistant: Context data:', {
        expenseCount: contextData.expenses.length,
        categoryCount: contextData.categories.length,
        hasSettings: Object.keys(settings).length > 0
      });

      // Generate AI response using the AI service
      const aiResponse = await aiService.generateChatResponse(message, contextData);

      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);

      onSendMessage?.(message);
    } catch (error) {
      console.error('Error generating AI response:', error);

      // Fallback error message
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: `I apologize, but I'm having trouble processing your request right now. Please try again, or ask me something else about your expenses.

**I can help with:**
• Adding expenses (try "spent $20 on lunch")
• Analyzing your spending patterns
• Providing budget advice
• Category insights and recommendations
• Future planning assistance`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const handleQuickAction = async (action) => {
    // Use the regular message handling for quick actions
    // This ensures they get real AI responses too
    await handleSendMessage(action.label);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const FloatingButton = () => (
    <Button
      onClick={() => !isOpen && onClose()}
      className={`
        fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl
        bg-gradient-to-br from-primary to-secondary text-white
        hover:scale-110 hover:shadow-[0_20px_40px_rgba(14,165,233,0.4)]
        transition-all duration-300 animate-float
        ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
      `}
    >
      <MessageCircle size={24} />
    </Button>
  );

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* AI Assistant Panel */}
      <div className={`
        fixed top-0 right-0 h-screen w-96 z-50 transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        ${className}
      `}>
        <div className="h-full bg-gradient-to-br from-white via-sky-50/30 to-cyan-50/30 backdrop-blur-xl border-l border-sky-200/50 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-sky-100/50 flex items-center justify-between flex-shrink-0 bg-white/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-500/30">
                <MessageCircle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">AI Assistant</h3>
                <p className="text-sm text-sky-600">Natural language expense tracking</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full"
            >
              <X size={20} />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 animate-fadeIn ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.type === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Bot size={16} className="text-white" />
                  </div>
                )}

                <div className={`
                  max-w-[80%] p-4 rounded-2xl
                  ${message.type === 'user'
                    ? 'bg-gradient-to-br from-sky-500 to-cyan-500 text-white rounded-br-md shadow-md'
                    : 'bg-white/95 text-slate-800 rounded-bl-md shadow-md border border-sky-100/50'
                  }
                `}>
                  <div className="text-sm leading-relaxed">
                    {message.type === 'user' ? (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    ) : (
                      <MarkdownRenderer 
                        content={message.content} 
                        className="text-slate-800"
                      />
                    )}
                  </div>
                  <p className={`
                    text-xs mt-2 
                    ${message.type === 'user' ? 'text-primary-100' : 'text-slate-400'}
                  `}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>

                {message.type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-slate-600" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 animate-fadeIn">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-white/70 p-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions & Input */}
          <div className="border-t border-sky-100/50 bg-gradient-to-b from-white/70 to-white/90 flex-shrink-0">
            {/* Quick Actions Toggle Button */}
            <div className="p-4 pb-2">
              <button
                onClick={() => setIsQuickActionsExpanded(!isQuickActionsExpanded)}
                className="flex items-center justify-between w-full p-3 text-sm text-slate-700 hover:bg-sky-50 rounded-xl transition-all duration-200 group border border-sky-200 hover:border-sky-300 hover:shadow-sm"
              >
                <span className="font-medium text-sky-600">
                  {isQuickActionsExpanded ? 'Hide Quick Actions' : 'Show Quick Actions'}
                </span>
                {isQuickActionsExpanded ? (
                  <ChevronUp size={16} className="text-sky-600 transition-transform duration-200" />
                ) : (
                  <ChevronDown size={16} className="text-sky-600 transition-transform duration-200" />
                )}
              </button>

              {/* Quick Actions - Collapsible */}
              <div
                className={`grid grid-cols-1 gap-2 mt-2 overflow-hidden transition-all duration-300 ease-in-out ${
                  isQuickActionsExpanded
                    ? 'max-h-96 opacity-100'
                    : 'max-h-0 opacity-0'
                }`}
              >
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action)}
                      className="flex items-center gap-3 p-3 text-sm text-slate-700 hover:bg-sky-50 rounded-xl transition-all duration-200 text-left group border border-transparent hover:border-sky-200 hover:shadow-sm"
                    >
                      <div className="p-1.5 rounded-lg bg-sky-100 group-hover:bg-sky-200 transition-colors">
                        <Icon size={14} className="text-sky-600" />
                      </div>
                      <span className="truncate flex-1">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Section */}
            <div className="p-4 pt-2">
              <div className="mb-2">
                <p className="text-xs text-sky-600 font-medium px-1">Try: "spent $20 on lunch" or "add $50 for groceries"</p>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={isTyping}
                    className="w-full px-4 py-3 bg-white border-2 border-sky-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-500/20 focus:border-sky-400 text-sm placeholder-slate-400 text-slate-800 transition-all duration-200"
                  />
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isTyping}
                  className="px-4 py-3 flex-shrink-0 bg-gradient-to-br from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 shadow-lg shadow-sky-500/30"
                >
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIAssistant;
