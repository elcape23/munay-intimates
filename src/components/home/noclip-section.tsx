import React from "react";
import { ArrowLongRightIcon } from "@heroicons/react/24/outline";

interface NoClipSectionProps {
  images: string[];
  onVerMas?: () => void;
}

export const NoClipSection: React.FC<NoClipSectionProps> = ({
  images,
  onVerMas,
}) => (
  <section
    id="noclip-section"
    className="py-8 space-y-3 bg-background-primary-default"
  >
    {/* Título */}
    <h2 className="heading-06-medium ml-6">Bienvenido Invierno!</h2>

    {/* Carousel con slides de imagen y slide de "Ver más" */}
    <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar space-x-3">
      {images.map((src, idx) => (
        <div
          key={idx}
          className="snap-start flex-shrink-0 w-75 h-75 overflow-hidden"
        >
          <img
            src={src}
            alt={`Invierno Slide ${idx + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Slide de "Ver más" al final */}
      <div
        className="snap-start flex-shrink-0 inline-flex flex-col px-8 h-75 justify-center cursor-pointer space-y-3"
        onClick={onVerMas}
      >
        <ArrowLongRightIcon className="w-8 h-8 mt-2 text-icon-primary-default" />
        <span className="heading-05-medium text-primary-default">Ver más</span>
      </div>
    </div>
  </section>
);
