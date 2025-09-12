import { NextRequest, NextResponse } from "next/server";

// Si luego querés validar la firma X-Hub-Signature-256, agregamos el secreto y verificación HMAC.
// const WHATSAPP_APP_SECRET = process.env.WHATSAPP_APP_SECRET;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log("[Webhook] ✅ Verificado");
    return new NextResponse(challenge ?? "", { status: 200 });
  }

  console.warn("[Webhook] ❌ Verificación fallida", { mode, token });
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  // Si quisieras validar firma:
  // const signature = req.headers.get("x-hub-signature-256");
  // const raw = await req.text();
  // if (!isValidSignature(raw, signature, WHATSAPP_APP_SECRET)) return new NextResponse("Invalid signature", { status: 401 });
  // const body = JSON.parse(raw);

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: true }); // evitar 5xx por body inválido

  try {
    // Estructura Cloud API
    // body.entry[].changes[].value.statuses[]  -> estados de mensajes
    // body.entry[].changes[].value.messages[]  -> mensajes entrantes (si habilitás recibir mensajes)
    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value || {};
        const statuses = value.statuses || [];
        const messages = value.messages || [];

        // ESTADOS (sent, delivered, read, failed)
        for (const st of statuses) {
          const status = st.status; // sent | delivered | read | failed
          const wamid = st.id; // id del mensaje que vos enviaste
          const to = st.recipient_id;
          const ts = Number(st.timestamp) * 1000;
          const tsIso = isNaN(ts) ? null : new Date(ts).toISOString();
          const errors = st.errors || [];

          console.log("[Webhook] 📬 status:", {
            status,
            wamid,
            to,
            ts: tsIso,
            conversation: st.conversation,
            pricing: st.pricing,
            errors,
          });

          // TODO: Guardar en DB por wamid:
          // upsertMessageStatus({ wamid, status, to, timestamp: tsIso, errors, pricing, conversation })
        }

        // MENSAJES ENTRANTES (si usás el canal para recibir)
        for (const msg of messages) {
          const from = msg.from; // wa_id del cliente
          const id = msg.id; // wamid del mensaje entrante
          const type = msg.type; // text | image | ...
          const ts = Number(msg.timestamp) * 1000;
          const tsIso = isNaN(ts) ? null : new Date(ts).toISOString();

          let content: any = {};
          if (type === "text") content = msg.text;
          if (type === "interactive") content = msg.interactive;

          console.log("[Webhook] 💬 message:", {
            id,
            from,
            type,
            ts: tsIso,
            content,
          });

          // TODO: Persistir mensaje entrante si te interesa:
          // saveInboundMessage({ id, from, type, content, timestamp: tsIso })
          // Opcional: responder automáticamente según keywords/flows.
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[Webhook] ❌ Error procesando payload:", e?.message);
    return NextResponse.json({ ok: true }); // WhatsApp espera 200/OK siempre
  }
}

/* Ejemplo de verificación de firma HMAC (si lo necesitás)
import crypto from "crypto";
function isValidSignature(raw: string, headerSig: string | null, appSecret?: string) {
  if (!headerSig || !appSecret) return true; // si no querés validar, devolvé true
  const hmac = crypto.createHmac("sha256", appSecret).update(raw, "utf-8").digest("hex");
  const expected = `sha256=${hmac}`;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(headerSig));
}
*/
