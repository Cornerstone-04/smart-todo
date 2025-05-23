"use client";

import { ListChecks } from "lucide-react";

export function Header() {
  return (
    <header className="py-6 px-4 md:px-8 border-b border-border/50 shadow-sm bg-card">
      <div className="container mx-auto flex items-center gap-3">
        <ListChecks className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">SmartDo</h1>
      </div>
    </header>
  );
}
