import { notFound, redirect } from "next/navigation";

export default function CartCatchAllPage({
  params,
  searchParams,
}: {
  params: { slug: string[] };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (params.slug[0] === "c") {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (typeof value === "string") {
        search.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((v) => search.append(key, v));
      }
    }
    const searchString = search.toString();
    const url = `https://${
      process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
    }/cart/${params.slug.join("/")}${searchString ? `?${searchString}` : ""}`;
    redirect(url);
  }

  notFound();
}
