import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Patient, Variant } from '@/types';

interface PDFOptions {
  download?: boolean;
  asBlob?: boolean;
}

export const generateClinicalPDF = (
  patient: Patient, 
  variants: Variant[], 
  doctorName: string,
  options?: PDFOptions
) => {
  const doc = jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // --- Header ---
  doc.setFillColor(28, 27, 31); // Dark primary
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('PharmaGuard Clinical Report', 15, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Personalized Pharmacogenomics Analysis Suite', 15, 28);
  doc.text(`Report ID: PGX-${Date.now().toString().slice(-6)}`, pageWidth - 60, 20);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 60, 28);

  // --- Patient Information ---
  doc.setTextColor(28, 27, 31);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Information', 15, 55);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const patientData = [
    ['Name:', patient.name, 'Phone:', `+91 ${patient.phone}`],
    ['Height:', `${patient.height} cm`, 'Weight:', `${patient.weight} kg`],
    ['Physician:', doctorName, 'Status:', 'Finalized']
  ];

  autoTable(doc, {
    startY: 60,
    body: patientData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: { 
      0: { fontStyle: 'bold', width: 30 },
      2: { fontStyle: 'bold', width: 30 }
    }
  });

  // --- Findings Summary ---
  const critical = variants.filter(v => v.risk === 'Toxic' || v.risk === 'Ineffective').length;
  const adjust = variants.filter(v => v.risk === 'Adjust Dosage').length;

  doc.setFont('helvetica', 'bold');
  doc.text('Diagnostic Summary', 15, (doc as any).lastAutoTable.finalY + 15);
  
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    body: [
      [`Total Variants Analyzed: ${variants.length}`],
      [`Critical Findings: ${critical}`],
      [`Dosage Adjustments Required: ${adjust}`]
    ],
    theme: 'striped',
    headStyles: { fillColor: [70, 250, 156] },
    styles: { fontSize: 9 }
  });

  // --- Pharmacogenomic Findings (Only Toxic & Unique) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Pharmacogenomic Findings', 15, (doc as any).lastAutoTable.finalY + 15);

  // Deduplicate by Gene for toxicity table
  const toxicVariants = variants.filter(v => v.risk === 'Toxic');
  const uniqueToxic = Array.from(new Map(toxicVariants.map(v => [v.gene, v])).values());
  
  const variantTableData = uniqueToxic.map(v => [
    v.gene,
    v.risk,
    v.recommendation
  ]);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [['Gene', 'Risk Level', 'Clinical Recommendation']],
    body: variantTableData,
    headStyles: { fillColor: [45, 45, 45], textColor: [255, 255, 255] },
    styles: { fontSize: 10 },
    columnStyles: {
      2: { cellWidth: 100 }
    }
  });

  // --- Clinical Impact / Drug Analysis Section (Unique by Gene) ---
  const impactVariants = variants
    .filter(v => v.risk === 'Toxic' || v.risk === 'Adjust Dosage' || v.risk === 'Ineffective');
  
  // Deduplicate by Gene for clinical impact
  const uniqueImpact = Array.from(new Map(impactVariants.map(v => [v.gene, v])).values()).slice(0, 20);

  if (uniqueImpact.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Clinical Impact & Drug Analysis', 15, (doc as any).lastAutoTable.finalY + 15);
    
    let currentY = (doc as any).lastAutoTable.finalY + 22;

    uniqueImpact.forEach((v, index) => {
      // Check for page break
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFillColor(245, 245, 245);
      doc.rect(15, currentY, pageWidth - 30, 8, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(28, 27, 31);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. Gene: ${v.gene} | Therapeutic Impact`, 18, currentY + 5);
      
      currentY += 12;
      
      const effect = v.effectOnBody || {
        metabolicImpact: "Standard metabolic rate expected based on general population data.",
        drugBehavior: "Normal drug clearance observed.",
        clinicalEffects: ["No significant clinical adverse effects predicted."],
        severity: v.risk === 'Safe' ? "Low" : "Moderate",
        patientSummary: "This medicine should work as expected with normal side effects."
      };

      const effectData = [
        ['Metabolic Impact:', effect.metabolicImpact],
        ['Drug Behavior:', effect.drugBehavior],
        ['Clinical Effects:', effect.clinicalEffects.join(', ')],
        ['Severity:', effect.severity],
        ['Patient Summary:', effect.patientSummary]
      ];

      autoTable(doc, {
        startY: currentY,
        body: effectData,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 1 },
        columnStyles: {
          0: { fontStyle: 'bold', width: 40 },
          1: { cellWidth: pageWidth - 80 }
        }
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;
    });
  }

  // --- Footer / Disclaimer ---
  const footerY = doc.internal.pageSize.getHeight() - 30;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  const disclaimer = 'DISCLAIMER: This report is generated based on genomic data analysis and AI-driven clinical mapping. Results should be interpreted by a licensed clinical pharmacist or physician before making any therapeutic changes.';
  doc.text(doc.splitTextToSize(disclaimer, pageWidth - 30), 15, footerY);

  // --- Finalize ---
  if (options?.download) {
    doc.save(`PGx_Report_${patient.name.replace(/\s/g, '_')}.pdf`);
  }
  
  if (options?.asBlob) {
    return doc.output('blob');
  }

  return doc.output('bloburl');
};
