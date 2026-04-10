"use client";

import DashboardLayout from "@/app/dashboard-layout";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { motion } from "framer-motion";

export default function SettingsPage() {
    const { user } = useAuth();

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary">System Settings</h2>
                    <p className="text-on-surface-variant mt-2 text-sm">
                        Configure clinical node parameters and interface preferences.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl space-y-8">
                {/* Interface Section */}
                <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
                    <div className="p-6 border-b border-outline-variant/10">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Interface Preferences</h3>
                    </div>
                    <div className="p-8 space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-primary">Visual Theme</p>
                                <p className="text-xs text-on-surface-variant">Switch between clinical light and cyber dark modes.</p>
                            </div>
                            <div className="bg-surface-container rounded-xl p-1">
                                <ThemeToggle />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-primary">High-Contrast Mode</p>
                                <p className="text-xs text-on-surface-variant">Enhanced legibility for diagnostic reviews.</p>
                            </div>
                            <button className="w-12 h-6 bg-outline-variant/20 rounded-full relative transition-colors">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-on-surface-variant rounded-full" />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Account Section */}
                <section className="bg-surface-container-low rounded-2xl border border-outline-variant/10 overflow-hidden">
                    <div className="p-6 border-b border-outline-variant/10">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Clinical Node Identity</h3>
                    </div>
                    <div className="p-8">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_30px_rgba(var(--pg-primary-rgb),0.1)]">
                                <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>account_circle</span>
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-primary">{user?.displayName || "Precision Analyst"}</h4>
                                <p className="text-sm text-on-surface-variant italic">{user?.email}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-secondary mt-2">Authenticated Security Node</p>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/10">
                                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Access Tier</p>
                                <p className="text-sm font-bold text-primary">Lead Clinical Investigator</p>
                            </div>
                            <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/10">
                                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Last Sync</p>
                                <p className="text-sm font-bold text-primary">{new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Security Section */}
                <section className="p-8 bg-error/5 rounded-2xl border border-error/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex gap-4">
                        <span className="material-symbols-outlined text-error">security</span>
                        <div>
                            <p className="text-sm font-bold text-error">Encryption Protocol</p>
                            <p className="text-xs text-on-error-container opacity-70">End-to-end clinical data protection active.</p>
                        </div>
                    </div>
                    <span className="px-3 py-1 bg-error/10 text-error text-[10px] font-black uppercase tracking-widest rounded-full">Secure</span>
                </section>
            </div>
        </DashboardLayout>
    );
}
