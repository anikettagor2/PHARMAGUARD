"use client"
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Variant, Alert } from "@/types";

export function useRealtimeData(userId: string | undefined) {
    const [variants, setVariants] = useState<Variant[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setVariants([]);
            setAlerts([]);
            setLoading(false);
            return;
        }

        const vQuery = query(
            collection(db, "variants"),
            where("userId", "==", userId)
            // orderBy("createdAt", "desc") // Needs index
        );

        const unsubV = onSnapshot(vQuery, (snapshot) => {
            const fetchedVariants: Variant[] = [];
            snapshot.forEach((doc) => {
                fetchedVariants.push({ id: doc.id, ...doc.data() } as Variant);
            });
            // Client side sort until index is ready
            fetchedVariants.sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
            setVariants(fetchedVariants);
        });

        const aQuery = query(
            collection(db, "alerts"),
            where("userId", "==", userId)
            // orderBy("createdAt", "desc") // Needs index
        );

        const unsubA = onSnapshot(aQuery, (snapshot) => {
            const fetchedAlerts: Alert[] = [];
            snapshot.forEach((doc) => {
                fetchedAlerts.push({ id: doc.id, ...doc.data() } as Alert);
            });
             // Client side sort
             fetchedAlerts.sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
            setAlerts(fetchedAlerts);
        });

        setLoading(false);

        return () => {
            unsubV();
            unsubA();
        };

    }, [userId]);

    const stats = {
        total: variants.length,
        safe: variants.filter(v => v.risk === 'Safe').length,
        monitor: variants.filter(v => v.risk === 'Monitor').length,
        toxic: variants.filter(v => v.risk === 'Toxic').length,
        adjustDosage: variants.filter(v => v.risk === 'Adjust Dosage').length,
        ineffective: variants.filter(v => v.risk === 'Ineffective').length,
        unknown: variants.filter(v => v.risk === 'Unknown').length,
    };

    return { variants, alerts, loading, stats };
}
