// AI Services Export Module
// Provides centralized access to all AI-powered features

import { GeminiClient, AIServiceError, withRetry } from './GeminiClient.js';
import NLPParser from './NLPParser.js';
import ReceiptOCR, { ImageTooLargeError, UnsupportedLanguageError } from './ReceiptOCR.js';
import ChatService from './ChatService.js';
import BudgetAdvisor, { InsufficientDataError } from './BudgetAdvisor.js';

/**
 * AI Services Manager
 * Centralized manager for all AI services with shared API key and error handling
 */
class AIServicesManager {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Gemini API key is required for AI services');
    }

    this.apiKey = apiKey;
    this.isInitialized = false;
    this.services = {};
  }

  /**
   * Initialize all AI services
   */
  async initialize() {
    try {
      this.services = {
        nlpParser: new NLPParser(this.apiKey),
        receiptOCR: new ReceiptOCR(this.apiKey),
        chatService: new ChatService(this.apiKey),
        budgetAdvisor: new BudgetAdvisor(this.apiKey)
      };

      this.isInitialized = true;
      console.log('AI Services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AI services:', error);
      throw error;
    }
  }

  /**
   * Get NLP Parser service
   */
  getNLPParser() {
    this.checkInitialization();
    return this.services.nlpParser;
  }

  /**
   * Get Receipt OCR service
   */
  getReceiptOCR() {
    this.checkInitialization();
    return this.services.receiptOCR;
  }

  /**
   * Get Chat service
   */
  getChatService() {
    this.checkInitialization();
    return this.services.chatService;
  }

  /**
   * Get Budget Advisor service
   */
  getBudgetAdvisor() {
    this.checkInitialization();
    return this.services.budgetAdvisor;
  }

  /**
   * Check if services are initialized
   */
  checkInitialization() {
    if (!this.isInitialized) {
      throw new Error('AI services not initialized. Call initialize() first.');
    }
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      const client = new GeminiClient(this.apiKey);
      await client.generateText('Hello', { maxOutputTokens: 10 });
      return { success: true, message: 'API connection successful' };
    } catch (error) {
      return { 
        success: false, 
        message: error.message,
        code: error.code || 'UNKNOWN'
      };
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      services: Object.keys(this.services),
      apiKeyConfigured: !!this.apiKey
    };
  }
}

// Export all services and utilities
export {
  AIServicesManager,
  GeminiClient,
  NLPParser,
  ReceiptOCR,
  ChatService,
  BudgetAdvisor,
  AIServiceError,
  ImageTooLargeError,
  UnsupportedLanguageError,
  InsufficientDataError,
  withRetry
};

// Default export
export default AIServicesManager;
