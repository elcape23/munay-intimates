// src/components/home/NoClipSection.tsx
export function NoClipSection() {
  return (
    <section className="px-6 mt-8">
      <h2 className="text-lg font-medium mb-2">Sin clip</h2>
      <p className="text-sm text-text-secondary">
        Descubre nuestra nueva línea sin costuras ni presiones.
      </p>
      <img
        src="/images/home-no-clip.jpg"
        alt="Sin clip"
        className="w-full h-auto rounded-lg mt-4"
      />
    </section>
  );
}
