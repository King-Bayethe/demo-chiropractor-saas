import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { SOAPNote } from '../hooks/useSOAPNotes';
import { SOAPFormData } from '../components/soap/ComprehensiveSOAPForm';

export interface PDFExportOptions {
  includeHeader?: boolean;
  includeFooter?: boolean;
  watermark?: string;
  fontSize?: number;
  pageMargin?: number;
  logoPath?: string;
  clinicName?: string;
  clinicAddress?: string;
}

interface VitalSigns {
  bloodPressure?: string;
  heartRate?: string;
  temperature?: string;
  respiratoryRate?: string;
  oxygenSaturation?: string;
  weight?: string;
  height?: string;
  bmi?: string;
}

export class SOAPNotePDFExporter {
  private pdf: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private yPosition: number;
  private fontSize: number;
  private options: PDFExportOptions;
  private primaryColor: [number, number, number] = [41, 128, 185]; // Professional blue
  private secondaryColor: [number, number, number] = [52, 73, 94]; // Dark gray
  private lightGray: [number, number, number] = [236, 240, 241]; // Light gray background

  constructor(options: PDFExportOptions = {}) {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
    this.margin = options.pageMargin || 25;
    this.yPosition = this.margin;
    this.fontSize = options.fontSize || 11;
    this.options = options;
  }

  private addHeader(patientName: string, dateOfService: string) {
    // Header background
    this.pdf.setFillColor(...this.primaryColor);
    this.pdf.rect(0, 0, this.pageWidth, 35, 'F');

    // Clinic name and info if provided
    if (this.options.clinicName) {
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFontSize(14);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(this.options.clinicName, this.margin, this.yPosition + 5);
      
      if (this.options.clinicAddress) {
        this.pdf.setFontSize(10);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.text(this.options.clinicAddress, this.margin, this.yPosition + 12);
      }
    }

    // Document title
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('SOAP NOTE', this.pageWidth - this.margin, this.yPosition + 8, { align: 'right' });
    
    this.yPosition = 45;
    this.pdf.setTextColor(0, 0, 0); // Reset to black

    // Patient information box
    this.pdf.setFillColor(...this.lightGray);
    this.pdf.rect(this.margin, this.yPosition, this.pageWidth - 2 * this.margin, 20, 'F');
    
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('PATIENT INFORMATION', this.margin + 5, this.yPosition + 7);
    
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`Patient: ${patientName}`, this.margin + 5, this.yPosition + 13);
    this.pdf.text(`Date of Service: ${dateOfService}`, this.pageWidth - this.margin - 5, this.yPosition + 13, { align: 'right' });
    
    this.yPosition += 30;
  }

  private addFooter() {
    const footerY = this.pageHeight - 20;
    
    // Footer line
    this.pdf.setDrawColor(...this.primaryColor);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.margin, footerY - 5, this.pageWidth - this.margin, footerY - 5);
    
    // Footer text
    this.pdf.setTextColor(...this.secondaryColor);
    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(
      `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
      this.margin,
      footerY
    );
    
    this.pdf.text(
      'Confidential Medical Record',
      this.pageWidth - this.margin,
      footerY,
      { align: 'right' }
    );
    
    // Page number
    const pageNumber = this.pdf.getNumberOfPages();
    this.pdf.text(
      `Page ${pageNumber}`,
      this.pageWidth / 2,
      footerY + 5,
      { align: 'center' }
    );
    
    this.pdf.setTextColor(0, 0, 0); // Reset to black
  }

  private addSection(title: string, content: any, isMainSection = true) {
    this.checkPageBreak(isMainSection ? 35 : 25);

    // Section header with background
    const headerHeight = 8;
    this.pdf.setFillColor(...this.primaryColor);
    this.pdf.rect(this.margin, this.yPosition - 2, this.pageWidth - 2 * this.margin, headerHeight, 'F');
    
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(isMainSection ? 13 : 11);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(title, this.margin + 3, this.yPosition + 3);
    this.yPosition += headerHeight + 3;
    
    this.pdf.setTextColor(0, 0, 0); // Reset to black

    // Content background for better readability
    const contentStartY = this.yPosition;
    
    // Reset font for content
    this.pdf.setFontSize(this.fontSize);
    this.pdf.setFont('helvetica', 'normal');

    if (typeof content === 'string' && content.trim()) {
      this.addWrappedText(content, this.margin + 5);
    } else if (typeof content === 'object' && content !== null) {
      this.addObjectContent(content);
    }

    // Add subtle border around content
    const contentHeight = this.yPosition - contentStartY;
    if (contentHeight > 0) {
      this.pdf.setDrawColor(200, 200, 200);
      this.pdf.setLineWidth(0.2);
      this.pdf.rect(this.margin, contentStartY - 2, this.pageWidth - 2 * this.margin, contentHeight + 4);
    }

    this.yPosition += isMainSection ? 10 : 6;
  }

  private addObjectContent(obj: any) {
    // Special handling for vital signs to display in a table format
    if (this.isVitalSigns(obj)) {
      this.addVitalSignsTable(obj);
      return;
    }

    Object.entries(obj).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        const label = this.formatLabel(key);
        
        if (Array.isArray(value) && value.length > 0) {
          this.checkPageBreak(20);
          
          // Subsection header
          this.pdf.setFillColor(245, 245, 245);
          this.pdf.rect(this.margin + 5, this.yPosition - 1, this.pageWidth - 2 * this.margin - 10, 6, 'F');
          
          this.pdf.setFont('helvetica', 'bold');
          this.pdf.setFontSize(this.fontSize + 1);
          this.pdf.text(`${label}:`, this.margin + 8, this.yPosition + 3);
          this.yPosition += 8;
          
          this.pdf.setFont('helvetica', 'normal');
          this.pdf.setFontSize(this.fontSize);
          
          value.forEach((item, index) => {
            this.checkPageBreak(6);
            const bullet = `• ${typeof item === 'object' ? this.formatObjectItem(item) : item}`;
            this.addWrappedText(bullet, this.margin + 12);
          });
          this.yPosition += 3;
          
        } else if (typeof value === 'object' && value !== null) {
          this.checkPageBreak(15);
          
          // Subsection header
          this.pdf.setFillColor(245, 245, 245);
          this.pdf.rect(this.margin + 5, this.yPosition - 1, this.pageWidth - 2 * this.margin - 10, 6, 'F');
          
          this.pdf.setFont('helvetica', 'bold');
          this.pdf.setFontSize(this.fontSize + 1);
          this.pdf.text(`${label}:`, this.margin + 8, this.yPosition + 3);
          this.yPosition += 8;
          
          this.pdf.setFont('helvetica', 'normal');
          this.pdf.setFontSize(this.fontSize);
          this.addObjectContent(value);
          
        } else if (value.toString().trim()) {
          this.checkPageBreak(6);
          
          // Field with proper spacing
          this.pdf.setFont('helvetica', 'bold');
          this.pdf.text(`${label}:`, this.margin + 8, this.yPosition);
          
          this.pdf.setFont('helvetica', 'normal');
          const textValue = value.toString();
          const maxWidth = this.pageWidth - this.margin - 55;
          const wrappedText = this.pdf.splitTextToSize(textValue, maxWidth);
          
          if (wrappedText.length === 1) {
            this.pdf.text(textValue, this.margin + 50, this.yPosition);
            this.yPosition += 5;
          } else {
            this.yPosition += 5;
            wrappedText.forEach((line: string) => {
              this.checkPageBreak(5);
              this.pdf.text(line, this.margin + 12, this.yPosition);
              this.yPosition += 4;
            });
          }
          this.yPosition += 2;
        }
      }
    });
  }

  private isVitalSigns(obj: any): obj is VitalSigns {
    const vitalSignsKeys = ['bloodPressure', 'heartRate', 'temperature', 'respiratoryRate', 'oxygenSaturation', 'weight', 'height', 'bmi'];
    return Object.keys(obj).some(key => vitalSignsKeys.includes(key));
  }

  private addVitalSignsTable(vitals: VitalSigns) {
    this.checkPageBreak(30);
    
    // Table header
    this.pdf.setFillColor(240, 240, 240);
    this.pdf.rect(this.margin + 8, this.yPosition, this.pageWidth - 2 * this.margin - 16, 7, 'F');
    
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(this.fontSize);
    this.pdf.text('Vital Signs', this.margin + 12, this.yPosition + 5);
    this.yPosition += 10;

    // Vital signs in a structured layout
    const vitalMappings = [
      { key: 'bloodPressure', label: 'Blood Pressure', unit: 'mmHg' },
      { key: 'heartRate', label: 'Heart Rate', unit: 'bpm' },
      { key: 'temperature', label: 'Temperature', unit: '°F' },
      { key: 'respiratoryRate', label: 'Respiratory Rate', unit: '/min' },
      { key: 'oxygenSaturation', label: 'O2 Saturation', unit: '%' },
      { key: 'weight', label: 'Weight', unit: 'lbs' },
      { key: 'height', label: 'Height', unit: 'in' },
      { key: 'bmi', label: 'BMI', unit: '' }
    ];

    let col = 0;
    const colWidth = (this.pageWidth - 2 * this.margin - 16) / 2;
    
    vitalMappings.forEach((vital) => {
      const value = vitals[vital.key as keyof VitalSigns];
      if (value) {
        const xPos = this.margin + 12 + (col * colWidth);
        
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.text(`${vital.label}:`, xPos, this.yPosition);
        
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.text(`${value} ${vital.unit}`, xPos + 35, this.yPosition);
        
        col++;
        if (col === 2) {
          col = 0;
          this.yPosition += 5;
        }
      }
    });
    
    if (col === 1) this.yPosition += 5; // Adjust if odd number of vitals
    this.yPosition += 5;
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
    
    lines.forEach((line: string, index: number) => {
      this.checkPageBreak(5);
      this.pdf.text(line, leftMargin, this.yPosition);
      this.yPosition += index === lines.length - 1 ? 5 : 4.5; // Slightly tighter line spacing
    });
  }

  private checkPageBreak(requiredSpace: number) {
    if (this.yPosition + requiredSpace > this.pageHeight - 40) {
      this.addFooter(); // Add footer before page break
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

    // Provider signature section
    this.checkPageBreak(25);
    this.pdf.setFillColor(...this.lightGray);
    this.pdf.rect(this.margin, this.yPosition, this.pageWidth - 2 * this.margin, 18, 'F');
    
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('PROVIDER INFORMATION', this.margin + 5, this.yPosition + 7);
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`Provider: ${note.provider_name}`, this.margin + 5, this.yPosition + 13);
    this.pdf.text(`Date Created: ${new Date(note.created_at).toLocaleDateString()}`, this.pageWidth - this.margin - 5, this.yPosition + 13, { align: 'right' });

    this.addFooter();

    // Save the PDF
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `SOAP_Note_${patientName.replace(/\s+/g, '_')}_${timestamp}.pdf`;
    this.pdf.save(filename);
  }

  exportSOAPFormData(formData: SOAPFormData, patientName: string): void {
    const dateCreated = formData.dateCreated instanceof Date && !isNaN(formData.dateCreated.getTime()) 
      ? formData.dateCreated 
      : new Date();
    const dateOfService = dateCreated.toLocaleDateString();
    
    this.addHeader(patientName, dateOfService);

    // Chief Complaint
    if (formData.chiefComplaint) {
      this.addSection('CHIEF COMPLAINT', formData.chiefComplaint);
    }

    // Subjective
    if (formData.subjective && Object.keys(formData.subjective).length > 0) {
      this.addSection('SUBJECTIVE', formData.subjective);
    }

    // Objective
    if (formData.objective && Object.keys(formData.objective).length > 0) {
      this.addSection('OBJECTIVE', formData.objective);
    }

    // Assessment
    if (formData.assessment && Object.keys(formData.assessment).length > 0) {
      this.addSection('ASSESSMENT', formData.assessment);
    }

    // Plan
    if (formData.plan && Object.keys(formData.plan).length > 0) {
      this.addSection('PLAN', formData.plan);
    }

    // Provider signature section
    this.checkPageBreak(25);
    this.pdf.setFillColor(...this.lightGray);
    this.pdf.rect(this.margin, this.yPosition, this.pageWidth - 2 * this.margin, 18, 'F');
    
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('PROVIDER INFORMATION', this.margin + 5, this.yPosition + 7);
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`Provider: ${formData.providerName || 'Not specified'}`, this.margin + 5, this.yPosition + 13);
    this.pdf.text(`Date Created: ${dateOfService}`, this.pageWidth - this.margin - 5, this.yPosition + 13, { align: 'right' });

    this.addFooter();

    // Save the PDF
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `SOAP_Note_${patientName.replace(/\s+/g, '_')}_${timestamp}.pdf`;
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