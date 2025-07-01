import {
  getNewProducts,
  getRecommendedProducts,
  searchProducts,
  FeaturedProduct,
  ShopifyProduct,
} from "@/lib/shopify";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = url.searchParams.get("q");
  const limit = parseInt(url.searchParams.get("limit") || "8", 10);

  if (query) {
    const results: ShopifyProduct[] = await searchProducts(query, limit);
    let suggestions: ShopifyProduct[] = [];
    if (results.length > 0) {
      try {
        suggestions = await getRecommendedProducts(results[0].id, 4);
      } catch {
        suggestions = [];
      }
    }
    return NextResponse.json({ results, suggestions });
  }

  const suggestions: FeaturedProduct[] = await getNewProducts(limit);
  return NextResponse.json({ suggestions });
}
