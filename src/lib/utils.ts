import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function formatProductTitle(title: string): string {
  if (!title) {
    return title;
  }

  const capitalizeWord = (word: string) => {
    if (!word) {
      return word;
    }

    if (word.length <= 3 && word === word.toUpperCase()) {
      return word.toUpperCase();
    }

    const lower = word.toLocaleLowerCase("es-AR");
    const firstChar = lower.charAt(0);

    if (!firstChar) {
      return word;
    }

    return firstChar.toLocaleUpperCase("es-AR") + lower.slice(1);
  };

  if (
    typeof (Intl as { Segmenter?: typeof Intl.Segmenter }).Segmenter ===
    "function"
  ) {
    const segmenter = new Intl.Segmenter("es", { granularity: "word" });
    let result = "";
    let lastIndex = 0;

    const segments = Array.from(segmenter.segment(title));

    segments.forEach(({ segment, index, isWordLike }) => {
      if (index > lastIndex) {
        result += title.slice(lastIndex, index);
      }

      if (isWordLike) {
        result += capitalizeWord(segment);
      } else {
        result += segment;
      }

      lastIndex = index + segment.length;
    });

    if (lastIndex < title.length) {
      result += title.slice(lastIndex);
    }

    return result;
  }

  return title
    .split(/([\s\-\/]+)/)
    .map((segment) => {
      if (!segment || !/[a-záéíóúüñ]/i.test(segment)) {
        return segment;
      }

      return capitalizeWord(segment);
    })
    .join("");
}
