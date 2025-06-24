import { getCollectionsBySeason } from "@/lib/shopify";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/common/footer";

export default async function SeasonPage({
  params,
}: {
  params: { season: string };
}) {
  const { season } = params;
  const collections = await getCollectionsBySeason(season);
  if (!collections.length) notFound();

  return (
    <main className="pt-[67px] bg-gray-50 min-h-screen">
      <section className="container mx-auto px-6 pb-16">
        <h1 className="body-01-medium uppercase tracking-tight text-text-primary-default mb-4">
          {season}
        </h1>
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {collections.map((c) => (
            <li key={c.id}>
              <Link
                href={`/collections/${c.handle}`}
                className="block p-4 border rounded hover:bg-gray-50"
              >
                {c.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <Footer />
    </main>
  );
}
