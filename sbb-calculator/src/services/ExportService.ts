import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export class ExportService {
  static async exportToPDF(): Promise<void> {
    try {
      const resultsElement = document.getElementById('calculation-results');
      if (!resultsElement) {
        throw new Error('Results element not found');
      }

      const canvas = await html2canvas(resultsElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      } as any);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('sbb-calculator-results.pdf');
    } catch (error) {
      console.error('Export to PDF failed:', error);
      throw new Error('Failed to export to PDF');
    }
  }

  static exportToJSON(data: any, filename: string = 'sbb-calculator-data.json'): void {
    try {
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export to JSON failed:', error);
      throw new Error('Failed to export to JSON');
    }
  }

  static exportToCSV(routes: any[], filename: string = 'sbb-routes.csv'): void {
    try {
      const headers = ['Route', 'Trips per Week/Month', 'Cost per Trip (CHF)', 'Duration (Months)', 'Frequency', 'Is Halbtax Price'];
      const csvContent = [
        headers.join(','),
        ...routes.map((route, index) => [
          `Route ${index + 1}`,
          route.trips,
          route.cost,
          route.durationMonths,
          route.frequencyType,
          route.isHalbtaxPrice ? 'Yes' : 'No'
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export to CSV failed:', error);
      throw new Error('Failed to export to CSV');
    }
  }
}