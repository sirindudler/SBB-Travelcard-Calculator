import * as pdfjs from 'pdfjs-dist';

export interface PDFProcessingResult {
  success: boolean;
  yearlyAmount?: number;
  error?: string;
}

export class PDFService {
  static async processPDF(file: File): Promise<PDFProcessingResult> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + ' ';
      }

      const yearlyAmount = this.extractYearlyAmount(fullText);
      
      if (yearlyAmount !== null) {
        return {
          success: true,
          yearlyAmount
        };
      } else {
        return {
          success: false,
          error: 'Could not find yearly travel amount in PDF'
        };
      }
    } catch (error) {
      console.error('PDF processing error:', error);
      return {
        success: false,
        error: `Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static extractYearlyAmount(text: string): number | null {
    const patterns = [
      /(?:total|gesamt|montant|totale)[\s\S]*?(\d{1,3}(?:[,.\s]\d{3})*(?:[,.]\d{2})?)\s*(?:chf|fr\.?|franken)/gi,
      /(\d{1,3}(?:[,.\s]\d{3})*(?:[,.]\d{2})?)\s*(?:chf|fr\.?|franken)[\s\S]*?(?:total|gesamt|montant|totale)/gi,
      /jahres[\w\s]*betrag[\s\S]*?(\d{1,3}(?:[,.\s]\d{3})*(?:[,.]\d{2})?)/gi,
      /(\d{1,3}(?:[,.\s]\d{3})*(?:[,.]\d{2})?)\s*(?:chf|fr\.?|franken)/gi
    ];

    for (const pattern of patterns) {
      let match;
      const matches = [];
      while ((match = pattern.exec(text)) !== null) {
        matches.push(match);
        if (!pattern.global) break;
      }
      for (const match of matches) {
        const amountStr = match[1];
        const amount = this.parseAmount(amountStr);
        if (amount && amount >= 100 && amount <= 50000) {
          return amount;
        }
      }
    }

    return null;
  }

  private static parseAmount(amountStr: string): number {
    const cleanStr = amountStr
      .replace(/\s/g, '')
      .replace(/[,.](\d{2})$/, '.$1')
      .replace(/[,.]/g, '');
    
    const amount = parseFloat(cleanStr);
    return isNaN(amount) ? 0 : amount / (cleanStr.includes('.') ? 1 : 100);
  }
}