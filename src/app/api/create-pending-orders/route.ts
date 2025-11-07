import { NextRequest, NextResponse } from "next/server";

/**
 * Flujo:
 * 1) Crea Draft Order en Shopify.
 * 2) (Opcional) Holds de inventario.
 * 3) Completa el draft (paymentPending: true) => genera Order.
 * 4) Consulta el total definitivo de la Order (fallback al total del cart si hiciera falta).
 * 5) Envía WhatsApp con plantilla NAMED "compra_por_transferencia" (es_AR).
 * 6) Devuelve { id: orderName, whatsapp?: { wamid, wa_id } }.
 */

// ========================
// Config / Helpers
// ========================

const initialApiVersion = process.env.SHOPIFY_API_VERSION || "2025-04";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

/** Normaliza a E.164 (sin '+'); para AR fuerza 549 si faltara */
function normalizeE164AR(raw?: string | null): string | null {
  if (!raw) return null;
  let n = String(raw).replace(/[^\d+]/g, "");
  if (n.startsWith("+")) n = n.slice(1);
  if (n.startsWith("54") && !n.startsWith("549")) n = "549" + n.slice(2);
  return n || null;
}

/** Envía la plantilla compra_por_transferencia (header: customer_name; body: order_id, order_total) */
async function sendOrderConfirmationWhatsApp(opts: {
  toE164: string; // "549..."
  customerName: string; // {{customer_name}}
  orderId: string; // {{order_id}}
  orderTotal: string; // {{order_total}}
}): Promise<{ wamid?: string; wa_id?: string }> {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.error("[WhatsApp] Missing envs:", {
      hasToken: Boolean(WHATSAPP_TOKEN),
      phoneId: WHATSAPP_PHONE_NUMBER_ID,
    });
    throw new Error("Missing WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID");
  }

  const url = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const payload = {
    messaging_product: "whatsapp",
    to: opts.toE164,
    type: "template",
    template: {
      name: "compra_por_transferencia",
      language: { code: "es_AR" },
      components: [
        {
          type: "header",
          parameters: [
            {
              type: "text",
              text: opts.customerName || "Cliente",
              parameter_name: "customer_name",
            },
          ],
        },
        {
          type: "body",
          parameters: [
            { type: "text", text: opts.orderId, parameter_name: "order_id" },
            {
              type: "text",
              text: opts.orderTotal,
              parameter_name: "order_total",
            },
          ],
        },
      ],
    },
  };

  console.log("[WhatsApp] ▶️ Enviando con:", {
    phoneId: WHATSAPP_PHONE_NUMBER_ID,
    to: opts.toE164,
    template: payload.template.name,
    lang: payload.template.language.code,
    bodyParams: payload.template.components.find((c) => c.type === "body")
      ?.parameters,
  });

  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const raw = await r.text();
  console.log("[WhatsApp] ◀️ status:", r.status, "raw:", raw);

  let data: any = {};
  try {
    data = JSON.parse(raw);
  } catch {}

  if (!r.ok) {
    throw new Error(
      data?.error?.error_user_msg ||
        data?.error?.message ||
        `WhatsApp send failed (${r.status})`
    );
  }

  const wamid = data?.messages?.[0]?.id;
  const wa_id = data?.contacts?.[0]?.wa_id;
  console.log("[WhatsApp] ✅ OK:", wamid, data?.messages?.[0]?.message_status);
  return { wamid, wa_id };
}

// ========================
// Handler principal
// ========================

export async function POST(req: NextRequest) {
  // 1) Leer body
  let payload: any;
  try {
    payload = await req.json();
  } catch (error) {
    console.error("[route.ts] ❌ Body inválido", error);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    cart,
    customerId,
    note = "Pago por transferencia",
    tags = ["transferencia"],
    shippingMethod,
    shippingCost,
    shippingAddress,
  } = payload ?? {};
  console.log("[route.ts] ▶️ Body recibido:", {
    cart: Boolean(cart),
    customerId,
    note,
    tags,
    shippingMethod,
    shippingCost,
    hasShippingAddress: Boolean(shippingAddress),
  });

  if (!customerId) {
    return NextResponse.json(
      { error: "Customer ID is required" },
      { status: 400 }
    );
  }

  // 2) Credenciales Shopify
  const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const storeDomain =
    process.env.SHOPIFY_STORE_DOMAIN ||
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

  console.log("[route.ts] 🔐 adminToken presente?:", Boolean(adminToken));
  console.log("[route.ts] 🌐 storeDomain:", storeDomain);

  if (!adminToken || !storeDomain) {
    console.error("[route.ts] ❌ Credenciales Shopify no configuradas");
    return NextResponse.json(
      { error: "Shopify admin credentials not configured" },
      { status: 500 }
    );
  }

  // 3) GraphQL base + lineItems
  const queryDraftCreate = `
    mutation draftOrderCreate($input: DraftOrderInput!) {
      draftOrderCreate(input: $input) {
        draftOrder { id name status }
        userErrors { field message }
      }
    }
  `;

  const lineItems =
    cart?.lines?.edges
      ?.filter((edge: any) => edge?.node?.merchandise?.quantityAvailable !== 0)
      ?.map((edge: any) => ({
        variantId: edge.node.merchandise.id,
        quantity: edge.node.quantity,
      })) ?? [];

  // 🚫 Si no hay ítems, cortar ya
  if (!lineItems.length) {
    return NextResponse.json(
      { error: "Cart sin ítems válidos" },
      { status: 400 }
    );
  }

  // 4) Endpoint API y shipping address
  let apiVersion = initialApiVersion;
  let endpoint = `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`;
  console.log("[route.ts] 🌍 Intentando versión API:", apiVersion);

  let finalShippingAddress: Record<string, string | null> | null =
    shippingAddress || null;

  if (!finalShippingAddress && customerId) {
    const addrQuery = `
      query getCustomer($id: ID!) {
        customer(id: $id) {
          defaultAddress {
            address1
            address2
            city
            province
            provinceCode
            country
            countryCodeV2
            zip
            firstName
            lastName
            phone
          }
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
        const addr = addrJson.data?.customer?.defaultAddress;
        if (addr) {
          finalShippingAddress = {
            address1: addr.address1,
            address2: addr.address2,
            city: addr.city,
            province: addr.province,
            provinceCode: addr.provinceCode,
            country: addr.country,
            countryCodeV2: addr.countryCodeV2,
            zip: addr.zip,
            firstName: addr.firstName,
            lastName: addr.lastName,
            phone: addr.phone,
          };
        }
        console.log("[route.ts] 🏠 shippingAddress:", finalShippingAddress);
      } else {
        console.warn(
          "[route.ts] ⚠️ No se pudo obtener shippingAddress:",
          addrRes.status
        );
      }
    } catch (e) {
      console.error("[route.ts] ⚠️ Error obteniendo shippingAddress:", e);
    }
  }

  const variablesDraftCreate = {
    input: {
      lineItems,
      note,
      tags,
      ...(customerId ? { customerId } : {}),
      ...(finalShippingAddress
        ? { shippingAddress: finalShippingAddress }
        : {}),
      ...(shippingMethod
        ? {
            shippingLine: {
              title: shippingMethod,
              price: shippingCost != null ? String(shippingCost) : "0",
            },
          }
        : {}),
    },
  };

  // 5) Crear Draft + fallback a unstable
  try {
    console.log("[route.ts] 📤 Fetch a:", endpoint);
    let response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": adminToken,
      },
      body: JSON.stringify({
        query: queryDraftCreate,
        variables: variablesDraftCreate,
      }),
    });
    console.log("[route.ts] 📥 Status:", response.status);

    if (response.status === 404 && apiVersion !== "unstable") {
      console.warn(
        `[route.ts] ⚠️ ${apiVersion} no soportada, reintentando 'unstable'...`
      );
      apiVersion = "unstable";
      endpoint = `https://${storeDomain}/admin/api/unstable/graphql.json`;
      console.log("[route.ts] 📤 Reintentando:", endpoint);
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": adminToken,
        },
        body: JSON.stringify({
          query: queryDraftCreate,
          variables: variablesDraftCreate,
        }),
      });
      console.log("[route.ts] 📥 Status retry:", response.status);
    }

    if (response.status === 404) {
      console.error("[route.ts] ❌ 404 persistente: dominio o token inválido");
      return NextResponse.json(
        { error: "Invalid store domain or token. Verify credentials." },
        { status: 404 }
      );
    }

    const raw = await response.text();
    console.log("[route.ts] 📋 Cuerpo crudo:", raw);
    let json: any;
    try {
      json = JSON.parse(raw);
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
      console.error("[route.ts] ❌ Error draftOrderCreate:", message);
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const draft = json.data.draftOrderCreate.draftOrder;
    console.log("[route.ts] 🎉 Draft creado:", draft.name);

    // 6) Obtener Location (opcional para holds)
    const locationQuery = `query { shop { primaryLocation { id } } }`;
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

    // 7) Holds de inventario (opcional)
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
            lines: [{ merchandiseId: item.variantId, quantity: item.quantity }],
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
        if (hId) holdIds.push(hId);
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

    // 8) Completar Draft (crea la orden con paymentPending: true)
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

    let completeJson: any;
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

    const draftOrderComplete = completeJson.data?.draftOrderComplete ?? {};
    const draftOrder = draftOrderComplete?.draftOrder ?? null;
    const completedOrder =
      draftOrderComplete?.order ??
      draftOrderComplete?.completedOrder ??
      draftOrder?.order ??
      null;

    const orderGid =
      completedOrder?.id ?? draftOrder?.order?.id ?? draftOrder?.id ?? null;

    let orderName =
      completedOrder?.name ??
      draftOrder?.order?.name ??
      draftOrder?.name ??
      null;

    if (!orderName && typeof orderGid === "string") {
      const gidSegments = orderGid.split("/");
      orderName = gidSegments[gidSegments.length - 1] || orderGid;
    }

    if (!orderName) {
      console.warn("[route.ts] ⚠️ draftOrderComplete sin name legible", {
        draftOrderComplete,
      });
      orderName = "Orden pendiente";
    }

    // 🧾 Traer total definitivo de la orden creada
    const orderQuery = `
      query getOrder($id: ID!) {
        order(id: $id) {
          id
          name
          currentTotalPriceSet { shopMoney { amount currencyCode } }
          totalPriceSet        { shopMoney { amount currencyCode } }
        }
      }
    `;
    const orderRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": adminToken,
      },
      body: JSON.stringify({ query: orderQuery, variables: { id: orderGid } }),
    });

    if (!orderRes.ok) {
      console.warn("[route.ts] ⚠️ getOrder no OK:", orderRes.status);
    }

    let orderTotal = "a confirmar";
    try {
      const orderJson = await orderRes.json();
      const money =
        orderJson?.data?.order?.currentTotalPriceSet?.shopMoney ||
        orderJson?.data?.order?.totalPriceSet?.shopMoney ||
        null;

      if (money?.amount) {
        const amountNum = Number(money.amount);
        const currency = money.currencyCode || "ARS";
        orderTotal = new Intl.NumberFormat("es-AR", {
          style: "currency",
          currency,
        }).format(amountNum);
      }
    } catch (e) {
      console.warn("[route.ts] ⚠️ No se pudo parsear getOrder:", e);
    }

    // Fallback con cart si sigue “a confirmar”
    if (orderTotal === "a confirmar") {
      try {
        const amount =
          cart?.cost?.totalAmount?.amount ??
          cart?.estimatedCost?.totalAmount?.amount ??
          null;
        const currency =
          cart?.cost?.totalAmount?.currencyCode ??
          cart?.estimatedCost?.totalAmount?.currencyCode ??
          "ARS";
        if (amount) {
          orderTotal = new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency,
          }).format(Number(amount));
        }
      } catch {}
    }

    // ========================
    // 9) Envío de WhatsApp (no bloqueante)
    // ========================

    const customerName =
      (finalShippingAddress?.firstName || "") +
        (finalShippingAddress?.lastName
          ? ` ${finalShippingAddress.lastName}`
          : "") || "Cliente";

    const toE164 = normalizeE164AR(finalShippingAddress?.phone);
    let whatsappResult: { wamid?: string; wa_id?: string } | undefined;

    if (!toE164 || toE164.length < 12) {
      console.warn("[WhatsApp] Teléfono inválido/corto, no se envía:", {
        toE164,
        raw: finalShippingAddress?.phone,
      });
    } else if (WHATSAPP_TOKEN && WHATSAPP_PHONE_NUMBER_ID) {
      // Envío en background; si falla, no interrumpe la creación de la orden
      sendOrderConfirmationWhatsApp({
        toE164,
        customerName, // header -> {{customer_name}}
        orderId: orderName, // body 1 -> {{order_id}}
        orderTotal, // body 2 -> {{order_total}} (definitivo/fallback)
      })
        .then((res) => {
          whatsappResult = res;
          console.log("[WhatsApp] 📌 wamid guardable:", res?.wamid);
        })
        .catch((e) =>
          console.warn(
            "[WhatsApp] envío no crítico, continúa el flujo:",
            e?.message
          )
        );
    } else {
      console.warn(
        "[WhatsApp] Omitido: faltan WHATSAPP_TOKEN/WHATSAPP_PHONE_NUMBER_ID o teléfono destino",
        {
          hasToken: Boolean(WHATSAPP_TOKEN),
          phoneId: WHATSAPP_PHONE_NUMBER_ID,
          toE164,
        }
      );
    }

    // 10) Respuesta final al cliente
    return NextResponse.json({ id: orderName, whatsapp: whatsappResult });
  } catch (err: any) {
    console.error("[route.ts] 💥 Excepción:", err?.message);
    return NextResponse.json(
      { error: err?.message || "Error interno" },
      { status: 500 }
    );
  }
}
