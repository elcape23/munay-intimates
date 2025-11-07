import {
  getNewProducts,
  searchProducts,
  FeaturedProduct,
  ShopifyProduct,
} from "@/lib/shopify";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
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
  } catch (error) {
    console.error("[api/search] Error fetching data", error);
    return NextResponse.json(
      { error: "Failed to load search results" },
      { status: 500 }
    );
  }
}
