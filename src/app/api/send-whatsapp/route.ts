import { NextRequest, NextResponse } from "next/server";

/** Normaliza a E.164 (sin '+'); para AR fuerza 549 si faltara */
function normalizeE164AR(raw?: string | null): string | null {
  if (!raw) return null;
  let n = String(raw).replace(/[^\d+]/g, "");
  if (n.startsWith("+")) n = n.slice(1);
  if (n.startsWith("54") && !n.startsWith("549")) n = "549" + n.slice(2);
  return n || null;
}

/** Teléfono válido para Argentina en E.164: debe empezar con 549 y tener 13 dígitos */
function isValidAR(to?: string | null): boolean {
  return !!to && /^549\d{10}$/.test(to);
}

/** Formatea ARS si viene numérico. Si ya viene string con símbolo, se respeta. */
function formatOrderTotal(value: unknown, currency = "ARS"): string {
  if (typeof value === "string" && value.trim().length > 0) return value.trim();
  const num =
    typeof value === "number"
      ? value
      : typeof value === "string" && !isNaN(Number(value))
      ? Number(value)
      : null;
  if (num !== null) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
    }).format(num);
  }
  return "-";
}

export async function POST(req: NextRequest) {
  const { phone, orderId, name, orderTotal } = await req.json();

  // Validación básica
  if (!phone || !orderId) {
    return NextResponse.json(
      { error: "phone y orderId son requeridos" },
      { status: 400 }
    );
  }

  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID; // usar SIEMPRE este nombre

  if (!token || !phoneId) {
    console.error("[send-whatsapp] Credenciales faltantes:", {
      hasToken: Boolean(token),
      phoneId,
    });
    return NextResponse.json(
      { error: "WhatsApp credentials not configured" },
      { status: 500 }
    );
  }

  // Guard anti-typo en PHONE_NUMBER_ID (10-17 dígitos es rango usual del Graph ID)
  if (!/^\d{10,17}$/.test(phoneId)) {
    console.error(
      "[send-whatsapp] WHATSAPP_PHONE_NUMBER_ID con formato inválido:",
      phoneId
    );
    return NextResponse.json(
      { error: "WHATSAPP_PHONE_NUMBER_ID inválido" },
      { status: 500 }
    );
  }

  // Normalizar teléfono (AR)
  const to = normalizeE164AR(phone);
  if (!isValidAR(to)) {
    return NextResponse.json(
      {
        error:
          "phone inválido/corto después de normalizar (se espera 13 dígitos para AR con prefijo 549)",
        toNormalizado: to,
      },
      { status: 400 }
    );
  }

  // Asegurar que venga un total válido (evita enviar "-")
  const safeOrderTotal = formatOrderTotal(orderTotal);
  if (safeOrderTotal === "-") {
    return NextResponse.json(
      { error: "orderTotal es requerido y no puede ser '-'" },
      { status: 400 }
    );
  }

  // Payload NAMED (header + body) para tu plantilla ES_AR
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "compra_por_transferencia",
      language: { code: "es_AR" }, // importante: guion bajo
      components: [
        {
          type: "header",
          parameters: [
            {
              type: "text",
              text: name || "Cliente",
              parameter_name: "customer_name", // NAMED
            },
          ],
        },
        {
          type: "body",
          parameters: [
            { type: "text", text: String(orderId), parameter_name: "order_id" },
            {
              type: "text",
              text: safeOrderTotal,
              parameter_name: "order_total",
            },
          ],
        },
      ],
    },
  };

  try {
    const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
    console.log("[send-whatsapp] ▶️ POST", url, {
      to,
      template: payload.template.name,
      lang: payload.template.language.code,
      bodyParams: payload.template.components.find((c) => c.type === "body")
        ?.parameters,
    });

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const raw = await res.text();
    console.log("[send-whatsapp] ◀️ status:", res.status, "raw:", raw);

    let data: any = {};
    try {
      data = JSON.parse(raw);
    } catch {
      // puede no parsear si algún proxy inyecta contenido
    }

    if (!res.ok) {
      const message =
        data?.error?.error_user_msg ||
        data?.error?.message ||
        `WhatsApp API error (${res.status})`;
      return NextResponse.json({ error: message, meta: data }, { status: 500 });
    }

    const wamid = data?.messages?.[0]?.id;
    const wa_id = data?.contacts?.[0]?.wa_id;

    // Devolvemos IDs para trazabilidad (podés guardarlos y cruzarlos con tu webhook)
    return NextResponse.json({ ok: true, wamid, wa_id, raw: data });
  } catch (e: any) {
    console.error("[send-whatsapp] ❌ Exception:", e?.message);
    return NextResponse.json(
      { error: e?.message || "Failed to send message" },
      { status: 500 }
    );
  }
}
