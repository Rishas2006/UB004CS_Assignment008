const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

/** Streams a prescription PDF into `res`. */
function prescriptionPdf(res, rx) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  doc.pipe(res);
  doc.fontSize(20).fillColor('#0B5FA5').text('RH Hospital', { align: 'left' });
  doc.fontSize(9).fillColor('#555').text('123 Health Care Avenue, Colombo 01  |  +94 11 123 4567');
  doc.moveDown().strokeColor('#0B5FA5').moveTo(50, doc.y).lineTo(545, doc.y).stroke().moveDown();
  doc.fillColor('#000').fontSize(13).text(`Prescription ${rx.ref}`);
  doc.fontSize(10).text(`Date: ${new Date(rx.created_at).toISOString().slice(0, 10)}`);
  doc.text(`Patient: ${rx.patient_name}   (MRN ${rx.mrn})`);
  doc.text(`Doctor: ${rx.doctor_name}   ${rx.slmc_no || ''}`).moveDown();
  doc.fontSize(11).text('Medicines', { underline: true }).moveDown(0.5);
  rx.items.forEach((i, n) => doc.fontSize(10).text(`${n + 1}. ${i.drug} - ${i.dose}, ${i.frequency}, for ${i.days} day(s)`));
  if (rx.notes) doc.moveDown().fontSize(10).text(`Notes: ${rx.notes}`);
  doc.moveDown(3).fontSize(9).fillColor('#666').text('This document is system generated. Dispense only against valid doctor authorisation.');
  doc.end();
}

const qrDataUrl = (text) => QRCode.toDataURL(text, { margin: 1, width: 240 });
module.exports = { prescriptionPdf, qrDataUrl };
