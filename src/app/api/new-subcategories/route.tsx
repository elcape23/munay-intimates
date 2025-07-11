import { getNewestProductsFull, NavItem } from "@/lib/shopify";
import { slugify } from "@/lib/utils";
import { NextResponse } from "next/server";

let cache: { timestamp: number; items: NavItem[] } | null = null;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

async function fetchSubcategories(): Promise<NavItem[]> {
  const newest = await getNewestProductsFull(250);
  const subSet = new Set<string>();

  newest.forEach((p) => {
    p.tags?.forEach((tag) => {
      const parts = tag.split(":");
      if (
        parts.length === 2 &&
        ["subcategoría", "subcategoria"].includes(parts[0].trim().toLowerCase())
      ) {
        subSet.add(parts[1].trim());
      }
    });
  });

  return Array.from(subSet).map((name) => ({
    id: `subcat-${slugify(name)}`,
    title: name.toUpperCase(),
    url: `/collections/new?subcategory=${slugify(name)}`,
    section: "new",
    isNew: true,
  }));
}

export async function GET() {
  if (!cache || Date.now() - cache.timestamp > CACHE_TTL) {
    const items = await fetchSubcategories();
    cache = { timestamp: Date.now(), items };
  }

  return NextResponse.json(cache!.items);
}
