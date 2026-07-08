/**
 * Renders a resume DOM node to a downloadable PDF.
 * Uses an off-screen, full-size element (not the scaled on-screen preview).
 */
export async function downloadResumePdf(element, filename = 'resume') {
  if (!element) {
    throw new Error('Resume preview is not ready');
  }

  const { default: html2pdf } = await import('html2pdf.js');

  const safeName = filename.trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '_') || 'resume';

  const options = {
    margin: [0.5, 0.5, 0.5, 0.5],
    filename: `${safeName}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.scrollWidth,
    },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  };

  await html2pdf().set(options).from(element).save();
}
