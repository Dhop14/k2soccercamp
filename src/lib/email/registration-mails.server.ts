import {
  CAMP_DATES_LABEL,
  CAMP_REGION,
  CAMP_TUITION_LABEL,
  REGISTRATION_CONTACT_EMAIL,
} from "@/lib/camp";

import {
  type RegistrationEmailData,
  registrationSummarySections,
} from "@/lib/email/registration-email-data";
import { buildRegistrationPdf } from "@/lib/email/registration-pdf.server";

export type { RegistrationEmailData } from "@/lib/email/registration-email-data";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parentBody(data: RegistrationEmailData) {
  return `
    <p>Hi ${escapeHtml(data.parentName)},</p>
    <p>
      We've received ${escapeHtml(data.playerName)}'s registration for K2 Soccer Camp.
      We'll follow up with payment instructions and details for day one.
    </p>
    <p><strong>Camp details</strong></p>
    <ul>
      <li>Dates: ${escapeHtml(CAMP_DATES_LABEL)}</li>
      <li>Location: ${escapeHtml(CAMP_REGION)}</li>
      <li>Tuition: ${escapeHtml(CAMP_TUITION_LABEL)}</li>
    </ul>
    <p>
      A copy of your registration summary is attached for your records.
    </p>
    <p>Questions? Reply to this email or contact us at ${escapeHtml(REGISTRATION_CONTACT_EMAIL)}.</p>
    <p>— K2 Soccer Camp</p>
  `;
}

function adminBody(data: RegistrationEmailData) {
  const sections = registrationSummarySections(data)
    .map((section) => {
      const rows = section.rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:4px 8px;font-weight:600;vertical-align:top;width:38%">${escapeHtml(k)}</td><td style="padding:4px 8px">${escapeHtml(v)}</td></tr>`,
        )
        .join("");
      return `<h3 style="margin:20px 0 8px;font-size:14px;text-transform:uppercase;letter-spacing:0.04em;color:#333">${escapeHtml(section.title)}</h3><table border="1" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:640px">${rows}</table>`;
    })
    .join("");
  return `<p>New registration for <strong>${escapeHtml(data.playerName)}</strong>. Full details are below; a PDF copy is attached.</p>${sections}`;
}

type ResendAttachment = { filename: string; content: string };

async function sendResend(params: {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: ResendAttachment[];
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.REGISTRATION_FROM_EMAIL ?? `K2 Soccer Camp <noreply@k2soccercamp.com>`;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set; skipping send:", params.subject);
    return { ok: true as const, skipped: true as const };
  }

  const body: Record<string, unknown> = {
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
  };
  if (params.attachments?.length) {
    body.attachments = params.attachments;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[email] Resend error:", res.status, text);
    return { ok: false as const, skipped: false as const };
  }

  return { ok: true as const, skipped: false as const };
}

export async function sendRegistrationEmails(data: RegistrationEmailData) {
  const parentResult = await sendResend({
    to: data.email,
    subject: "K2 Soccer Camp — registration received",
    html: parentBody(data),
  });

  const adminEmail = process.env.REGISTRATION_ADMIN_EMAIL ?? REGISTRATION_CONTACT_EMAIL;
  let adminAttachments: ResendAttachment[] | undefined;

  try {
    const { buffer, filename } = await buildRegistrationPdf(data);
    adminAttachments = [{ filename, content: buffer.toString("base64") }];
  } catch (err) {
    console.error("[email] PDF generation failed:", err);
  }

  const adminResult = await sendResend({
    to: adminEmail,
    subject: `New K2 registration: ${data.playerName}`,
    html: adminBody(data),
    attachments: adminAttachments,
  });

  return { parentResult, adminResult };
}
