"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Network,
  CreditCard,
  Banknote,
  Building2,
  Users,
  BarChart3,
  Search,
  Activity,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Trust Graph", href: "/trust", icon: Network },
  { label: "Payments", href: "/payments", icon: CreditCard },
  { label: "Funding Streams", href: "/funding", icon: Banknote },
  { label: "Organizations", href: "/organizations", icon: Building2 },
  { label: "Users", href: "/users", icon: Users },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Explorer", href: "/explorer", icon: Search },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card flex flex-col">
      <div className="p-6 flex items-center gap-2">
        <Zap className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg">FlowIndexer</span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {nav.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              pathname === href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="h-3 w-3 text-green-500" />
          <span>Indexer Active</span>
        </div>
      </div>
    </aside>
  );
}
