// src/components/ui/input.tsx

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Por defecto, ocupa el 100% del ancho del contenedor.
   * Pasa `size` nativo u otras props html como `type`, `placeholder`, etc.
   */
}

/**
 * Componente de *Input* base del Design System Munay.
 *  - Tokens: usa los colores neutros y el ring primario definidos en `tailwind.config.ts`.
 *  - Estados: `hover`, `focus`, `disabled`.
 *  - Accesibilidad: mantiene `outline` y `ring` para usuarios de teclado.
 *
 * Ejemplo de uso:
 * ```tsx
 * <Input type="email" placeholder="you@example.com" />
 * ```
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-border-primary bg-background-fill-neutral-default px-3 py-2 text-sm placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-ring-primary disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
