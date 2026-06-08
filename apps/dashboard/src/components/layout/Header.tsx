"use client";

import { Search, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Header() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/explorer?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-6">
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search wallets, transactions, orgs..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-muted rounded-md border-0 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </form>
      <div className="flex items-center gap-3">
        <button className="relative p-2 hover:bg-accent rounded-md">
          <Bell className="h-4 w-4" />
        </button>
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium">
          FI
        </div>
      </div>
    </header>
  );
}
