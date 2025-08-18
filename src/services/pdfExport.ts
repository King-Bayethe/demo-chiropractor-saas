import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SOAPNote } from '../hooks/useSOAPNotes';
import { SOAPFormData } from '../components/soap/ComprehensiveSOAPForm';

export interface PDFExportOptions {
  includeHeader?: boolean;
  includeFooter?: boolean;
  watermark?: string;
  fontSize?: number;
  pageMargin?: number;
}

export class SOAPNotePDFExporter {
  private pdf: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private yPosition: number;
  private fontSize: number;

  constructor(options: PDFExportOptions = {}) {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
    this.margin = options.pageMargin || 20;
    this.yPosition = this.margin;
    this.fontSize = options.fontSize || 10;
  }

  private addHeader(patientName: string, dateOfService: string) {
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('SOAP NOTE', this.pageWidth / 2, this.yPosition, { align: 'center' });
    this.yPosition += 8;

    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`Patient: ${patientName}`, this.margin, this.yPosition);
    this.pdf.text(`Date of Service: ${dateOfService}`, this.pageWidth - this.margin, this.yPosition, { align: 'right' });
    this.yPosition += 10;

    // Add line separator
    this.pdf.line(this.margin, this.yPosition, this.pageWidth - this.margin, this.yPosition);
    this.yPosition += 8;
  }

  private addFooter() {
    const footerY = this.pageHeight - 15;
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(
      `Generated on ${new Date().toLocaleDateString()} - Confidential Medical Record`,
      this.pageWidth / 2,
      footerY,
      { align: 'center' }
    );
  }

  private addSection(title: string, content: any, isMainSection = true) {
    this.checkPageBreak(isMainSection ? 30 : 20);

    // Section header
    this.pdf.setFontSize(isMainSection ? 14 : 12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(title, this.margin, this.yPosition);
    this.yPosition += isMainSection ? 8 : 6;

    // Reset font for content
    this.pdf.setFontSize(this.fontSize);
    this.pdf.setFont('helvetica', 'normal');

    if (typeof content === 'string' && content.trim()) {
      this.addWrappedText(content);
    } else if (typeof content === 'object' && content !== null) {
      this.addObjectContent(content);
    }

    this.yPosition += isMainSection ? 8 : 4;
  }

  private addObjectContent(obj: any) {
    Object.entries(obj).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        const label = this.formatLabel(key);
        
        if (Array.isArray(value) && value.length > 0) {
          this.checkPageBreak(15);
          this.pdf.setFont('helvetica', 'bold');
          this.pdf.text(`${label}:`, this.margin + 5, this.yPosition);
          this.yPosition += 5;
          
          this.pdf.setFont('helvetica', 'normal');
          value.forEach((item, index) => {
            this.checkPageBreak(8);
            const bullet = `• ${typeof item === 'object' ? this.formatObjectItem(item) : item}`;
            this.addWrappedText(bullet, this.margin + 10);
          });
        } else if (typeof value === 'object' && value !== null) {
          this.checkPageBreak(10);
          this.pdf.setFont('helvetica', 'bold');
          this.pdf.text(`${label}:`, this.margin + 5, this.yPosition);
          this.yPosition += 5;
          
          this.pdf.setFont('helvetica', 'normal');
          this.addObjectContent(value);
        } else if (value.toString().trim()) {
          this.checkPageBreak(8);
          this.pdf.setFont('helvetica', 'bold');
          this.pdf.text(`${label}:`, this.margin + 5, this.yPosition);
          this.pdf.setFont('helvetica', 'normal');
          this.pdf.text(value.toString(), this.margin + 40, this.yPosition);
          this.yPosition += 5;
        }
      }
    });
  }

  private formatLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  private formatObjectItem(item: any): string {
    if (typeof item === 'object') {
      return Object.entries(item)
        .filter(([_, value]) => value !== null && value !== undefined && value !== '')
        .map(([key, value]) => `${this.formatLabel(key)}: ${value}`)
        .join(', ');
    }
    return item.toString();
  }

  private addWrappedText(text: string, leftMargin = this.margin) {
    const maxWidth = this.pageWidth - leftMargin - this.margin;
    const lines = this.pdf.splitTextToSize(text, maxWidth);
    
    lines.forEach((line: string) => {
      this.checkPageBreak(5);
      this.pdf.text(line, leftMargin, this.yPosition);
      this.yPosition += 5;
    });
  }

  private checkPageBreak(requiredSpace: number) {
    if (this.yPosition + requiredSpace > this.pageHeight - 30) {
      this.pdf.addPage();
      this.yPosition = this.margin;
    }
  }

  exportSOAPNote(note: SOAPNote, patientName: string): void {
    const dateOfService = new Date(note.date_of_service).toLocaleDateString();
    
    this.addHeader(patientName, dateOfService);

    // Chief Complaint
    if (note.chief_complaint) {
      this.addSection('CHIEF COMPLAINT', note.chief_complaint);
    }

    // Subjective
    if (note.subjective_data) {
      this.addSection('SUBJECTIVE', note.subjective_data);
    }

    // Objective
    if (note.objective_data) {
      this.addSection('OBJECTIVE', note.objective_data);
    }

    // Assessment
    if (note.assessment_data) {
      this.addSection('ASSESSMENT', note.assessment_data);
    }

    // Plan
    if (note.plan_data) {
      this.addSection('PLAN', note.plan_data);
    }

    // Provider information
    this.yPosition += 10;
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`Provider: ${note.provider_name}`, this.margin, this.yPosition);
    this.pdf.text(`Date Created: ${new Date(note.created_at).toLocaleDateString()}`, this.pageWidth - this.margin, this.yPosition, { align: 'right' });

    this.addFooter();

    // Save the PDF
    const filename = `SOAP_Note_${patientName.replace(/\s+/g, '_')}_${dateOfService.replace(/\//g, '-')}.pdf`;
    this.pdf.save(filename);
  }

  exportSOAPFormData(formData: SOAPFormData, patientName: string): void {
    const dateOfService = formData.dateCreated.toLocaleDateString();
    
    this.addHeader(patientName, dateOfService);

    // Chief Complaint
    if (formData.chiefComplaint) {
      this.addSection('CHIEF COMPLAINT', formData.chiefComplaint);
    }

    // Subjective
    this.addSection('SUBJECTIVE', formData.subjective);

    // Objective
    this.addSection('OBJECTIVE', formData.objective);

    // Assessment
    this.addSection('ASSESSMENT', formData.assessment);

    // Plan
    this.addSection('PLAN', formData.plan);

    // Provider information
    this.yPosition += 10;
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`Provider: ${formData.providerName}`, this.margin, this.yPosition);
    this.pdf.text(`Date Created: ${dateOfService}`, this.pageWidth - this.margin, this.yPosition, { align: 'right' });

    this.addFooter();

    // Save the PDF
    const filename = `SOAP_Note_${patientName.replace(/\s+/g, '_')}_${dateOfService.replace(/\//g, '-')}.pdf`;
    this.pdf.save(filename);
  }
}

// Utility functions for quick exports
export const exportSOAPNoteToPDF = (note: SOAPNote, patientName: string, options?: PDFExportOptions) => {
  const exporter = new SOAPNotePDFExporter(options);
  exporter.exportSOAPNote(note, patientName);
};

export const exportSOAPFormDataToPDF = (formData: SOAPFormData, patientName: string, options?: PDFExportOptions) => {
  const exporter = new SOAPNotePDFExporter(options);
  exporter.exportSOAPFormData(formData, patientName);
};