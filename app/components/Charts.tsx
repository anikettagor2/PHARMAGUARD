"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// ==============================
// Stitch-aligned Area Chart (SVG-native, no recharts)
// ==============================
interface AreaChartProps {
  title: string;
  subtitle: string;
  data: { label: string; actual: number; projected?: number }[];
}

export function StitchAreaChart({ title, subtitle, data }: AreaChartProps) {
  const maxVal = Math.max(...data.flatMap(d => [d.actual, d.projected ?? 0]));
  const toY = (v: number) => Math.round(400 - (v / maxVal) * 360);

  const actualPoints = data.map((d, i) => `${(i / (data.length - 1)) * 1000},${toY(d.actual)}`).join(' L');
  const projectedPoints = data.map((d, i) => `${(i / (data.length - 1)) * 1000},${toY(d.projected ?? d.actual)}`).join(' L');
  const areaPath = `M0,400 L${actualPoints} L1000,400 Z`;

  return (
    <div className="bg-surface-container-lowest rounded-lg overflow-hidden border border-outline-variant/10">
      <div className="p-8 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-primary">{title}</h3>
          <p className="text-sm text-on-surface-variant">{subtitle}</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-secondary"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-tertiary"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Projection</span>
          </div>
        </div>
      </div>
      <div className="h-[320px] w-full relative px-8 pb-8">
        <div className="absolute inset-0 flex items-end px-8 pb-8">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 400">
            <defs>
              <linearGradient id="grad-actual" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#46fa9c', stopOpacity: 0.2 }} />
                <stop offset="100%" style={{ stopColor: '#46fa9c', stopOpacity: 0 }} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Grid lines */}
            <line stroke="#494847" strokeOpacity="0.1" x1="0" x2="1000" y1="100" y2="100" />
            <line stroke="#494847" strokeOpacity="0.1" x1="0" x2="1000" y1="200" y2="200" />
            <line stroke="#494847" strokeOpacity="0.1" x1="0" x2="1000" y1="300" y2="300" />
            {/* Projection line */}
            <path d={`M${projectedPoints}`} fill="none" stroke="#af88ff" strokeDasharray="5,5" strokeWidth="2" />
            {/* Actual area */}
            <path d={areaPath} fill="url(#grad-actual)" />
            {/* Actual line */}
            <path d={`M${actualPoints}`} fill="none" filter="url(#glow)" stroke="#46fa9c" strokeWidth="3" />
          </svg>
        </div>
        {/* Axis labels */}
        <div className="absolute left-8 right-8 bottom-2 flex justify-between text-[10px] font-bold text-on-surface-variant tracking-widest">
          {data.map(d => <span key={d.label}>{d.label}</span>)}
        </div>
      </div>
    </div>
  );
}

// ==============================
// Engagement / Risk Cluster (horizontal bars)
// ==============================
interface ClusterBarProps {
  title: string;
  items: { label: string; value: number; color: 'secondary' | 'tertiary' | 'error' | 'muted' }[];
  total?: { label: string; value: string | number };
}

export function ClusterBars({ title, items, total }: ClusterBarProps) {
  const colorMap = {
    secondary: 'bg-secondary shadow-[0_0_8px_rgba(70,250,156,0.4)]',
    tertiary: 'bg-tertiary',
    error: 'bg-error',
    muted: 'bg-surface-container-highest/40',
  };

  return (
    <div className="lg:col-span-1 bg-surface-container-low rounded-xl p-6 border border-outline-variant/10 shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">{title}</h3>
      <div className="space-y-6">
        {items.map(item => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-sm text-on-surface-variant w-28 shrink-0">{item.label}</span>
            <div className="flex items-center gap-3 flex-1 px-4">
              <div className="h-1.5 flex-1 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${colorMap[item.color]}`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
              <span className="text-xs font-bold text-primary w-8 text-right">{item.value}%</span>
            </div>
          </div>
        ))}
      </div>
      {total && (
        <div className="mt-8 pt-8 border-t border-outline-variant/10">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-primary">{total.label}</span>
            <span className="text-xl font-bold text-primary">{total.value}</span>
          </div>
          <div className="w-full h-16 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#46fa9c_0%,_transparent_70%)] opacity-10 rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
}

// ==============================
// Performance Insights Row
// ==============================
interface InsightRowProps {
  iconName: string;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  badgeLabel: string;
  badgeValue: string;
  badgeColor: string;
  actionLabel: string;
  onAction?: () => void;
}

export function InsightRow({ iconName, iconBg, iconColor, title, subtitle, badgeLabel, badgeValue, badgeColor, actionLabel, onAction }: InsightRowProps) {
  return (
    <div className="p-6 flex items-center justify-between group hover:bg-surface-container-high transition-colors cursor-pointer border-b border-outline-variant/10 last:border-0">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center ${iconColor}`}>
          <span className="material-symbols-outlined">{iconName}</span>
        </div>
        <div>
          <p className="text-sm font-bold text-primary">{title}</p>
          <p className="text-xs text-on-surface-variant">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{badgeLabel}</p>
          <p className={`text-xs font-bold ${badgeColor}`}>{badgeValue}</p>
        </div>
        <button
          onClick={onAction}
          className="px-4 py-2 border border-outline-variant rounded text-xs font-bold text-primary hover:bg-primary hover:text-surface-container-lowest transition-all"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

// ==============================
// Donut Pie (for risk distribution)
// ==============================
export function VariantPieChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#131313', borderColor: '#494847', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
            itemStyle={{ color: '#fff' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ==============================
// Legacy line chart (kept for upload page)
// ==============================
export function VariantLineChart({ data }: { data: any[] }) {
  return (
    <div className="h-48 w-full flex items-end gap-1 px-2">
      {data.map((d, i) => {
        const maxCount = Math.max(...data.map((x: any) => x.count), 1);
        const height = Math.round((d.count / maxCount) * 100);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-secondary/20 hover:bg-secondary/60 rounded-t transition-all duration-300 group-hover:bg-secondary/30"
              style={{ height: `${height}%`, minHeight: '4px' }}
            />
            <span className="text-[9px] font-bold text-on-surface-variant tracking-widest">{d.date}</span>
          </div>
        );
      })}
    </div>
  );
}
