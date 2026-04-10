"use client";

import { useState, useEffect } from "react";
import { Patient } from "@/types";
import { patientService } from "@/services/patients.service";
import { useAuth } from "@/hooks/useAuth";

interface PatientListProps {
  onSelect: (patient: Patient) => void;
  selectedId?: string;
}

export function PatientList({ onSelect, selectedId }: PatientListProps) {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      patientService.getPatientsByDoctor(user.uid).then(data => {
        // Sort by createdAt desc to show newest first
        const sorted = data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setPatients(sorted);
        setLoading(false);
      });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-14 bg-surface-container rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="p-8 text-center bg-surface-container-low rounded-xl border border-dashed border-outline-variant/20">
        <p className="text-xs text-on-surface-variant italic">No patients registered yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
      {patients.map((p) => (
        <div 
          key={p.id}
          className={`px-4 py-3 rounded-xl cursor-pointer flex items-center justify-between transition-all border-2 ${
            p.id === selectedId 
            ? 'bg-secondary/10 border-secondary shadow-md shadow-secondary/10' 
            : 'bg-surface-container-lowest border-outline-variant/10 hover:border-secondary/40 hover:bg-surface-container hover:shadow-sm'
          }`}
          onClick={() => onSelect(p)}
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              p.id === selectedId ? 'bg-secondary text-on-secondary' : 'bg-surface-container-high text-on-surface-variant'
            }`}>
              <span className="material-symbols-outlined text-base">person</span>
            </div>
            <div>
              <p className={`text-sm font-bold ${p.id === selectedId ? 'text-secondary' : 'text-primary'}`}>{p.name}</p>
              <p className="text-[10px] text-on-surface-variant">+91 {p.phone}</p>
            </div>
          </div>
          {p.id === selectedId && (
            <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
          )}
        </div>
      ))}
    </div>
  );
}
