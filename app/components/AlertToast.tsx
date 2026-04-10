"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/types";
import { markAlertAsRead } from "@/services/variants.service";

export function AlertToast({ alerts }: { alerts: Alert[] }) {
  const [visibleAlerts, setVisibleAlerts] = useState<Alert[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // 1. Filter and Deduplicate
    const uniqueMessages = new Set();
    const currentUnread = alerts
      .filter(a => a.id && !a.read && !dismissedIds.has(a.id))
      .filter(a => {
        if (uniqueMessages.has(a.message)) return false;
        uniqueMessages.add(a.message);
        return true;
      })
      .slice(0, 3);

    setVisibleAlerts(currentUnread);

    // 2. Set individual timers for newly appeared alerts
    const activeTimers: NodeJS.Timeout[] = [];
    currentUnread.forEach((alert) => {
      const timerId = setTimeout(() => {
        if (alert.id) handleDismiss(alert.id);
      }, 10000);
      activeTimers.push(timerId);
    });

    return () => activeTimers.forEach(t => clearTimeout(t));
  }, [alerts, dismissedIds]);

  const handleDismiss = async (id: string) => {
    // Snappy UI update
    setDismissedIds(prev => new Set(prev).add(id));

    // Persist to DB
    try {
        await markAlertAsRead(id);
    } catch (error) {
        console.error("Failed to mark alert as read:", error);
    }
  };

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="fixed top-24 right-4 md:right-8 z-50 flex flex-col gap-4 pointer-events-none">
      {visibleAlerts.map(alert => {
        const isIneffective = alert.message.toLowerCase().includes('ineffective');
        const isAdjust = alert.message.toLowerCase().includes('adjust');
        
        let borderColor = "border-error";
        let icon = "priority_high";
        let title = "Critical Toxicity Risk";

        if (isIneffective) {
            borderColor = "border-warning";
            icon = "block";
            title = "Ineffective Treatment";
        } else if (isAdjust) {
            borderColor = "border-tertiary";
            icon = "tune";
            title = "Dosage Adjustment";
        }

        return (
            <div 
                key={alert.id} 
                className={`pointer-events-auto bg-surface-container-high border-l-4 ${borderColor} text-on-surface p-4 rounded-lg shadow-xl flex items-center gap-4 min-w-[300px] max-w-[400px] animate-in slide-in-from-right-8 fade-in-0 duration-500`}
            >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    borderColor.replace('border-', 'bg-').replace('warning', 'error')
                }/10`}>
                    <span className="material-symbols-outlined text-sm">{icon}</span>
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-xs uppercase tracking-widest text-primary">{title}</h4>
                    <p className="text-sm text-on-surface-variant line-clamp-2">{alert.message}</p>
                </div>
                <button 
                  onClick={() => alert.id && handleDismiss(alert.id)}
                  className="material-symbols-outlined text-on-surface-variant/40 hover:text-on-surface text-lg cursor-pointer transition-colors"
                >
                  close
                </button>
            </div>
        );
      })}
    </div>
  );
}
