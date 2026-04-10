import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { Alert } from "@/types";

export function Topbar({ onMenuClick, alerts = [] }: { onMenuClick?: () => void; alerts?: Alert[] }) {
  const { user } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <header
      className="fixed top-0 right-0 left-0 md:left-64 h-16 z-50 backdrop-blur-xl border-b border-outline-variant/15 flex justify-between items-center px-4 md:px-8 shadow-[0px_24px_48px_rgba(0,0,0,0.3)] transition-all duration-300"
      style={{ backgroundColor: "var(--pg-topbar-bg)" }}
    >
      {/* Search */}
      <div className="flex items-center gap-3 w-full md:w-96">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 hover:bg-surface-container rounded-full text-on-surface"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <span className="material-symbols-outlined text-on-surface-variant">search</span>
        <input
          className="bg-transparent border-none outline-none focus:ring-0 text-sm text-primary w-full placeholder:text-on-surface-variant"
          placeholder="Search variants, genes, or metrics..."
          type="text"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 relative">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
              isNotificationsOpen ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-secondary text-on-secondary text-[8px] font-black flex items-center justify-center rounded-full border-2 border-surface">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Panel */}
          {isNotificationsOpen && (
            <>
              <div 
                className="fixed inset-0 z-[-1]" 
                onClick={() => setIsNotificationsOpen(false)}
              />
              <div className="absolute top-full right-0 mt-4 w-[calc(100vw-2rem)] sm:w-[380px] bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-[0px_32px_64px_rgba(0,0,0,0.4)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-outline-variant/10 bg-primary/5 flex justify-between items-center">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Clinical Alerts</h3>
                  {unreadCount > 0 && (
                    <span className="text-[8px] font-bold px-2 py-0.5 bg-secondary/10 text-secondary rounded flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-secondary animate-pulse"></span>
                      {unreadCount} UNREAD
                    </span>
                  )}
                </div>
                
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {alerts.length > 0 ? (
                    <div className="flex flex-col">
                      {alerts.map((alert) => (
                        <div 
                          key={alert.id}
                          className={`p-4 border-b border-outline-variant/5 hover:bg-surface-container-low transition-colors group cursor-default ${!alert.read ? 'bg-primary/[0.02]' : 'opacity-70'}`}
                        >
                          <div className="flex gap-3">
                            <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              alert.severity === 'critical' ? 'bg-error/10 text-error' : 
                              alert.severity === 'warning' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
                            }`}>
                              <span className="material-symbols-outlined text-sm">
                                {alert.severity === 'critical' ? 'warning' : alert.severity === 'warning' ? 'error' : 'info'}
                              </span>
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex justify-between items-start">
                                <span className={`text-[9px] font-black uppercase tracking-wider ${
                                  alert.severity === 'critical' ? 'text-error' : 
                                  alert.severity === 'warning' ? 'text-on-secondary-container' : 'text-primary'
                                }`}>
                                  {alert.severity} Find
                                </span>
                                <span className="text-[8px] font-mono text-on-surface-variant opacity-50 uppercase tracking-tighter">
                                  {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-[11px] leading-relaxed text-on-surface font-medium selection:bg-primary/20">
                                {alert.message}
                              </p>
                              {!alert.read && <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-1.5"></div>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center opacity-40">
                      <span className="material-symbols-outlined text-4xl mb-2">notifications_off</span>
                      <p className="text-[10px] font-bold uppercase tracking-widest">No Active Alerts</p>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-surface-container/30 text-center border-t border-outline-variant/10">
                  <button className="text-[9px] font-black text-primary uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all">
                    View Complete History
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-outline-variant/30 mx-2" />

        {/* User */}
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant">account_circle</span>
          <span className="text-sm font-medium text-primary line-clamp-1 max-w-[120px]">
            {user?.displayName || "Intelligence Command"}
          </span>
        </div>
      </div>
    </header>
  );
}
