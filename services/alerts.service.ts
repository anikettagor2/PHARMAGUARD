import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Alert } from "@/types";

export async function createAlert(alertData: Omit<Alert, 'id'>) {
    try {
        const docRef = await addDoc(collection(db, "alerts"), alertData);
        return docRef.id;
    } catch(err) {
        console.error("Error creating alert: ", err);
        throw err;
    }
}
