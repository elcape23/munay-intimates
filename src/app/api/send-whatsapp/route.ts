import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { phone, orderId, paymentMethod, name } = await req.json();

  if (!phone || !orderId || !paymentMethod) {
    return NextResponse.json(
      { error: "phone, orderId and paymentMethod are required" },
      { status: 400 }
    );
  }

  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (!token || !phoneId) {
    console.error("WhatsApp credentials not configured");
    return NextResponse.json(
      { error: "WhatsApp credentials not configured" },
      { status: 500 }
    );
  }

  const messagePayload = {
    messaging_product: "whatsapp",
    to: phone,
    type: "template",
    template: {
      name: "order_confirmation",
      language: { code: "es" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: name || "cliente" },
            { type: "text", text: String(orderId) },
            { type: "text", text: String(paymentMethod) },
          ],
        },
      ],
    },
  };

  try {
    const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(messagePayload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("WhatsApp API error", errText);
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("WhatsApp API request failed", e);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
