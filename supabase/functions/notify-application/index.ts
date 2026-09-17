/// &lt;reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" /&gt;

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateApplicationPDF, generateStandardPDF } from "../_shared/pdfGenerator.ts";
import { getVerificationProcessText } from "../_shared/legalTexts.ts";

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "info@alihsanreliefandempowerment.org";
const FROM_EMAIL = "noreply@alihsanreliefandempowerment.org";
const FROM_NAME = "Al-Ihsan Relief";

interface ApplicationPayload {
  type: "volunteer" | "aid" | "contact";
  record: Record<string, unknown>;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function sendEmail(
  to: string,
  subject: string,
  html: string,
  attachment?: { content: string; name: string }[]
) {
  if (!BREVO_API_KEY) {
    console.warn("BREVO_API_KEY not set — skipping email send.");
    return { skipped: true };
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      attachment: attachment && attachment.length > 0 ? attachment : undefined,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("Brevo error:", data);
    throw new Error(`Email send failed: ${JSON.stringify(data)}`);
  }

  return data;
}

function buildVolunteerAdminEmail(record: Record<string, unknown>) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin: 0 auto;border:1px solid #eee;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
      <div style="background:#2a1a2e;padding:24px;text-align:center;border-bottom:4px solid #d4af37;">
        <h1 style="color:#d4af37;font-family:Georgia,serif;margin:0;">Al-Ihsan Relief</h1>
        <p style="color:#d5c8e0;margin:4px 0 0;">Relief &amp; Empowerment - Admin Notification</p>
      </div>
      <div style="padding:24px;background:#ffffff;">
        <h2 style="color:#2a1a2e;margin-top:0;">New Volunteer Application</h2>
        <table style="border-collapse:collapse;width:100%;font-size:14px;">
          <tr><td style="padding:10px;border-bottom:1px solid #f0f0f0;color:#666;">Name</td><td style="padding:10px;border-bottom:1px solid #f0f0f0;font-weight:bold;color:#222;">${record.full_name}</td></tr>
          <tr><td style="padding:10px;border-bottom:1px solid #f0f0f0;color:#666;">Age / Gender</td><td style="padding:10px;border-bottom:1px solid #f0f0f0;color:#222;">${record.age} / ${record.gender}</td></tr>
          <tr><td style="padding:10px;border-bottom:1px solid #f0f0f0;color:#666;">Phone</td><td style="padding:10px;border-bottom:1px solid #f0f0f0;color:#222;">${record.phone}</td></tr>
          <tr><td style="padding:10px;border-bottom:1px solid #f0f0f0;color:#666;">Email</td><td style="padding:10px;border-bottom:1px solid #f0f0f0;color:#222;">${record.email}</td></tr>
          <tr><td style="padding:10px;border-bottom:1px solid #f0f0f0;color:#666;">City / State</td><td style="padding:10px;border-bottom:1px solid #f0f0f0;color:#222;">${record.city}, ${record.state}</td></tr>
          <tr><td style="padding:10px;border-bottom:1px solid #f0f0f0;color:#666;">Preferred Role</td><td style="padding:10px;border-bottom:1px solid #f0f0f0;font-weight:bold;color:#d4af37;">${record.preferred_role}</td></tr>
          <tr><td style="padding:10px;border-bottom:1px solid #f0f0f0;color:#666;">Quiz Score</td><td style="padding:10px;border-bottom:1px solid #f0f0f0;color:#222;">${record.quiz_score}%</td></tr>
        </table>
        <p style="margin-top:20px;color:#666;font-size:14px;">Review this application in the <a href="https://al-ihsan-relief.vercel.app/admin/dashboard" style="color:#d4af37;text-decoration:none;font-weight:bold;">Admin Dashboard &rarr;</a></p>
      </div>
    </div>
  `;
}

function buildVolunteerConfirmationEmail(record: Record<string, unknown>) {
  return `
    <div style="font-family:sans-serif;max-width:600px;">
      <div style="background:#2a1a2e;padding:24px;text-align:center;border-radius:12px 12px 0 0;">
        <h1 style="color:#d4af37;font-family:Georgia,serif;margin:0;">Al-Ihsan Relief</h1>
        <p style="color:#d5c8e0;margin:4px 0 0;">Relief &amp; Empowerment</p>
      </div>
      <div style="padding:24px;background:#ffffff;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;">
        <h2 style="color:#2a1a2e;">Jazakallahu Khairan, ${record.full_name}!</h2>
        <p style="color:#444;line-height:1.6;">Your volunteer application has been received. Our team will review your readiness assessment, contact references if needed, and reach out to you In Shaa Allah.</p>
        <p style="color:#444;line-height:1.6;">Please allow 5-10 working days for processing. May Allah reward your intention to serve.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
        <p style="color:#999;font-size:12px;">This is an automated message from Al-Ihsan Relief. Please do not reply to this email.</p>
      </div>
    </div>
  `;
}

function buildAidAdminEmail(record: Record<string, unknown>) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin: 0 auto;border:1px solid #eee;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
      <div style="background:#2a1a2e;padding:24px;text-align:center;border-bottom:4px solid #d4af37;">
        <h1 style="color:#d4af37;font-family:Georgia,serif;margin:0;">Al-Ihsan Relief</h1>
        <p style="color:#d5c8e0;margin:4px 0 0;">Relief &amp; Empowerment - Admin Notification</p>
      </div>
      <div style="padding:24px;background:#ffffff;">
        <h2 style="color:#2a1a2e;margin-top:0;">New Aid / Help Request</h2>
        <table style="border-collapse:collapse;width:100%;font-size:14px;">
          <tr><td style="padding:10px;border-bottom:1px solid #f0f0f0;color:#666;">Name</td><td style="padding:10px;border-bottom:1px solid #f0f0f0;font-weight:bold;color:#222;">${record.full_name}</td></tr>
          <tr><td style="padding:10px;border-bottom:1px solid #f0f0f0;color:#666;">Phone</td><td style="padding:10px;border-bottom:1px solid #f0f0f0;color:#222;">${record.phone}</td></tr>
          <tr><td style="padding:10px;border-bottom:1px solid #f0f0f0;color:#666;">Email</td><td style="padding:10px;border-bottom:1px solid #f0f0f0;color:#222;">${record.email || "N/A"}</td></tr>
          <tr><td style="padding:10px;border-bottom:1px solid #f0f0f0;color:#666;">Location</td><td style="padding:10px;border-bottom:1px solid #f0f0f0;color:#222;">${record.city}, ${record.state}</td></tr>
          <tr><td style="padding:10px;border-bottom:1px solid #f0f0f0;color:#666;">Category</td><td style="padding:10px;border-bottom:1px solid #f0f0f0;font-weight:bold;color:#d4af37;">${record.aid_category}</td></tr>
          <tr><td style="padding:10px;border-bottom:1px solid #f0f0f0;color:#666;">Household</td><td style="padding:10px;border-bottom:1px solid #f0f0f0;color:#222;">${record.household_size} person(s)</td></tr>
          <tr><td style="padding:10px;border-bottom:1px solid #f0f0f0;color:#666;">Income</td><td style="padding:10px;border-bottom:1px solid #f0f0f0;color:#222;">${record.monthly_income || "Not specified"}</td></tr>
          <tr><td style="padding:10px;border-bottom:1px solid #f0f0f0;color:#666;">Amount Needed</td><td style="padding:10px;border-bottom:1px solid #f0f0f0;font-weight:bold;color:#10b981;">${record.amount_needed || "Not specified"}</td></tr>
        </table>
        <div style="margin-top:16px;padding:16px;background:#f9f9fa;border-radius:8px;font-size:14px;color:#333;border-left:4px solid #d4af37;">
          <strong>Summary:</strong><br>${record.description}
        </div>
        ${record.situation_details ? `
        <div style="margin-top:16px;padding:16px;background:#f0f7ff;border-radius:8px;font-size:14px;color:#333;border-left:4px solid #3b82f6;">
          <strong>Full Situation Details:</strong><br>${(record.situation_details as string).replace(/\n/g, '<br>')}
        </div>
        ` : ''}
        <p style="margin-top:20px;color:#666;font-size:14px;">Review this request in the <a href="https://al-ihsan-relief.vercel.app/admin/dashboard" style="color:#d4af37;text-decoration:none;font-weight:bold;">Admin Dashboard &rarr;</a></p>
      </div>
    </div>
  `;
}

function buildAidConfirmationEmail(record: Record<string, unknown>) {
  return `
    <div style="font-family:sans-serif;max-width:600px;">
      <div style="background:#2a1a2e;padding:24px;text-align:center;border-radius:12px 12px 0 0;">
        <h1 style="color:#d4af37;font-family:Georgia,serif;margin:0;">Al-Ihsan Relief</h1>
        <p style="color:#d5c8e0;margin:4px 0 0;">Relief &amp; Empowerment</p>
      </div>
      <div style="padding:24px;background:#ffffff;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;">
        <h2 style="color:#2a1a2e;">Assalamu Alaykum, ${record.full_name}!</h2>
        <p style="color:#444;line-height:1.6;">Your request for assistance has been received. Our team will review your application and reach out to you In Shaa Allah.</p>
        <p style="color:#444;line-height:1.6;">Please allow 5-10 working days for processing. If your situation is urgent, please contact us directly via phone or WhatsApp.</p>
        <p style="color:#444;line-height:1.6;"><strong>Category:</strong> ${record.aid_category}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
        <p style="color:#999;font-size:12px;">This is an automated message from Al-Ihsan Relief. Please do not reply to this email.</p>
      </div>
    </div>
  `;
}

function buildContactAdminEmail(record: Record<string, unknown>) {
  return `
    <h2 style="color:#2a1a2e;font-family:Georgia,serif;">New Contact Form Message</h2>
    <table style="border-collapse:collapse;width:100%;max-width:600px;font-family:sans-serif;">
      <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">From</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">${record.name}</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${record.email}</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Subject</td><td style="padding:8px;border-bottom:1px solid #eee;">${record.subject}</td></tr>
    </table>
    <div style="margin-top:12px;padding:16px;background:#f9f9f9;border-radius:8px;font-size:14px;color:#444;line-height:1.6;">
      ${record.message}
    </div>
  `;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: ApplicationPayload = await req.json();
    const { type, record } = payload;

    console.log(`Processing ${type} notification...`);

    const results: Record<string, unknown> = {};

    switch (type) {
      case "volunteer": {
        // Send admin notification
        results.admin = await sendEmail(
          ADMIN_EMAIL,
          `New Volunteer Application: ${record.full_name}`,
          buildVolunteerAdminEmail(record),
        );

        // Send applicant confirmation (if email provided)
        if (record.email) {
          results.applicant = await sendEmail(
            record.email as string,
            "Application Received — Al-Ihsan Relief",
            buildVolunteerConfirmationEmail(record),
          );
        }
        break;
      }

      case "aid": {
        // Send admin notification
        results.admin = await sendEmail(
          ADMIN_EMAIL,
          `New Aid Request: ${record.full_name} (${record.aid_category})`,
          buildAidAdminEmail(record),
        );

        // Process PDF generation and send applicant confirmation (if email provided)
        if (record.email) {
          try {
            const applicantName = String(record.full_name || "Applicant");
            const dateStr = new Date().toLocaleDateString();

            // Generate PDFs
            const applicationPdfB64 = await generateApplicationPDF(record, "aid");
            
            const verificationText = getVerificationProcessText(applicantName, dateStr);
            const verificationPdfB64 = await generateStandardPDF("Aid Verification Process", verificationText);
            
            // Send email with attachments
            results.applicant = await sendEmail(
              record.email as string,
              "Request Received & Application Copy — Al-Ihsan Relief",
              buildAidConfirmationEmail(record),
              [
                { content: applicationPdfB64, name: "Aid_Application_Copy.pdf" },
                { content: verificationPdfB64, name: "Al_Ihsan_Verification_Process.pdf" }
              ]
            );
          } catch (pdfError) {
             console.error("Failed to generate PDFs or send email with attachment:", pdfError);
             // Fallback to sending without attachments if PDF fails
             results.applicant = await sendEmail(
              record.email as string,
              "Request Received — Al-Ihsan Relief",
              buildAidConfirmationEmail(record),
            );
          }
        }
        break;
      }

      case "contact": {
        // Send admin notification only
        results.admin = await sendEmail(
          ADMIN_EMAIL,
          `Contact Form: ${record.subject}`,
          buildContactAdminEmail(record),
        );
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown type: ${type}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
