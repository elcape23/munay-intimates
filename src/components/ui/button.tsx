// src/components/ui/button.tsx

"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // LA CORRECCIÓN: He quitado 'text-sm' y 'font-medium' de aquí.
  // Ahora, cada variante de 'size' es 100% responsable de su tipografía.
  // Solo dejamos los estilos que son verdaderamente comunes a TODOS los botones.
  "inline-flex items-center justify-center whitespace-nowrap  transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-background-fill-neutral-default text-text-primary-invert hover:bg-background-fill-neutral-hover",
        secondary:
          "bg-background-fill-neutral-secondary text-text-primary-default hover:bg-background-fill-neutral-hover",
        destructive:
          "bg-background-fill-danger-default text-text-danger-invert hover:bg-background-fill-danger-hover hover:text-text-danger-invert",
        outline:
          "border border-border-primary-default bg-transparent text-text-primary-default hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:accent hover:text-accent-foreground",
        link: "text-text-primary-default underline-offset-2 text-decoration: underline hover:underline-0",
      },
      size: {
        // Ahora, cada size define su propia tipografía sin conflictos.
        // Y como estas clases ya definen la familia de fuente, ya no necesitamos
        // poner `font-default` en los estilos base.
        default: "px-4 py-3 gap-1 body-02-bold",
        sm: "px-4 py-2 gap-1 body-03-semibold",
        md: "px-4 py-2 gap-1 body-02-semibold",
        lg: "px-4 py-3 gap-1 body-01-bold",
        icon: "h-6 w-6",
        text: "h-6 w-auto",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    // Generate the classes for the current variant and size
    let classes = buttonVariants({ variant, size });

    // When using icon size we don't want to apply hover styles
    if (size === "icon") {
      classes = classes
        .split(" ")
        .filter((c) => !c.startsWith("hover:"))
        .join(" ");
    }

    return <Comp className={cn(classes, className)} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
