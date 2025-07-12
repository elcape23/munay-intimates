import { NextRequest, NextResponse } from "next/server";

// Asegúrate de que tu token ADMIN tenga los scopes necesarios (draft_orders, write_draft_orders) y sea un Admin API Access Token, no Storefront.
// Para verificar manualmente, corre en tu terminal:
// curl -X POST https://YOUR_STORE_DOMAIN/admin/api/unstable/graphql.json \
//   -H "X-Shopify-Access-Token: YOUR_ADMIN_TOKEN" \
//   -H "Content-Type: application/json" \
//   -d '{"query":"{ shop { name } }"}'
// y comprueba que no obtienes 404.

// Variables de entorno en .env.local:
// SHOPIFY_STORE_DOMAIN=munayintimates.myshopify.com
// SHOPIFY_ADMIN_ACCESS_TOKEN=tu-admin-access-token
// (Opcional) SHOPIFY_API_VERSION=2024-10 (o la versión que soporte tu tienda)
const initialApiVersion = process.env.SHOPIFY_API_VERSION || "2024-10";

export async function POST(req: NextRequest) {
  // 1. Leer body
  const {
    cart,
    note = "Pago por transferencia",
    tags = ["transferencia"],
  } = await req.json();
  console.log("[route.ts] ▶️ Body recibido:", { cart, note, tags });

  // 2. Cargar vars de entorno (solo servidor)
  const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  console.log("[route.ts] 🔐 adminToken presente?:", Boolean(adminToken));
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  console.log("[route.ts] 🌐 storeDomain:", storeDomain);

  if (!adminToken || !storeDomain) {
    console.error("[route.ts] ❌ Credenciales no configuradas");
    return NextResponse.json(
      { error: "Shopify admin credentials not configured" },
      { status: 500 }
    );
  }

  // 3. Preparar query y variables
  const query = `
    mutation draftOrderCreate($input: DraftOrderInput!) {
      draftOrderCreate(input: $input) {
        draftOrder { id name status }
        userErrors { field message }
      }
    }
  `;
  const lineItems = cart.lines.edges
    .filter((edge: any) => edge.node.merchandise.quantityAvailable !== 0)
    .map((edge: any) => ({
      variantId: edge.node.merchandise.id,
      quantity: edge.node.quantity,
    }));
  const variables = { input: { lineItems, note, tags } };

  // 4. Intentar con versión inicial, fallback a 'unstable'
  let apiVersion = initialApiVersion;
  let endpoint = `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`;
  console.log("[route.ts] 🌍 Intentando versión API:", apiVersion);

  let response;
  try {
    // 5. Envío de petición
    console.log("[route.ts] 📤 Fetch a:", endpoint);
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": adminToken,
      },
      body: JSON.stringify({ query, variables }),
    });
    console.log("[route.ts] 📥 Status:", response.status);

    // 6. Fallback en caso de 404
    if (response.status === 404 && apiVersion !== "unstable") {
      console.warn(
        `[route.ts] ⚠️ Versión ${apiVersion} no soportada, reintentando con 'unstable'...`
      );
      apiVersion = "unstable";
      endpoint = `https://${storeDomain}/admin/api/unstable/graphql.json`;
      console.log("[route.ts] 📤 Reintentando fetch a:", endpoint);
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": adminToken,
        },
        body: JSON.stringify({ query, variables }),
      });
      console.log("[route.ts] 📥 Status tras retry:", response.status);
    }

    // 7. Leer cuerpo y parsear JSON
    const text = await response.text();
    console.log("[route.ts] 📋 Cuerpo crudo:", text);
    let json;
    try {
      json = JSON.parse(text);
      console.log(
        "[route.ts] ✅ JSON parseado errors/userErrors:",
        json.errors,
        json.data?.draftOrderCreate?.userErrors
      );
    } catch (e) {
      console.error("[route.ts] ⚠️ JSON inválido:", e);
      throw e;
    }

    // 8. Manejar errores API
    if (
      !response.ok ||
      json.errors ||
      json.data?.draftOrderCreate?.userErrors?.length
    ) {
      const message =
        json.errors?.[0]?.message ||
        json.data?.draftOrderCreate?.userErrors?.[0]?.message ||
        "Error desconocido";
      console.error("[route.ts] ❌ Error del API:", message);
      return NextResponse.json({ error: message }, { status: 400 });
    }

    // 9. Éxito
    const draft = json.data.draftOrderCreate.draftOrder;
    console.log("[route.ts] 🎉 Draft creado:", draft.name);
    return NextResponse.json({ id: draft.name });
  } catch (err: any) {
    console.error("[route.ts] 💥 Excepción:", err.message);
    return NextResponse.json(
      { error: err.message || "Error interno" },
      { status: 500 }
    );
  }
}
