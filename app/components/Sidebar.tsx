"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { name: "Analytics", href: "/results", icon: "analytics" },
    { name: "Monitoring", href: "/upload", icon: "monitor_heart" },
    { name: "Alerts", href: "/alerts", icon: "notifications_active" },
    { name: "Settings", href: "/settings", icon: "settings" },
  ];

  return (
    <aside className={cn(
      "h-screen w-64 fixed left-0 top-0 bg-surface-container-low flex flex-col py-8 px-4 z-50 transition-transform duration-300 md:translate-x-0 border-r border-outline-variant/10",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="mb-12 px-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tighter text-primary">PHARMAGUARD</h1>
          <p className="font-['Inter'] font-medium text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant mt-1">Precision Intelligence</p>
        </div>
        <button onClick={onClose} className="md:hidden text-on-surface-variant p-1">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => { if (window.innerWidth < 768) onClose(); }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200",
                isActive 
                  ? "text-secondary font-bold hover:bg-surface-container-high" 
                  : "text-on-surface-variant hover:bg-surface-container-high"
              )}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-['Inter'] font-medium text-[0.6875rem] uppercase tracking-[0.05em]">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-4 pt-8 border-t border-outline-variant/15 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img alt="Pharmacogenomics Analyst" className="w-10 h-10 rounded-full border border-outline-variant/20 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlHIpyXaIdla8pN8fcMtg_NQKA8hlYVTlR-s4Kt8JYbvf4uKU8YibwM20sfpeRP2vfXL1aCP8NN1x1lhwvtAfICH7SiP1hb8-ppv1ZvK9S1jpGlmKmxUcg1B4YNY_DNpFpUh00DdU3n7yR4mxZlLdfWRMJa8ZTQuILsboQvSvKeeA23oJFvKpyYkSarVNHWxMElAsX5jjacjQ5CeORbpai3OuJkMikxKSjfzSTKYuygGFwxIPsS65C3W__6rrlbHb-2rn-XCGtDGk" />
          <div className="overflow-hidden">
             <p className="text-xs font-bold text-primary truncate">Platform User</p>
             <p className="text-[10px] text-on-surface-variant truncate">Lead Analyst</p>
          </div>
        </div>
        <button onClick={handleLogout} className="text-on-surface-variant hover:text-error transition-colors">
           <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
        </button>
      </div>
    </aside>
  );
}
