import { getCollectionByHandle, ShopifyProduct } from "@/lib/shopify";
import { sortProductsByAvailability } from "@/lib/product-helpers";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { handle: string } }
) {
  try {
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
    const products: ShopifyProduct[] = sortProductsByAvailability(
      collection.products.edges.map((e) => e.node)
    );
    return NextResponse.json({
      products,
      pageInfo: collection.products.pageInfo,
    });
  } catch (error) {
    console.error("[api/collections] Error loading collection", error);
    return NextResponse.json(
      { error: "Failed to load collection" },
      { status: 500 }
    );
  }
}
