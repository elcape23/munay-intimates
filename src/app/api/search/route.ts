import {
  getNewProducts,
  searchProducts,
  FeaturedProduct,
  ShopifyProduct,
} from "@/lib/shopify";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = url.searchParams.get("q");
  const limit = parseInt(
    url.searchParams.get("limit") || (query ? "3" : "8"),
    10
  );
  if (query) {
    const results: ShopifyProduct[] = await searchProducts(query, limit);
    const suggestions: FeaturedProduct[] = await getNewProducts(4);
    return NextResponse.json({ results, suggestions });
  }

  const suggestions: FeaturedProduct[] = await getNewProducts(limit);
  return NextResponse.json({ suggestions });
}
