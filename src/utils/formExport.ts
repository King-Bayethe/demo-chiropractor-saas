import jsPDF from 'jspdf';
import { format } from 'date-fns';

interface FormSubmission {
  id: string;
  form_type: string;
  form_data: any;
  submitted_at: string;
  patient_name: string | null;
  patient_email: string | null;
  patient_phone: string | null;
  status: string;
}

export const exportFormToCSV = (submission: FormSubmission) => {
  const flattenObject = (obj: any, prefix = ''): Record<string, any> => {
    const flattened: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(flattened, flattenObject(value, newKey));
      } else if (Array.isArray(value)) {
        flattened[newKey] = value.join('; ');
      } else {
        flattened[newKey] = value;
      }
    }
    
    return flattened;
  };

  const flatData = {
    submission_id: submission.id,
    form_type: submission.form_type,
    patient_name: submission.patient_name,
    patient_email: submission.patient_email,
    patient_phone: submission.patient_phone,
    status: submission.status,
    submitted_at: submission.submitted_at,
    ...flattenObject(submission.form_data)
  };

  const csvHeader = Object.keys(flatData).join(',');
  const csvRow = Object.values(flatData).map(value => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }).join(',');

  const csvContent = `${csvHeader}\n${csvRow}`;
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `form_submission_${submission.id}_${format(new Date(submission.submitted_at), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportFormToPDF = (submission: FormSubmission) => {
  const doc = new jsPDF();
  let yPosition = 20;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const lineHeight = 7;

  // Helper function to add text with word wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize = 12) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    
    for (let i = 0; i < lines.length; i++) {
      if (y + (i * lineHeight) > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(lines[i], x, y + (i * lineHeight));
    }
    
    return y + (lines.length * lineHeight);
  };

  // Helper function to check if new page is needed
  const checkNewPage = (additionalHeight = 20) => {
    if (yPosition + additionalHeight > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Form Submission Details', margin, yPosition);
  yPosition += 15;

  // Submission metadata
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  const metadata = [
    `Submission ID: ${submission.id}`,
    `Form Type: ${submission.form_type.toUpperCase()}`,
    `Patient: ${submission.patient_name || 'N/A'}`,
    `Email: ${submission.patient_email || 'N/A'}`,
    `Phone: ${submission.patient_phone || 'N/A'}`,
    `Status: ${submission.status}`,
    `Submitted: ${format(new Date(submission.submitted_at), 'PPP p')}`
  ];

  metadata.forEach(line => {
    checkNewPage();
    doc.text(line, margin, yPosition);
    yPosition += lineHeight;
  });

  yPosition += 10;

  // Form data
  const renderFormData = (data: any, prefix = '') => {
    for (const [key, value] of Object.entries(data)) {
      const displayKey = prefix + key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      
      checkNewPage(15);
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Section header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(displayKey, margin, yPosition);
        yPosition += 10;
        
        // Render nested data
        renderFormData(value, '  ');
        yPosition += 5;
      } else if (Array.isArray(value) && value.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(`${displayKey}:`, margin, yPosition);
        yPosition += lineHeight;
        
        doc.setFont('helvetica', 'normal');
        const arrayText = value.join(', ');
        yPosition = addWrappedText(arrayText, margin + 10, yPosition, 170, 10);
        yPosition += 3;
      } else if (value !== null && value !== undefined && value !== '' && value !== false) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(`${displayKey}:`, margin, yPosition);
        
        doc.setFont('helvetica', 'normal');
        const valueText = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
        yPosition = addWrappedText(valueText, margin + 80, yPosition, 110, 10);
        yPosition += 3;
      }
    }
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Form Data', margin, yPosition);
  yPosition += 15;

  renderFormData(submission.form_data);

  // Save the PDF
  doc.save(`form_submission_${submission.id}_${format(new Date(submission.submitted_at), 'yyyy-MM-dd')}.pdf`);
};

export const exportMultipleFormsToCSV = (submissions: FormSubmission[]) => {
  if (submissions.length === 0) return;

  // Get all unique keys from all form submissions
  const allKeys = new Set<string>();
  const processedData: Record<string, any>[] = [];

  const flattenObject = (obj: any, prefix = ''): Record<string, any> => {
    const flattened: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(flattened, flattenObject(value, newKey));
      } else if (Array.isArray(value)) {
        flattened[newKey] = value.join('; ');
      } else {
        flattened[newKey] = value;
      }
    }
    
    return flattened;
  };

  // Process each submission
  submissions.forEach(submission => {
    const flatData = {
      submission_id: submission.id,
      form_type: submission.form_type,
      patient_name: submission.patient_name,
      patient_email: submission.patient_email,
      patient_phone: submission.patient_phone,
      status: submission.status,
      submitted_at: submission.submitted_at,
      ...flattenObject(submission.form_data)
    };

    Object.keys(flatData).forEach(key => allKeys.add(key));
    processedData.push(flatData);
  });

  // Create CSV content
  const sortedKeys = Array.from(allKeys).sort();
  const csvHeader = sortedKeys.join(',');
  
  const csvRows = processedData.map(row => {
    return sortedKeys.map(key => {
      const value = row[key];
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });

  const csvContent = `${csvHeader}\n${csvRows.join('\n')}`;
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `form_submissions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};