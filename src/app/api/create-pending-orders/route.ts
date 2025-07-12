import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const {
    cart,
    note = "Pago por transferencia",
    tags = ["transferencia"],
  } = await req.json();

  const adminToken = process.env.NEXT_PUBLIC_SHOPIFY_ADMIN_ACCESS_TOKEN;
  const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

  if (!adminToken || !storeDomain) {
    return NextResponse.json(
      { error: "Shopify admin credentials not configured" },
      { status: 500 }
    );
  }

  const query = `
    mutation draftOrderCreate($input: DraftOrderInput!) {
      draftOrderCreate(input: $input) {
        draftOrder {
          id
          name
          status
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const lineItems = cart.lines.edges
    .filter((edge: any) => edge.node.merchandise.quantityAvailable !== 0)
    .map((edge: any) => ({
      variantId: edge.node.merchandise.id,
      quantity: edge.node.quantity,
    }));

  const variables = {
    input: { lineItems, note, tags },
  };

  const response = await fetch(
    `https://${storeDomain}/admin/api/2024-04/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": adminToken,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  const json = await response.json();

  if (
    !response.ok ||
    json.errors ||
    json.data?.draftOrderCreate?.userErrors?.length
  ) {
    const message =
      json.errors?.[0]?.message ||
      json.data?.draftOrderCreate?.userErrors?.[0]?.message ||
      "Error";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const draft = json.data.draftOrderCreate.draftOrder;

  return NextResponse.json({ id: draft.name });
}
