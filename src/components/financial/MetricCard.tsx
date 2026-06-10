"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  accent?: string;
  className?: string;
  subValue?: string;
}

export default function MetricCard({
  label, value, change, changeLabel, icon: Icon, accent = "#00C896", className, subValue,
}: MetricCardProps) {
  const isPos = (change ?? 0) >= 0;
  const hasDelta = change !== undefined;

  return (
    <Card className={cn("relative overflow-hidden group hover:shadow-md transition-shadow duration-200", className)}>
      {/* Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: accent }} />

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: accent + "18" }}
          >
            <Icon size={15} style={{ color: accent }} />
          </div>
          {hasDelta && (
            <Badge variant={isPos ? "success" : "destructive"} className="text-[10px] px-1.5 py-0.5">
              {isPos ? "▲" : "▼"} {Math.abs(change!)}%
            </Badge>
          )}
        </div>

        <div className="space-y-0.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
          {subValue && <p className="text-[10px] text-muted-foreground">{subValue}</p>}
          {changeLabel && (
            <p className="text-[10px] text-muted-foreground">{changeLabel}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
