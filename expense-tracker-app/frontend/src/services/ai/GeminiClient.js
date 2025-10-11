import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Gemini API Client with rate limiting and error handling
 * Supports Gemini 2.5 Flash model for AI-powered expense tracking features
 */
class GeminiClient {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    this.visionModel = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    // Rate limiting (60 requests per minute for free tier)
    this.requestCount = 0;
    this.resetTime = Date.now() + 60000;
  }

  /**
   * Check rate limits before making API calls
   */
  async checkRateLimit() {
    const now = Date.now();
    
    // Reset counter if window expired
    if (now >= this.resetTime) {
      this.requestCount = 0;
      this.resetTime = now + 60000;
    }
    
    // Check if limit exceeded
    if (this.requestCount >= 60) {
      const waitTime = Math.ceil((this.resetTime - now) / 1000);
      throw new AIServiceError(
        `Rate limit exceeded. Please wait ${waitTime} seconds.`,
        'RATE_LIMIT',
        true
      );
    }
    
    this.requestCount++;
  }

  /**
   * Generate text content using Gemini model
   */
  async generateText(prompt, options = {}) {
    await this.checkRateLimit();
    
    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options.temperature || 0.1,
          topK: options.topK || 40,
          topP: options.topP || 0.95,
          maxOutputTokens: options.maxOutputTokens || 1024,
        },
      });
      
      const response = await result.response;
      return response.text();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generate content from image using Gemini Vision
   */
  async generateFromImage(imageData, prompt, options = {}) {
    await this.checkRateLimit();
    
    try {
      // Convert image data to proper format
      const imagePart = {
        inlineData: {
          data: imageData.split(',')[1], // Remove data:image/jpeg;base64, prefix
          mimeType: this.getMimeType(imageData)
        }
      };
      
      const result = await this.visionModel.generateContent({
        contents: [{ 
          role: 'user', 
          parts: [{ text: prompt }, imagePart] 
        }],
        generationConfig: {
          temperature: options.temperature || 0.1,
          topK: options.topK || 40,
          topP: options.topP || 0.95,
          maxOutputTokens: options.maxOutputTokens || 1024,
        },
      });
      
      const response = await result.response;
      return response.text();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Extract MIME type from data URL
   */
  getMimeType(dataUrl) {
    const match = dataUrl.match(/^data:([^;]+);base64,/);
    return match ? match[1] : 'image/jpeg';
  }

  /**
   * Handle and categorize API errors
   */
  handleError(error) {
    console.error('Gemini API Error:', error);
    
    if (error.message?.includes('API key')) {
      return new AIServiceError('Invalid API key', 'API_KEY_INVALID', false);
    }
    
    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      return new AIServiceError('Rate limit exceeded', 'RATE_LIMIT', true);
    }
    
    if (error.message?.includes('network') || error.code === 'NETWORK_ERROR') {
      return new AIServiceError('Network error', 'NETWORK_ERROR', true);
    }
    
    return new AIServiceError(
      error.message || 'Unknown AI service error',
      'UNKNOWN',
      false
    );
  }
}

/**
 * Custom error class for AI service errors
 */
class AIServiceError extends Error {
  constructor(message, code, retryable = false) {
    super(message);
    this.name = 'AIServiceError';
    this.code = code;
    this.retryable = retryable;
  }
}

/**
 * Retry wrapper for AI operations
 */
async function withRetry(fn, maxRetries = 3, backoffMs = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof AIServiceError && error.retryable && attempt < maxRetries) {
        // Exponential backoff
        const delay = backoffMs * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

export { GeminiClient, AIServiceError, withRetry };
