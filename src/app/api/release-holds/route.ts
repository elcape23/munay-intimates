import { NextRequest, NextResponse } from "next/server";

const apiVersion = process.env.SHOPIFY_API_VERSION || "2025-04";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch (error) {
    console.error("[release-holds] Invalid JSON body", error);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { draftOrderId, holdIds } = body ?? {};
  if (!draftOrderId && (!holdIds || !holdIds.length)) {
    return NextResponse.json(
      { error: "draftOrderId or holdIds required" },
      { status: 400 }
    );
  }

  const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const storeDomain =
    process.env.SHOPIFY_STORE_DOMAIN ||
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  if (!adminToken || !storeDomain) {
    return NextResponse.json(
      { error: "Shopify admin credentials not configured" },
      { status: 500 }
    );
  }

  const endpoint = `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`;

  try {
    let ids: string[] = holdIds || [];

    if (!ids.length && draftOrderId) {
      const mfQuery = `
        query getMetafield($id: ID!) {
          draftOrder(id: $id) {
            metafield(namespace: "inventory", key: "hold_ids") { value }
          }
        }
           `;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": adminToken,
        },
        body: JSON.stringify({
          query: mfQuery,
          variables: { id: draftOrderId },
        }),
      });
      if (!res.ok) {
        const raw = await res.text();
        console.error("[release-holds] Failed to fetch metafield", {
          status: res.status,
          raw: raw.slice(0, 200),
        });
        throw new Error("No se pudo obtener los holds de inventario.");
      }
      const json = await res.json();
      const value = json.data?.draftOrder?.metafield?.value as
        | string
        | undefined;
      if (value) {
        ids = value.split(",").filter(Boolean);
      }
    }

    const releaseMutation = `
      mutation release($id: ID!) {
        inventoryHoldRelease(id: $id) {
          deletedInventoryHoldId
          userErrors { field message }
        }
      }
    `;

    for (const id of ids) {
      const releaseRes = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": adminToken,
        },
        body: JSON.stringify({ query: releaseMutation, variables: { id } }),
      });
      if (!releaseRes.ok) {
        const raw = await releaseRes.text();
        console.error("[release-holds] Release request failed", {
          status: releaseRes.status,
          raw: raw.slice(0, 200),
        });
        throw new Error("No se pudo liberar el inventario.");
      }
      const releaseJson = await releaseRes.json();
      const userErrors =
        releaseJson?.data?.inventoryHoldRelease?.userErrors || [];
      if (userErrors.length) {
        console.error("[release-holds] Shopify userErrors", userErrors);
        throw new Error(
          userErrors[0]?.message || "No se pudo liberar el inventario."
        );
      }
    }

    return NextResponse.json({ released: ids.length });
  } catch (error) {
    console.error("[release-holds] Unexpected error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}
