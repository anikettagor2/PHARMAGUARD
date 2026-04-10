"use client";

import { useState, useEffect } from "react";
import { Patient } from "@/types";
import { patientService } from "@/services/patients.service";
import { useAuth } from "@/hooks/useAuth";

interface PatientSearchProps {
  onSelect: (patient: Patient) => void;
  selectedId?: string;
}

export function PatientSearch({ onSelect, selectedId }: PatientSearchProps) {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      patientService.getPatientsByDoctor(user.uid).then(data => {
        setPatients(data);
        setLoading(false);
      });
    }
  }, [user]);

  const filtered = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm)
  );

  const selectedPatient = patients.find(p => p.id === selectedId);

  return (
    <div className="relative w-full">
      <div 
        className="bg-surface-container rounded-lg border border-outline-variant/20 px-4 py-3 cursor-pointer flex items-center justify-between hover:border-secondary transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary">patient_list</span>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest leading-tight">Selected Patient</p>
            <p className="text-sm font-bold text-primary truncate">
              {selectedPatient ? selectedPatient.name : (loading ? "Loading patients..." : "Select a patient...")}
            </p>
          </div>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant transition-transform" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>expand_more</span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-high border border-outline-variant/30 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-3 border-b border-outline-variant/10">
            <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-3 py-2">
              <span className="material-symbols-outlined text-sm text-on-surface-variant">search</span>
              <input 
                autoFocus
                type="text"
                placeholder="Search name or phone..."
                className="bg-transparent outline-none text-xs text-primary w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-xs text-on-surface-variant">No patients found matches your search.</p>
              </div>
            ) : (
              filtered.map((p) => (
                <div 
                  key={p.id}
                  className="px-4 py-3 hover:bg-primary/5 cursor-pointer flex items-center justify-between border-b border-outline-variant/10 last:border-0 transition-colors group"
                  onClick={() => {
                    onSelect(p);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined text-sm">person</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary group-hover:text-secondary transition-colors">{p.name}</p>
                      <p className="text-[10px] text-on-surface-variant">+91 {p.phone}</p>
                    </div>
                  </div>
                  {p.id === selectedId && (
                    <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
