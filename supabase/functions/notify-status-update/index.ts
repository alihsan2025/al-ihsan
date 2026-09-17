/// &lt;reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" /&gt;

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateApplicationPDF, generateStandardPDF } from "../_shared/pdfGenerator.ts";
import { getPrivacyPolicyText, getTermsOfServiceText, getVolunteerAgreementText } from "../_shared/legalTexts.ts";

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const FROM_EMAIL = "noreply@alihsanreliefandempowerment.org";
const FROM_NAME = "Al-Ihsan Relief";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface StatusUpdatePayload {
  type: "volunteer" | "aid";
  id?: string;
  applicantName: string;
  applicantEmail: string;
  newStatus: string;
  category?: string;
}

async function sendEmail(
    to: string, 
    subject: string, 
    html: string,
    attachment?: { content: string; name: string }[]
) {
  if (!BREVO_API_KEY) {
    console.warn("BREVO_API_KEY not set — skipping email.");
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
  if (!res.ok) throw new Error(`Email failed: ${JSON.stringify(data)}`);
  return data;
}

function getStatusMessage(type: string, status: string): { heading: string; body: string; color: string } {
  const statusMap: Record<string, Record<string, { heading: string; body: string; color: string }>> = {
    volunteer: {
      REVIEWED: {
        heading: "Application Under Review",
        body: "Your volunteer application is now being reviewed by our team. We will be in touch shortly In Shaa Allah.",
        color: "#3b82f6",
      },
      SHORTLISTED: {
        heading: "You Have Been Shortlisted!",
        body: "Alhamdulillah! Your volunteer application has been shortlisted. Our team will contact you soon with next steps. May Allah reward your willingness to serve.",
        color: "#10b981",
      },
      DECLINED: {
        heading: "Application Update",
        body: "After careful review, we are unable to proceed with your volunteer application at this time. May Allah bless you, reward your intention, and open other doors of khayr for you. Please consider supporting us through donations and dua.",
        color: "#6b7280",
      },
    },
    aid: {
      UNDER_REVIEW: {
        heading: "Request Under Review",
        body: "Your request for assistance is now being reviewed by our team. We will reach out to you shortly In Shaa Allah.",
        color: "#3b82f6",
      },
      APPROVED: {
        heading: "Request Approved!",
        body: "Alhamdulillah! Your request for assistance has been approved. Our team will contact you soon to coordinate the delivery of support. May Allah ease your situation.",
        color: "#10b981",
      },
      DECLINED: {
        heading: "Request Update",
        body: "After reviewing your request, we are unable to provide assistance at this time due to resource constraints. We encourage you to reapply in the future or contact us for alternative support. May Allah ease your affairs.",
        color: "#6b7280",
      },
    },
  };

  return statusMap[type]?.[status] ?? {
    heading: "Application Update",
    body: `Your application status has been updated to: ${status}.`,
    color: "#6b7280",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: StatusUpdatePayload = await req.json();
    const { type, id, applicantName, applicantEmail, newStatus } = payload;

    if (!applicantEmail) {
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "No email address" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { heading, body, color } = getStatusMessage(type, newStatus);

    const html = `
      <div style="font-family:sans-serif;max-width:600px;">
        <div style="background:#2a1a2e;padding:24px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:#d4af37;font-family:Georgia,serif;margin:0;">Al-Ihsan Relief</h1>
          <p style="color:#d5c8e0;margin:4px 0 0;">Relief &amp; Empowerment</p>
        </div>
        <div style="padding:24px;background:#ffffff;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;">
          <div style="background:${color};color:#fff;padding:12px 16px;border-radius:8px;text-align:center;margin-bottom:16px;">
            <strong>${heading}</strong>
          </div>
          <p style="color:#444;line-height:1.6;">Assalamu Alaykum ${applicantName},</p>
          <p style="color:#444;line-height:1.6;">${body}</p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
          <p style="color:#999;font-size:12px;">This is an automated message from Al-Ihsan Relief. If you have questions, please contact us at info@alihsanreliefandempowerment.org.</p>
        </div>
      </div>
    `;

    let attachments: { content: string; name: string }[] | undefined = undefined;

    // If a volunteer was accepted/shortlisted, fetch their record and bundle the PDFs
    if (type === "volunteer" && newStatus === "SHORTLISTED" && id && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        try {
            const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
            const { data: record, error } = await supabase.from('volunteer_applications').select('*').eq('id', id).single();
            
            if (record && !error) {
                const dateStr = new Date().toLocaleDateString();
                const appPdf = await generateApplicationPDF(record, "volunteer");
                
                const privacyPdf = await generateStandardPDF(
                    "Al-Ihsan Privacy Policy", 
                    getPrivacyPolicyText(applicantName, dateStr)
                );
                const tosPdf = await generateStandardPDF(
                    "Al-Ihsan Terms of Service", 
                    getTermsOfServiceText(applicantName, dateStr)
                );
                const agreementPdf = await generateStandardPDF(
                    "Al-Ihsan Volunteer Agreement", 
                    getVolunteerAgreementText(applicantName, dateStr)
                );

                attachments = [
                    { content: appPdf, name: "Your_Volunteer_Application.pdf" },
                    { content: privacyPdf, name: "Privacy_Policy.pdf" },
                    { content: tosPdf, name: "Terms_Of_Service.pdf" },
                    { content: agreementPdf, name: "Volunteer_Agreement.pdf" },
                ];
            }
        } catch (err) {
            console.error("Warning: Failed to generate volunteer PDFs:", err);
        }
    }

    const result = await sendEmail(
      applicantEmail,
      `${heading} — Al-Ihsan Relief`,
      html,
      attachments
    );

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Status notification error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
