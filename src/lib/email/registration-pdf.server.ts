import type PDFDocumentType from "pdfkit";
import PDFDocumentStandalone from "pdfkit/js/pdfkit.standalone.js";

import {
  CAMP_DATES_LABEL,
  CAMP_REGION,
  CAMP_TUITION_LABEL,
  REGISTRATION_CONTACT_EMAIL,
} from "@/lib/camp";

import {
  type RegistrationEmailData,
  registrationPdfFilename,
  registrationSummarySections,
} from "@/lib/email/registration-email-data";

const PAGE_BOTTOM_MARGIN = 50;
const SECTION_TITLE_HEIGHT = 28;
const FIELD_LINE_HEIGHT = 14;

const PDFDocument = PDFDocumentStandalone as unknown as typeof PDFDocumentType;
type PdfDoc = InstanceType<typeof PDFDocumentType>;

function ensureSpace(doc: PdfDoc, needed: number) {
  const bottom = doc.page.height - PAGE_BOTTOM_MARGIN;
  if (doc.y + needed > bottom) {
    doc.addPage();
  }
}

function writeSectionHeading(doc: PdfDoc, title: string) {
  ensureSpace(doc, SECTION_TITLE_HEIGHT + 8);
  doc.moveDown(0.35);
  const x = doc.page.margins.left;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const y = doc.y;

  doc
    .save()
    .moveTo(x, y)
    .lineTo(x + width, y)
    .strokeColor("#cccccc")
    .lineWidth(0.5)
    .stroke()
    .restore();

  doc.moveDown(0.35);
  doc.font("Helvetica-Bold").fontSize(11).fillColor("#1a1a1a").text(title.toUpperCase(), {
    characterSpacing: 0.5,
  });
  doc.moveDown(0.2);
}

function writeField(doc: PdfDoc, label: string, value: string) {
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const text = value || "—";

  doc.font("Helvetica-Bold").fontSize(9).fillColor("#444444");
  const labelHeight = doc.heightOfString(`${label}: `, { width });
  ensureSpace(doc, labelHeight + FIELD_LINE_HEIGHT);

  doc.text(`${label}: `, { continued: true, width });
  doc.font("Helvetica").fontSize(10).fillColor("#111111").text(text, { width });
  doc.moveDown(0.2);
}

export async function buildRegistrationPdf(data: RegistrationEmailData): Promise<{
  buffer: Buffer;
  filename: string;
}> {
  const doc = new PDFDocument({ margin: 50, size: "LETTER" });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const bufferPromise = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const submittedLabel = new Date(data.submittedAt).toLocaleString("en-US", {
    timeZone: "America/New_York",
    dateStyle: "medium",
    timeStyle: "short",
  });

  doc.font("Helvetica-Bold").fontSize(20).fillColor("#111111").text("K2 Soccer Camp");
  doc.font("Helvetica-Bold").fontSize(14).text("Camper registration record");
  doc.moveDown(0.35);
  doc.font("Helvetica-Bold").fontSize(16).fillColor("#0d5c2e").text(data.playerName);
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#555555")
    .text(`Submitted ${submittedLabel} (Eastern Time)`);
  doc.moveDown(0.25);
  doc.fontSize(9).fillColor("#666666");
  doc.text(`${CAMP_DATES_LABEL} · ${CAMP_REGION} · ${CAMP_TUITION_LABEL}`);

  for (const section of registrationSummarySections(data)) {
    writeSectionHeading(doc, section.title);
    for (const [label, value] of section.rows) {
      writeField(doc, label, value);
    }
  }

  ensureSpace(doc, 40);
  doc.moveDown(0.75);
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#888888")
    .text(
      `Generated from the online registration form. Questions: ${REGISTRATION_CONTACT_EMAIL}`,
      { align: "left" },
    );

  doc.end();

  const buffer = await bufferPromise;
  return {
    buffer,
    filename: registrationPdfFilename(data.playerName, data.submittedAt),
  };
}
