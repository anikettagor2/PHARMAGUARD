"use client";

import { cn } from "@/lib/utils";

interface KPIProps {
  title: string;
  value: string | number;
  trend?: string;
  trendType?: "up" | "down" | "stable" | "peak";
  materialIcon?: string;
  iconColor?: string;
  sparklineData?: number[]; // 0-100 values
  sparklineColor?: string;
}

export function KPI({ 
  title, 
  value, 
  trend, 
  trendType = "up", 
  materialIcon = "trending_up",
  iconColor = "text-secondary",
  sparklineData = [40, 60, 55, 80, 70, 95],
  sparklineColor = "secondary"
}: KPIProps) {

  const trendColor = {
    up: "text-secondary",
    down: "text-error",
    stable: "text-tertiary",
    peak: "text-secondary",
  }[trendType];

  return (
    <div className="p-6 bg-surface-container-low rounded-xl group hover:bg-surface-container-high transition-all duration-300 border border-outline-variant/10 shadow-sm hover:shadow-lg hover:shadow-primary/5">
      <div className="flex justify-between items-start mb-4">
        <p className="text-[0.6875rem] uppercase tracking-widest text-on-surface-variant font-medium">{title}</p>
        <span className={cn("material-symbols-outlined text-sm", iconColor)}>{materialIcon}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-primary tracking-tighter">{value}</span>
        {trend && (
          <span className={cn("text-[10px] font-bold", trendColor)}>{trend}</span>
        )}
      </div>
      {sparklineData && (
        <div className="mt-6 h-12 flex items-end gap-1">
          {sparklineData.map((val, i) => {
            const isLast = i === sparklineData.length - 1;
            const height = `${Math.max(val, 8)}%`;
            return (
              <div
                key={i}
                style={{ height }}
                className={cn(
                  "flex-1 rounded-t-sm transition-all",
                  isLast
                    ? `bg-${sparklineColor} shadow-[0_0_10px_rgba(70,250,156,0.3)]`
                    : `bg-${sparklineColor}/10 group-hover:bg-${sparklineColor}/30`
                )}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
