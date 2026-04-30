import { jsPDF } from 'jspdf';

type CertificateOptions = {
  studentName: string;
  courseTitle: string;
  achievement: string;
  issueDate: string;
};

type ReportOptions = {
  studentName: string;
  attendanceRate: string;
  progressSummary: string;
  notes: string[];
  issueDate: string;
};

export const downloadCertificatePdf = (options: CertificateOptions) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, width, height, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.text('Certificate of Completion', width / 2, 120, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('This certifies that', width / 2, 170, { align: 'center' });

  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(options.studentName, width / 2, 220, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('has completed', width / 2, 260, { align: 'center' });

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(options.courseTitle, width / 2, 300, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(options.achievement, width / 2, 340, { align: 'center' });

  doc.setFontSize(12);
  doc.text(`Issued on ${options.issueDate}`, width / 2, 390, { align: 'center' });

  doc.setDrawColor(148, 163, 184);
  doc.line(width / 2 - 140, 430, width / 2 + 140, 430);
  doc.setFontSize(10);
  doc.text('Mohammadi Online Academy', width / 2, 450, { align: 'center' });

  doc.save(`certificate-${options.studentName.replace(/\s+/g, '-')}.pdf`);
};

export const downloadProgressReportPdf = (options: ReportOptions) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const width = doc.internal.pageSize.getWidth();

  doc.setFillColor(10, 15, 43);
  doc.rect(0, 0, width, 120, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Monthly Progress Report', 40, 70);

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`Student: ${options.studentName}`, 40, 150);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(`Attendance: ${options.attendanceRate}`, 40, 175);
  doc.text(`Issued: ${options.issueDate}`, 40, 195);

  doc.setFont('helvetica', 'bold');
  doc.text('Progress Summary', 40, 230);
  doc.setFont('helvetica', 'normal');
  doc.text(options.progressSummary, 40, 250, { maxWidth: width - 80 });

  doc.setFont('helvetica', 'bold');
  doc.text('Teacher Notes', 40, 310);
  doc.setFont('helvetica', 'normal');
  options.notes.forEach((note, index) => {
    doc.text(`- ${note}`, 40, 330 + index * 18, { maxWidth: width - 80 });
  });

  doc.save(`progress-report-${options.studentName.replace(/\s+/g, '-')}.pdf`);
};
