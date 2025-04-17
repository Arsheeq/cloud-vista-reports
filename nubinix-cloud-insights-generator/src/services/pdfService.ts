
import axios from 'axios';
import { ReportConfig } from '../types';

export const pdfService = {
  generateReport: async (reportConfig: ReportConfig) => {
    try {
      const response = await axios.post('http://0.0.0.0:5000/generate-report', {
        provider: reportConfig.provider,
        credentials: reportConfig.credentials,
        selected_instances: reportConfig.instances,
        frequency: reportConfig.frequency || 'daily'
      }, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/pdf'
        },
        timeout: 30000,
        withCredentials: false
      });

      const filename = `${reportConfig.credentials.accountName}-${new Date().toISOString().split('T')[0]}.pdf`;
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.detail || error.message;
        console.error('API Error:', errorMessage);
        throw new Error(`Failed to generate PDF: ${errorMessage}`);
      }
      throw new Error('Failed to generate PDF report: Network error');
    }
  }
};
