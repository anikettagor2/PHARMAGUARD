"use client";
import React, { useState } from "react";
import { Sidebar } from "@/app/components/Sidebar";
import { Topbar } from "@/app/components/Topbar";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeData } from "@/hooks/useRealtime";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const { alerts } = useRealtimeData(user?.uid);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-surface-container-lowest text-secondary font-bold tracking-widest uppercase">Initializing PharmaGuard...</div>;
    
    if (!user) return null;

    return (
        <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-secondary selection:text-on-secondary-container flex flex-col md:flex-row overflow-x-hidden">
            {/* Overlay for mobile */}
            {isSidebarOpen && (
              <div 
                className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            
            <main className={cn(
                "flex-1 min-h-screen relative transition-all duration-300 w-full",
                "md:ml-64"
            )}>
                <Topbar onMenuClick={() => setIsSidebarOpen(true)} alerts={alerts} />
                <div className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto overflow-x-hidden">
                    {children}
                </div>
            </main>
        </div>
    )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
