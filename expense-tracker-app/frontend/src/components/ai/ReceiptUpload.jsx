import React, { useState, useRef } from 'react';
import { AIServiceError, ImageTooLargeError, UnsupportedLanguageError } from '../../services/ai/index.js';

/**
 * Receipt Upload Component
 * Allows users to upload receipt images for AI-powered data extraction
 */
const ReceiptUpload = ({ 
  onReceiptParsed, 
  onError, 
  receiptOCR, 
  isLoading: externalLoading = false 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const isProcessing = isLoading || externalLoading;

  /**
   * Handle file selection
   */
  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      onError?.('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewImage(e.target.result);
    reader.readAsDataURL(file);

    // Process with OCR
    await processReceipt(file);
  };

  /**
   * Process receipt with OCR
   */
  const processReceipt = async (file) => {
    if (!receiptOCR) {
      onError?.('Receipt scanning service not available');
      return;
    }

    setIsLoading(true);

    try {
      // Preprocess image for better OCR accuracy
      const preprocessedImage = await receiptOCR.preprocessImage(file);
      
      // Extract data using OCR
      const result = await receiptOCR.extractFromImage(preprocessedImage);
      
      if (result.error) {
        onError?.(result.error);
      } else {
        onReceiptParsed?.(result);
      }
    } catch (error) {
      console.error('Receipt OCR error:', error);
      
      if (error instanceof ImageTooLargeError) {
        onError?.('Image is too large. Please use an image smaller than 10MB.');
      } else if (error instanceof UnsupportedLanguageError) {
        onError?.('Only English-language receipts are supported. Please enter the expense manually.');
      } else if (error instanceof AIServiceError) {
        if (error.code === 'RATE_LIMIT') {
          onError?.('Rate limit reached. Please wait a moment and try again.');
        } else if (error.code === 'API_KEY_INVALID') {
          onError?.('AI service configuration error. Please check your API key.');
        } else {
          onError?.('Receipt scanning temporarily unavailable. Please enter manually.');
        }
      } else {
        onError?.('Failed to scan receipt. Please try again or enter manually.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle drag events
   */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  /**
   * Handle drop event
   */
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  /**
   * Handle file input change
   */
  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  /**
   * Open file picker
   */
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  /**
   * Clear preview
   */
  const clearPreview = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">Receipt Scanner</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Upload a receipt photo to extract expense details
          </p>
        </div>
      </div>

      {/* Preview Image */}
      {previewImage && (
        <div className="mb-4 relative">
          <img
            src={previewImage}
            alt="Receipt preview"
            className="max-w-full h-48 object-contain mx-auto rounded border border-gray-200 dark:border-gray-600"
          />
          <button
            onClick={clearPreview}
            className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!isProcessing ? openFilePicker : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleInputChange}
          disabled={isProcessing}
          className="hidden"
        />

        {isProcessing ? (
          <div className="flex flex-col items-center">
            <svg className="animate-spin w-8 h-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Scanning receipt...
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This may take a few seconds
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {dragActive ? 'Drop receipt here' : 'Upload receipt photo'}
            </p>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Drag & drop or click to select • JPEG, PNG, WebP • Max 10MB
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
                Camera
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Files
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>📸 <strong>Best results:</strong> Clear, well-lit photos with readable text</p>
        <p>🌍 <strong>Language:</strong> English receipts only (other languages will be rejected)</p>
        <p>✨ <strong>AI extracts:</strong> Merchant name, total amount, date, and suggests category</p>
      </div>
    </div>
  );
};

export default ReceiptUpload;
