import { getCollectionByHandle, ShopifyProduct } from "@/lib/shopify";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { handle: string } }
) {
  const url = new URL(req.url);
  const first = parseInt(url.searchParams.get("first") || "16", 10);
  const cursor = url.searchParams.get("cursor");
  const collection = await getCollectionByHandle(
    params.handle,
    first,
    cursor || undefined
  );
  if (!collection) {
    return NextResponse.json(
      { products: [], pageInfo: { hasNextPage: false, endCursor: null } },
      { status: 404 }
    );
  }
  const products: ShopifyProduct[] = collection.products.edges.map(
    (e) => e.node
  );
  return NextResponse.json({
    products,
    pageInfo: collection.products.pageInfo,
  });
}
