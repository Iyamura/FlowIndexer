import { LucideIcon, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number;
  className?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {trend !== undefined && (
          <div className={cn("flex items-center gap-1 text-xs mt-1", trend >= 0 ? "text-green-600" : "text-red-600")}>
            <TrendingUp className={cn("h-3 w-3", trend < 0 && "rotate-180")} />
            <span>{Math.abs(trend)}% from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
