import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Generate a PDF filename based on template number and invoice data.
 */
const getFileName = (invoiceData, templateNumber) => {
  const { number, date } = invoiceData.invoice || {};
  const { name: companyName } = invoiceData.yourCompany || {};
  const { name: billToName } = invoiceData.billTo || {};
  const timestamp = new Date().getTime();

  switch (templateNumber) {
    case 1: return `${number || 'invoice'}.pdf`;
    case 2: return `${companyName || 'company'}_${number || 'invoice'}.pdf`;
    case 3: return `${companyName || 'company'}.pdf`;
    case 4: return `${date || 'invoice'}.pdf`;
    case 5: return `${number || 'inv'}-${date || 'invoice'}.pdf`;
    case 6: return `invoice_${timestamp}.pdf`;
    case 7: return `Invoice_${number || 'invoice'}.pdf`;
    case 8: return `Invoice_${billToName || 'client'}.pdf`;
    case 9: return `IN-${date || 'invoice'}.pdf`;
    default: return `invoice_template_${templateNumber}.pdf`;
  }
};

/**
 * Generate PDF by capturing a DOM element directly.
 * This produces an exact match with the preview since it captures
 * the actual rendered element with all CSS styles applied.
 */
export const generatePDFFromElement = async (element, invoiceData, templateNumber) => {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: 794,
    height: 1123,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');

  const fileName = getFileName(invoiceData, templateNumber);
  pdf.save(fileName);
};

/**
 * Generate PDF by rendering the InvoiceTemplate component into a
 * temporary DOM element. Uses createRoot so Tailwind CSS classes
 * are properly resolved (unlike the old renderToString approach).
 */
export const generatePDF = async (invoiceData, templateNumber) => {
  const { default: React } = await import('react');
  const { createRoot } = await import('react-dom/client');
  const { default: InvoiceTemplate } = await import('../components/InvoiceTemplate');

  // Create a container that's in the DOM so it inherits all CSS
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.height = '1123px';
  container.style.zIndex = '-9999';
  container.style.overflow = 'hidden';
  document.body.appendChild(container);

  const root = createRoot(container);

  // Render and wait for paint
  await new Promise((resolve) => {
    root.render(
      React.createElement(InvoiceTemplate, { data: invoiceData, templateNumber })
    );
    // Give browser time to render + apply CSS
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 300);
      });
    });
  });

  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: 794,
    height: 1123,
  });

  root.unmount();
  document.body.removeChild(container);

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');

  const fileName = getFileName(invoiceData, templateNumber);
  pdf.save(fileName);
};
