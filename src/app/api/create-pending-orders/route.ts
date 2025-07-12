import { NextRequest, NextResponse } from "next/server";

const initialApiVersion = process.env.SHOPIFY_API_VERSION || "2024-10";

console.log("USANDO TOKEN:", process.env.SHOPIFY_ADMIN_ACCESS_TOKEN);
console.log("USANDO VERSION:", process.env.SHOPIFY_API_VERSION);

export async function POST(req: NextRequest) {
  const {
    cart,
    note = "Pago por transferencia",
    tags = ["transferencia"],
  } = await req.json();
  console.log("[route.ts] ▶️ Body recibido:", { cart, note, tags });

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

  let apiVersion = initialApiVersion;
  let endpoint = `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`;
  console.log("[route.ts] 🌍 Intentando versión API:", apiVersion);

  let response;
  try {
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

    if (
      !response.ok ||
      json.errors ||
      json.data?.draftOrderCreate?.userErrors?.length
    ) {
      const message =
        json.errors?.[0]?.message ||
        json.data?.draftOrderCreate?.userErrors?.[0]?.message ||
        "Error desconocido";
      const details = {
        status: response.status,
        message,
        errors: json.errors,
        userErrors: json.data?.draftOrderCreate?.userErrors,
      };

      console.error("[route.ts] ❌ Error del API:", details);

      return NextResponse.json(details, {
        status: response.ok ? 400 : response.status,
      });
    }

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
