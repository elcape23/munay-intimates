import { NextRequest, NextResponse } from "next/server";

const apiVersion = process.env.SHOPIFY_API_VERSION || "2025-04";

export async function POST(req: NextRequest) {
  const { countryCode, provinceCode } = await req.json();
  if (!countryCode) {
    return NextResponse.json(
      { error: "countryCode required" },
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

  const endpoint = `https://${storeDomain}/admin/api/${apiVersion}/shipping_zones.json`;

  try {
    const res = await fetch(endpoint, {
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": adminToken,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: res.status });
    }

    const data = await res.json();
    let price: number | null = null;

    for (const zone of data.shipping_zones || []) {
      for (const country of zone.countries || []) {
        if (country.code !== countryCode) continue;
        let rates = [];

        if (provinceCode) {
          const province = country.provinces?.find(
            (p: any) => p.code === provinceCode
          );
          if (province?.price_based_shipping_rates?.length) {
            rates = province.price_based_shipping_rates;
          }
        }

        if (!rates.length && country.price_based_shipping_rates?.length) {
          rates = country.price_based_shipping_rates;
        }
        if (!rates.length && zone.price_based_shipping_rates?.length) {
          rates = zone.price_based_shipping_rates;
        }
        if (rates.length) {
          price = parseFloat(rates[0].price);
          break;
        }
      }
      if (price !== null) break;
    }

    return NextResponse.json({ price });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
