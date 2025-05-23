"use client";

import { Badge } from "@/components/ui/badge";
import { Briefcase, Home, ShoppingCart, AlertTriangle, Tag } from "lucide-react";
import type { ReactNode } from "react";

interface CategoryPillProps {
  category: string;
  className?: string;
}

const categoryIcons: Record<string, ReactNode> = {
  work: <Briefcase className="h-3 w-3" />,
  personal: <Home className="h-3 w-3" />,
  shopping: <ShoppingCart className="h-3 w-3" />,
  urgent: <AlertTriangle className="h-3 w-3" />,
};

export function CategoryPill({ category, className }: CategoryPillProps) {
  const icon = categoryIcons[category.toLowerCase()] || <Tag className="h-3 w-3" />;
  
  // Determine badge variant based on category for visual distinction
  let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
  if (category.toLowerCase() === "urgent") {
    variant = "destructive";
  } else if (category.toLowerCase() === "work") {
    variant = "default";
  }


  return (
    <Badge variant={variant} className={className ? className : "capitalize"}>
      {icon}
      <span className="ml-1.5">{category}</span>
    </Badge>
  );
}
