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
  AlertTriangle,
  Target,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import { useApp } from '../../context/AppContext.jsx';
import { aiService } from '../../services/aiService.js';
import NLPParser from '../../services/ai/NLPParser.js';

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
• **Add expenses** - Say "add $20 for food" or "spent $50 on groceries yesterday"
• **Analyze spending** - Get insights into your financial habits
• **Budget advice** - Personalized recommendations based on your data
• **Category insights** - Find areas to optimize spending
• **Future planning** - Help plan next month's budget

Try: *"add $15 for lunch"* or *"analyze my spending"*`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickActions = [
    { id: 'add-expense', label: 'add $15 for lunch', icon: PlusCircle },
    { id: 'spending-analysis', label: 'Analyze my spending patterns', icon: BarChart3 },
    { id: 'budget-advice', label: 'Give me budget advice', icon: Target },
    { id: 'category-insights', label: 'Which category should I reduce?', icon: AlertTriangle },
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

  // Parse natural language expense commands
  const parseExpenseCommand = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Check if it's an expense adding command
    const addPatterns = [
      /^add\s+\$?(\d+(?:\.\d{2})?)\s+(?:for|on)?\s*(.+)$/i,
      /^spent?\s+\$?(\d+(?:\.\d{2})?)\s+(?:for|on)?\s*(.+)$/i,
      /^paid?\s+\$?(\d+(?:\.\d{2})?)\s+(?:for|on)?\s*(.+)$/i,
      /^\$?(\d+(?:\.\d{2})?)\s+(?:for|on)\s+(.+)$/i,
    ];

    for (const pattern of addPatterns) {
      const match = message.match(pattern);
      if (match) {
        const amount = parseFloat(match[1]);
        const description = match[2].trim();
        
        // Categorize based on keywords
        let category = 'Other';
        if (/food|lunch|dinner|breakfast|coffee|restaurant|meal|pizza|burger/i.test(description)) {
          category = 'Food';
        } else if (/transport|uber|taxi|gas|bus|train|parking/i.test(description)) {
          category = 'Transport';
        } else if (/movie|game|entertainment|concert|ticket/i.test(description)) {
          category = 'Entertainment';
        } else if (/bill|rent|electricity|water|internet|phone/i.test(description)) {
          category = 'Bills';
        } else if (/shop|clothes|clothing|shoes|electronics/i.test(description)) {
          category = 'Shopping';
        } else if (/health|doctor|medicine|pharmacy|hospital/i.test(description)) {
          category = 'Health';
        }

        return {
          isExpense: true,
          amount,
          category,
          description: description.charAt(0).toUpperCase() + description.slice(1),
          date: new Date().toISOString().split('T')[0]
        };
      }
    }

    return { isExpense: false };
  };

  // Add expense to the system
  const addExpense = async (expenseData) => {
    try {
      await actions.addExpense(expenseData);
      return true;
    } catch (error) {
      console.error('Error adding expense:', error);
      return false;
    }
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
      // First, check if this is an expense adding command
      const expenseCommand = parseExpenseCommand(message);
      
      if (expenseCommand.isExpense) {
        // Add the expense
        const success = await addExpense({
          amount: expenseCommand.amount,
          category: expenseCommand.category,
          description: expenseCommand.description,
          date: expenseCommand.date
        });

        if (success) {
          const confirmMessage = {
            id: Date.now() + 1,
            type: 'assistant',
            content: `✅ **Expense Added Successfully!**

**Details:**
• **Amount:** $${expenseCommand.amount.toFixed(2)}
• **Category:** ${expenseCommand.category}
• **Description:** ${expenseCommand.description}
• **Date:** ${new Date(expenseCommand.date).toLocaleDateString()}

Your expense has been recorded. You can view it in your dashboard!

*Try: "analyze my spending" or "add another expense"*`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, confirmMessage]);
        } else {
          throw new Error('Failed to add expense');
        }
        
        setIsTyping(false);
        onSendMessage?.(message);
        return;
      }

      // If not an expense command, proceed with regular AI chat
      const savedSettings = localStorage.getItem('expenseTrackerSettings');
      const settings = savedSettings ? JSON.parse(savedSettings) : {};

      const expenseData = {
        expenses: state.expenses || [],
        categories: state.categories || [],
        settings: settings
      };

      const aiResponse = await aiService.generateChatResponse(message, expenseData);

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
      console.error('Error processing message:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: `❌ I encountered an error processing your request.

**What you can try:**
• Check your expense details and try again
• Ask me to analyze your spending
• Get budget recommendations
• View category insights

*Example: "add $20 for lunch" or "analyze my spending"*`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const handleQuickAction = async (action) => {
    await handleSendMessage(action.label);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

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
        fixed top-0 right-0 h-screen w-full md:w-[28rem] z-50 transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0
