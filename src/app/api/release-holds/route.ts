import { NextRequest, NextResponse } from "next/server";

const apiVersion = process.env.SHOPIFY_API_VERSION || "2025-04";

export async function POST(req: NextRequest) {
  const { draftOrderId, holdIds } = await req.json();
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
      body: JSON.stringify({ query: mfQuery, variables: { id: draftOrderId } }),
    });
    const json = await res.json();
    const value = json.data?.draftOrder?.metafield?.value as string | undefined;
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
    await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": adminToken,
      },
      body: JSON.stringify({ query: releaseMutation, variables: { id } }),
    });
  }

  return NextResponse.json({ released: ids.length });
}
