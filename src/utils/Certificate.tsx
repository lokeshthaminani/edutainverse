import React from 'react';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';

interface CertificateProps {
  username: string;
  courseName: string;
  completionDate: Date;
}

const Certificate: React.FC<CertificateProps> = ({ 
  username, 
  courseName, 
  completionDate 
}) => {
  const downloadCertificate = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // Set background color
    doc.setFillColor(240, 240, 255);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');
    
    // Add border
    doc.setDrawColor(100, 100, 200);
    doc.setLineWidth(5);
    doc.rect(10, 10, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 20, 'S');
    
    // Add inner border
    doc.setDrawColor(150, 150, 220);
    doc.setLineWidth(2);
    doc.rect(15, 15, doc.internal.pageSize.getWidth() - 30, doc.internal.pageSize.getHeight() - 30, 'S');
    
    // Add title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(40);
    doc.setTextColor(50, 50, 150);
    doc.text('Certificate of Completion', doc.internal.pageSize.getWidth() / 2, 50, { align: 'center' });
    
    // Add decorative line
    doc.setDrawColor(100, 100, 200);
    doc.setLineWidth(1);
    const lineWidth = 100;
    doc.line(
      doc.internal.pageSize.getWidth() / 2 - lineWidth / 2, 
      60, 
      doc.internal.pageSize.getWidth() / 2 + lineWidth / 2, 
      60
    );
    
    // Add text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(60, 60, 60);
    doc.text('This is to certify that', doc.internal.pageSize.getWidth() / 2, 80, { align: 'center' });
    
    // Add name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(30);
    doc.setTextColor(50, 50, 150);
    doc.text(username, doc.internal.pageSize.getWidth() / 2, 100, { align: 'center' });
    
    // Add more text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(60, 60, 60);
    doc.text('has successfully completed the course', doc.internal.pageSize.getWidth() / 2, 120, { align: 'center' });
    
    // Add course name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(50, 50, 150);
    doc.text(courseName, doc.internal.pageSize.getWidth() / 2, 140, { align: 'center' });
    
    // Add date
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.text(
      `Completed on ${format(completionDate, 'MMMM dd, yyyy')}`,
      doc.internal.pageSize.getWidth() / 2, 
      170, 
      { align: 'center' }
    );
    
    // Save the PDF
    doc.save(`${username.replace(/\s+/g, '_')}_${courseName.replace(/\s+/g, '_')}_Certificate.pdf`);
  };
  
  return (
    <div className="mb-4">
      <button
        onClick={downloadCertificate}
        className="flex items-center justify-center gap-2 px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8v13m0-13V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1"></path>
          <path d="M12 8H7a2 2 0 0 0-2 2v1"></path>
          <path d="M20 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2z"></path>
        </svg>
        Download Certificate
      </button>
    </div>
  );
};

export default Certificate;