"use client";

// Toggle group component stub - not used in this project
// Simplified to remove Radix UI dependency

import * as React from "react";
import { cn } from "./utils";
import { toggleVariants } from "./toggle";

type ToggleVariant = "default" | "outline";
type ToggleSize = "default" | "sm" | "lg";

interface ToggleVariantProps {
  size?: ToggleSize;
  variant?: ToggleVariant;
}

const ToggleGroupContext = React.createContext<ToggleVariantProps>({
  size: "default",
  variant: "default",
});

interface ToggleGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ToggleVariant;
  size?: ToggleSize;
  type?: "single" | "multiple";
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
}

export function ToggleGroup({
  className,
  variant,
  size,
  children,
  ...props
}: ToggleGroupProps) {
  return (
    <div
      data-variant={variant}
      data-size={size}
      className={cn(
        "flex w-fit items-center rounded-md",
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </div>
  );
}

interface ToggleGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ToggleVariant;
  size?: ToggleSize;
  value: string;
}

export function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: ToggleGroupItemProps) {
  const context = React.useContext(ToggleGroupContext);
  const finalVariant = context.variant || variant || "default";
  const finalSize = context.size || size || "default";

  return (
    <button
      type="button"
      data-variant={finalVariant}
      data-size={finalSize}
      className={cn(
        typeof toggleVariants === 'function' 
          ? toggleVariants(finalVariant, finalSize)
          : '',
        "min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
