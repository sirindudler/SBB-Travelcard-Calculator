import { useState, useCallback } from 'react';
import { PDFService, PDFProcessingResult } from '../services/PDFService';

export interface UsePDFProcessorReturn {
  isProcessing: boolean;
  error: string | null;
  result: PDFProcessingResult | null;
  processPDF: (file: File) => Promise<void>;
  clearResult: () => void;
}

export const usePDFProcessor = (): UsePDFProcessorReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PDFProcessingResult | null>(null);

  const processPDF = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      if (!file.type.includes('pdf')) {
        throw new Error('Please select a valid PDF file');
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        throw new Error('PDF file is too large (maximum 50MB)');
      }

      const processingResult = await PDFService.processPDF(file);
      
      if (!processingResult.success) {
        setError(processingResult.error || 'Failed to process PDF');
      } else {
        setResult(processingResult);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    isProcessing,
    error,
    result,
    processPDF,
    clearResult
  };
};