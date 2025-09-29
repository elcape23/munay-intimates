import type { CSSProperties } from "react";

export const COLOR_MAP: Record<string, string> = {
  Amarillo: "#ece075ff",
  Avellana: "#C6A597",
  Azul: "#0000ff",
  Beige: "#e0d5ca",
  Blanco: "#ffffff",
  Celeste: "#aeb3b9",
  Durazno: "#F7D0A2",
  Fucsia: "#FF36D6",
  Gris: "#808080",
  "Gris Humo": "#74818C",
  Ladrillo: "#ec6d23",
  Lila: "#B58596",
  Marfil: "#E7D5C7",
  Marrón: "#9A5630",
  Mostaza: "#e8b11e",
  Multicolor: "#000000",
  Naranja: "#FF8A00",
  Negro: "#4a4741",
  Nude: "#BFA9A4",
  Oliva: "#8D978E",
  Rosa: "#F8D9D2",
  Suela: "B77517",
  Terra: "#8A3515",
  Vison: "#dccd9e",
};

export const getColorStyle = (color: string): CSSProperties => {
  if (color === "Multicolor") {
    return {
      backgroundImage:
        "linear-gradient(135deg, #e8b11e 0%, #FF36D6 50%, #0000ff 100%)",
    };
  }

  return {
    backgroundColor: COLOR_MAP[color] ?? color,
  };
};
