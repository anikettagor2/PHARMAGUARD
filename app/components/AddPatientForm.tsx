"use client";

import { useState } from "react";
import { patientService } from "@/services/patients.service";
import { useAuth } from "@/hooks/useAuth";

interface AddPatientFormProps {
  onSuccess: (patientId: string) => void;
  onCancel: () => void;
}

export function AddPatientForm({ onSuccess, onCancel }: AddPatientFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    height: "",
    weight: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Validation
    if (!formData.name || !formData.phone) return;

    // Phone validation (Indian number)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) return;

    setLoading(true);
    try {
      const id = await patientService.addPatient({
        ...formData,
        doctorId: user.uid,
        createdAt: Date.now(),
      });
      onSuccess(id);
    } catch (error) {
      console.error("Failed to add patient", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
      <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-primary">Add New Patient</h3>
          <p className="text-xs text-on-surface-variant mt-1 italic">Register patient details for PGx monitoring.</p>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Full Name</label>
            <div className="flex items-center gap-2 bg-surface-container rounded-lg border border-outline-variant/20 px-3 py-2.5 focus-within:border-secondary transition-all">
              <span className="material-symbols-outlined text-on-surface-variant text-sm">person</span>
              <input
                required
                type="text"
                placeholder="Patient's Full Name"
                className="bg-transparent outline-none text-sm text-primary w-full"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Phone */}
            <div className="space-y-1.5 col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Phone Number (India)</label>
              <div className="flex items-center gap-2 bg-surface-container rounded-lg border border-outline-variant/20 px-3 py-2.5 focus-within:border-secondary transition-all">
                <span className="text-xs font-bold text-on-surface-variant opacity-60">+91</span>
                <input
                  required
                  type="tel"
                  placeholder="10-digit number"
                  className="bg-transparent outline-none text-sm text-primary w-full"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                />
              </div>
            </div>

            {/* Height */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Height (cm)</label>
              <div className="flex items-center gap-2 bg-surface-container rounded-lg border border-outline-variant/20 px-3 py-2.5">
                <span className="material-symbols-outlined text-on-surface-variant text-sm">height</span>
                <input
                  type="number"
                  placeholder="175"
                  className="bg-transparent outline-none text-sm text-primary w-full"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                />
              </div>
            </div>

            {/* Weight */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Weight (kg)</label>
              <div className="flex items-center gap-2 bg-surface-container rounded-lg border border-outline-variant/20 px-3 py-2.5">
                <span className="material-symbols-outlined text-on-surface-variant text-sm">weight</span>
                <input
                  type="number"
                  placeholder="70"
                  className="bg-transparent outline-none text-sm text-primary w-full"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors"
          >
            CANCEL
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-secondary text-on-secondary px-8 py-2.5 rounded-lg text-xs font-bold tracking-widest shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <span className="material-symbols-outlined animate-spin text-sm">autorenew</span> : <span className="material-symbols-outlined text-sm">save</span>}
            REGISTER PATIENT
          </button>
        </div>
      </form>
    </div>
  );
}
