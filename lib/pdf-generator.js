import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generates an OIML R-76 compliant PDF test report.
 * @param {Object} instrumentData 
 * @param {Array} testResults 
 */
export function generateOIMLReport(instrumentData, testResults) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246); // Accent color
  doc.text('OIML R-76 Test Report', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
  doc.text(`Report ID: TR-${Date.now().toString().slice(-6)}`, 14, 35);
  
  // Instrument Details
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Instrument Details', 14, 45);
  
  doc.autoTable({
    startY: 50,
    head: [['Attribute', 'Value']],
    body: [
      ['Manufacturer', instrumentData.manufacturer || 'N/A'],
      ['Model', instrumentData.model || 'N/A'],
      ['Class', instrumentData.accuracyClass || 'N/A'],
      ['Max Capacity', instrumentData.maxCapacity || 'N/A'],
      ['Verification Scale Interval (e)', instrumentData.e || 'N/A'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] }
  });

  // Test Results
  const finalY = doc.lastAutoTable.finalY || 50;
  doc.setFontSize(14);
  doc.text('Weighing Test Results', 14, finalY + 10);
  
  const tableData = testResults.map(test => [
    test.L, 
    test.I, 
    test.dL, 
    test.P, 
    test.E, 
    test.Ec, 
    `±${test.mpeAllowed}`, 
    test.isPass ? 'PASS' : 'FAIL'
  ]);
  
  doc.autoTable({
    startY: finalY + 15,
    head: [['Load (L)', 'Ind. (I)', 'Add. (dL)', 'Ind. bf round (P)', 'Error (E)', 'Corr. Err (Ec)', 'MPE', 'Result']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [30, 41, 59] }, // Dark surface color
    didParseCell: function(data) {
      if (data.section === 'body' && data.column.index === 7) {
        if (data.cell.raw === 'FAIL') {
          data.cell.styles.textColor = [239, 68, 68]; // Red
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [16, 185, 129]; // Green
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });
  
  // Footer / Signatures
  const bottomY = doc.lastAutoTable.finalY + 30;
  doc.line(14, bottomY, 80, bottomY);
  doc.text('Inspector Signature', 14, bottomY + 5);
  
  doc.line(120, bottomY, 190, bottomY);
  doc.text('Laboratory Manager', 120, bottomY + 5);

  doc.save(`OIML_Report_${instrumentData.model}.pdf`);
}
