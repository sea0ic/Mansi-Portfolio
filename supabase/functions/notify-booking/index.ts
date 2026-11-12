import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const TO_EMAIL = "mansibhavsar7499@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const booking = await req.json();

    const html = `
      <h2>New Consultation Booking</h2>
      <table style="border-collapse:collapse;width:100%;max-width:600px">
        <tr><td style="padding:8px;font-weight:bold;border:1px solid #ddd">Name</td><td style="padding:8px;border:1px solid #ddd">${booking.name}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border:1px solid #ddd">Email</td><td style="padding:8px;border:1px solid #ddd">${booking.email}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border:1px solid #ddd">Topic</td><td style="padding:8px;border:1px solid #ddd">${booking.topic}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border:1px solid #ddd">Questions</td><td style="padding:8px;border:1px solid #ddd">${booking.questions || "—"}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border:1px solid #ddd">Slot</td><td style="padding:8px;border:1px solid #ddd">${booking.slot || "not selected"}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border:1px solid #ddd">Payment</td><td style="padding:8px;border:1px solid #ddd">${booking.payment_method} — ${booking.amount}</td></tr>
        ${booking.upi_sender_name ? `<tr><td style="padding:8px;font-weight:bold;border:1px solid #ddd">UPI Name</td><td style="padding:8px;border:1px solid #ddd">${booking.upi_sender_name}</td></tr>` : ""}
        <tr><td style="padding:8px;font-weight:bold;border:1px solid #ddd">Status</td><td style="padding:8px;border:1px solid #ddd">${booking.status}</td></tr>
      </table>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Mansi Portfolio <onboarding@resend.dev>",
        to: [TO_EMAIL],
        subject: `New consultation booking — ${booking.name}`,
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Resend error:", data);
      return new Response(JSON.stringify({ error: data }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, id: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
