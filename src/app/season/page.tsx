import Link from "next/link";
import { Footer } from "@/components/common/footer";

export default function SeasonIndexPage() {
  const seasons = ["invierno", "verano", "oto\u00f1o", "primavera"];

  return (
    <section className="container pt-[60px] mx-auto px-6 min-h-screen">
      <h1 className="body-01-medium uppercase tracking-tight text-text-primary-default mb-4">
        Temporadas
      </h1>
      <p className="body-02-regular mb-2">
        Seleccion\u00e1 una temporada para ver las colecciones disponibles.
      </p>
      <ul className="list-disc list-inside space-y-1">
        {seasons.map((s) => (
          <li key={s}>
            <Link href={`/season/${s}`} className="underline">
              {s}
            </Link>
          </li>
        ))}
      </ul>
      <Footer />
    </section>
  );
}
