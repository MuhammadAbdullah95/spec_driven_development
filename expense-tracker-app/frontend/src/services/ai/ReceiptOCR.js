import { GeminiClient, AIServiceError, withRetry } from './GeminiClient.js';

/**
 * Receipt OCR service using Gemini Vision
 * Extracts merchant, amount, date, and category from receipt images
 */
class ReceiptOCR {
  constructor(apiKey) {
    this.client = new GeminiClient(apiKey);
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  }

  /**
   * Extract expense data from receipt image
   */
  async extractFromImage(imageFile) {
    try {
      // Validate image
      this.validateImage(imageFile);
      
      // Convert to base64 if needed
      const imageData = await this.processImage(imageFile);
      
      // Extract data using Gemini Vision
      const prompt = this.buildOCRPrompt();
      const response = await withRetry(() => 
        this.client.generateFromImage(imageData, prompt, { temperature: 0.1 })
      );
      
      return this.parseOCRResponse(imageData, response);
    } catch (error) {
      console.error('Receipt OCR error:', error);
      return this.createErrorResult(imageFile, error.message);
    }
  }

  /**
   * Validate image file
   */
  validateImage(imageFile) {
    if (imageFile instanceof File) {
      if (imageFile.size > this.maxFileSize) {
        throw new ImageTooLargeError(imageFile.size);
      }
      
      if (!this.supportedFormats.includes(imageFile.type)) {
        throw new AIServiceError(
          `Unsupported image format: ${imageFile.type}. Supported: ${this.supportedFormats.join(', ')}`,
          'PARSE_ERROR',
          false
        );
      }
    } else if (typeof imageFile === 'string') {
      // Assume it's a data URL
      if (!imageFile.startsWith('data:image/')) {
        throw new AIServiceError('Invalid image data format', 'PARSE_ERROR', false);
      }
    } else {
      throw new AIServiceError('Invalid image input', 'PARSE_ERROR', false);
    }
  }

  /**
   * Process image file to base64 data URL
   */
  async processImage(imageFile) {
    if (typeof imageFile === 'string') {
      return imageFile; // Already a data URL
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(imageFile);
    });
  }

  /**
   * Preprocess image for better OCR accuracy
   */
  async preprocessImage(imageFile) {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          // Resize if too large (max 1024px on longest side)
          const maxSize = 1024;
          let { width, height } = img;
          
          if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            width *= ratio;
            height *= ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and enhance contrast
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to data URL
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        
        if (imageFile instanceof File) {
          const reader = new FileReader();
          reader.onload = () => img.src = reader.result;
          reader.readAsDataURL(imageFile);
        } else {
          img.src = imageFile;
        }
      });
    } catch (error) {
      console.warn('Image preprocessing failed, using original:', error);
      return this.processImage(imageFile);
    }
  }

  /**
   * Build OCR prompt for Gemini Vision
   */
  buildOCRPrompt() {
    return `You are an AI assistant that extracts expense information from receipt images.

Analyze this receipt image and extract the following information. Return ONLY a valid JSON object:

{
  "merchant": string or null,
  "amount": number or null,
  "date": string or null (ISO 8601 format),
  "categoryHint": string or null,
  "language": "English" or "Other",
  "confidence": {
    "merchant": number between 0.0 and 1.0,
    "amount": number between 0.0 and 1.0,
    "date": number between 0.0 and 1.0,
    "category": number between 0.0 and 1.0
  }
}

Instructions:
- Extract the merchant/business name (clean, no extra text)
- Find the TOTAL amount (not individual items, just the final total)
- Extract the transaction date (convert to ISO 8601 format YYYY-MM-DD)
- Suggest a category from: Food, Transport, Shopping, Bills, Entertainment, Health, Other
- Set language to "English" only if the receipt is clearly in English, otherwise "Other"
- Set confidence scores based on how clearly you can read each field
- If you cannot read something clearly, set it to null and give low confidence

Focus on accuracy over completeness. If text is unclear or blurry, mark confidence as low.

Return only the JSON object, no other text:`;
  }

  /**
   * Parse OCR response from Gemini
   */
  parseOCRResponse(imageData, response) {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in OCR response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Check language support
      if (parsed.language === 'Other') {
        throw new UnsupportedLanguageError();
      }

      // Validate structure
      if (!this.isValidOCRData(parsed)) {
        throw new Error('Invalid OCR response structure');
      }

      return {
        rawInput: imageData,
        inputType: 'image',
        extractedFields: {
          merchant: this.processMerchant(parsed.merchant),
          amount: this.processAmount(parsed.amount),
          date: this.processDate(parsed.date),
          categoryHint: this.processCategory(parsed.categoryHint)
        },
        confidence: {
          merchant: Math.max(0, Math.min(1, parsed.confidence?.merchant || 0)),
          amount: Math.max(0, Math.min(1, parsed.confidence?.amount || 0)),
          date: Math.max(0, Math.min(1, parsed.confidence?.date || 0)),
          category: Math.max(0, Math.min(1, parsed.confidence?.category || 0))
        },
        language: parsed.language || 'English',
        parseTimestamp: new Date().toISOString(),
        error: null
      };
    } catch (error) {
      if (error instanceof UnsupportedLanguageError) {
        throw error;
      }
      console.error('OCR response parsing error:', error);
      return this.createErrorResult(imageData, 'Failed to parse OCR response');
    }
  }

  /**
   * Validate OCR data structure
   */
  isValidOCRData(data) {
    return data && 
           typeof data === 'object' &&
           data.hasOwnProperty('merchant') &&
           data.hasOwnProperty('amount') &&
           data.hasOwnProperty('date') &&
           data.hasOwnProperty('categoryHint') &&
           data.confidence &&
           typeof data.confidence === 'object';
  }

  /**
   * Process merchant name
   */
  processMerchant(merchant) {
    if (!merchant || typeof merchant !== 'string') return null;
    
    return merchant.trim().substring(0, 100); // Limit length
  }

  /**
   * Process amount (same as NLP parser)
   */
  processAmount(amount) {
    if (amount === null || amount === undefined) return null;
    
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return null;
    
    return Math.round(num * 100) / 100;
  }

  /**
   * Process date (same as NLP parser)
   */
  processDate(date) {
    if (!date) return new Date().toISOString();
    
    try {
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) {
        // Don't allow future dates
        if (parsed > new Date()) {
          return new Date().toISOString();
        }
        return parsed.toISOString();
      }
    } catch (error) {
      console.warn('Date parsing error:', error);
    }
    
    return new Date().toISOString();
  }

  /**
   * Process category hint
   */
  processCategory(category) {
    if (!category || typeof category !== 'string') return null;
    
    const validCategories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'];
    const normalized = category.trim();
    
    const match = validCategories.find(cat => 
      cat.toLowerCase() === normalized.toLowerCase()
    );
    
    return match || null;
  }

  /**
   * Create error result structure
   */
  createErrorResult(imageInput, errorMessage) {
    return {
      rawInput: typeof imageInput === 'string' ? imageInput : '[File object]',
      inputType: 'image',
      extractedFields: {
        merchant: null,
        amount: null,
        date: null,
        categoryHint: null
      },
      confidence: {
        merchant: 0,
        amount: 0,
        date: 0,
        category: 0
      },
      language: 'English',
      parseTimestamp: new Date().toISOString(),
      error: errorMessage
    };
  }
}

/**
 * Custom error for large images
 */
class ImageTooLargeError extends AIServiceError {
  constructor(size) {
    const sizeMB = (size / (1024 * 1024)).toFixed(1);
    super(`Image size ${sizeMB}MB exceeds 10MB limit`, 'PARSE_ERROR', false);
    this.name = 'ImageTooLargeError';
  }
}

/**
 * Custom error for unsupported languages
 */
class UnsupportedLanguageError extends AIServiceError {
  constructor() {
    super('Only English-language receipts are supported', 'PARSE_ERROR', false);
    this.name = 'UnsupportedLanguageError';
  }
}

export default ReceiptOCR;
export { ImageTooLargeError, UnsupportedLanguageError };
