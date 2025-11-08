"use client";

// Toggle component stub - not used in this project
// Simplified to remove Radix UI dependency

import * as React from "react";
import { cn } from "./utils";

type ToggleVariant = "default" | "outline";
type ToggleSize = "default" | "sm" | "lg";

interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ToggleVariant;
  size?: ToggleSize;
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

const getToggleClasses = (variant: ToggleVariant = "default", size: ToggleSize = "default", pressed: boolean = false) => {
  const baseClasses = "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none transition-colors";
  
  const variantClasses = {
    default: pressed ? "bg-accent text-accent-foreground" : "bg-transparent",
    outline: pressed 
      ? "border border-input bg-accent text-accent-foreground" 
      : "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground"
  };
  
  const sizeClasses = {
    default: "h-9 px-2 min-w-9",
    sm: "h-8 px-1.5 min-w-8",
    lg: "h-10 px-2.5 min-w-10"
  };
  
  return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
};

export function Toggle({
  className,
  variant = "default",
  size = "default",
  pressed = false,
  onPressedChange,
  onClick,
  ...props
}: ToggleProps) {
  const [isPressed, setIsPressed] = React.useState(pressed);
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const newPressed = !isPressed;
    setIsPressed(newPressed);
    onPressedChange?.(newPressed);
    onClick?.(e);
  };
  
  return (
    <button
      type="button"
      data-state={isPressed ? "on" : "off"}
      className={cn(getToggleClasses(variant, size, isPressed), className)}
      onClick={handleClick}
      {...props}
    />
  );
}

export const toggleVariants = getToggleClasses;
