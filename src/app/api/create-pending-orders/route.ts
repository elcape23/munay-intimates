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
const initialApiVersion = process.env.SHOPIFY_API_VERSION || "2025-04";

export async function POST(req: NextRequest) {
  // 1. Leer body
  const {
    cart,
    customerId,
    note = "Pago por transferencia",
    tags = ["transferencia"],
  } = await req.json();
  console.log("[route.ts] ▶️ Body recibido:", { cart, customerId, note, tags });

  if (!customerId) {
    return NextResponse.json(
      { error: "Customer ID is required" },
      { status: 400 }
    );
  }
  // 2. Cargar vars de entorno (solo servidor)
  const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  console.log("[route.ts] 🔐 adminToken presente?:", Boolean(adminToken));
  const storeDomain =
    process.env.SHOPIFY_STORE_DOMAIN ||
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
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

  // 4. Definir endpoint y obtener dirección por defecto
  let apiVersion = initialApiVersion;
  let endpoint = `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`;
  console.log("[route.ts] 🌍 Intentando versión API:", apiVersion);

  let address1: string | null = null;
  if (customerId) {
    const addrQuery = `
      query getCustomer($id: ID!) {
        customer(id: $id) {
          defaultAddress { address1 }
        }
      }
    `;
    try {
      const addrRes = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": adminToken,
        },
        body: JSON.stringify({
          query: addrQuery,
          variables: { id: customerId },
        }),
      });
      if (addrRes.ok) {
        const addrJson = await addrRes.json();
        address1 = addrJson.data?.customer?.defaultAddress?.address1 || null;
        console.log("[route.ts] 🏠 address1:", address1);
      } else {
        console.warn(
          "[route.ts] ⚠️ No se pudo obtener address1:",
          addrRes.status
        );
      }
    } catch (e) {
      console.error("[route.ts] ⚠️ Error obteniendo address1:", e);
    }
  }
  const variables = {
    input: {
      lineItems,
      note,
      tags,
      ...(customerId ? { customerId } : {}),
      ...(address1 ? { shippingAddress: { address1 } } : {}),
    },
  };

  // 5. Intentar crear el draft con fallback a 'unstable'

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

    // Ambas versiones dieron 404 -> posibles credenciales incorrectas
    if (response.status === 404) {
      console.error("[route.ts] ❌ 404 persistente: dominio o token inválido");
      return NextResponse.json(
        {
          error: "Invalid store domain or token. Verify credentials.",
        },
        { status: 404 }
      );
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

    const locationQuery = `
      query { shop { primaryLocation { id } } }
    `;
    const locRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": adminToken,
      },
      body: JSON.stringify({ query: locationQuery }),
    });
    const locJson = await locRes.json();
    const locationId = locJson.data?.shop?.primaryLocation?.id || null;
    console.log("[route.ts] 📦 locationId:", locationId);

    const holdMutation = `
      mutation hold($input: InventoryHoldInput!) {
        inventoryHoldCreate(input: $input) {
          inventoryHold { id }
          userErrors { field message }
        }
      }
    `;
    const holdIds: string[] = [];
    if (locationId) {
      for (const item of lineItems) {
        const holdVars = {
          input: {
            reason: "RESERVE_ON_PURCHASE",
            locationId,
            lines: [
              {
                merchandiseId: item.variantId,
                quantity: item.quantity,
              },
            ],
          },
        };
        const holdRes = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": adminToken,
          },
          body: JSON.stringify({ query: holdMutation, variables: holdVars }),
        });
        const holdJson = await holdRes.json();
        const hId = holdJson.data?.inventoryHoldCreate?.inventoryHold?.id;
        if (hId) {
          holdIds.push(hId);
        }
        if (
          holdJson.errors ||
          holdJson.data?.inventoryHoldCreate?.userErrors?.length
        ) {
          console.warn(
            "[route.ts] ⚠️ Error creando hold:",
            holdJson.errors || holdJson.data?.inventoryHoldCreate?.userErrors
          );
        }
      }
    }

    if (holdIds.length) {
      const updateMutation = `
        mutation updateDraft($input: DraftOrderInput!) {
          draftOrderUpdate(input: $input) {
            draftOrder { id }
            userErrors { field message }
          }
        }
      `;
      const updateVars = {
        input: {
          id: draft.id,
          metafields: [
            {
              namespace: "inventory",
              key: "hold_ids",
              type: "single_line_text_field",
              value: holdIds.join(","),
            },
          ],
        },
      };
      const updRes = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": adminToken,
        },
        body: JSON.stringify({ query: updateMutation, variables: updateVars }),
      });
      const updJson = await updRes.json();
      if (
        updJson.errors ||
        updJson.data?.draftOrderUpdate?.userErrors?.length
      ) {
        console.warn(
          "[route.ts] ⚠️ Error guardando metafield:",
          updJson.errors || updJson.data?.draftOrderUpdate?.userErrors
        );
      }
    }
    const completeMutation = `
      mutation completeDraft($id: ID!) {
        draftOrderComplete(id: $id, paymentPending: true) {
          draftOrder { order { id name } }
          userErrors { field message }
        }
      }
    `;
    const completeRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": adminToken,
      },
      body: JSON.stringify({
        query: completeMutation,
        variables: { id: draft.id },
      }),
    });
    const completeText = await completeRes.text();
    console.log("[route.ts] 📋 Complete raw:", completeText);
    let completeJson;
    try {
      completeJson = JSON.parse(completeText);
    } catch (e) {
      console.error("[route.ts] ⚠️ JSON inválido al completar:", e);
      throw e;
    }
    if (
      !completeRes.ok ||
      completeJson.errors ||
      completeJson.data?.draftOrderComplete?.userErrors?.length
    ) {
      const message =
        completeJson.errors?.[0]?.message ||
        completeJson.data?.draftOrderComplete?.userErrors?.[0]?.message ||
        "Error desconocido";
      console.error("[route.ts] ❌ Error completando draft:", message);
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const orderName =
      completeJson.data.draftOrderComplete.draftOrder.order.name;
    return NextResponse.json({ id: orderName });
  } catch (err: any) {
    console.error("[route.ts] 💥 Excepción:", err.message);
    return NextResponse.json(
      { error: err.message || "Error interno" },
      { status: 500 }
    );
  }
}
