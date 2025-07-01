import { getNewProducts, FeaturedProduct } from "@/lib/shopify";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // In this simplified API route we ignore any search term and
  // simply return a list of new products as suggestions.
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "8", 10);
  const products: FeaturedProduct[] = await getNewProducts(limit);
  return NextResponse.json(products);
}
