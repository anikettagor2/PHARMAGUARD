import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  doc, 
  getDoc,
  Timestamp 
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Patient } from "../types";

const COLLECTION_NAME = "patients";

export const patientService = {
  async addPatient(patient: Omit<Patient, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...patient,
      createdAt: Date.now()
    });
    return docRef.id;
  },

  async getPatientsByDoctor(doctorId: string): Promise<Patient[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("doctorId", "==", doctorId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Patient[];
  },

  async getPatientById(id: string): Promise<Patient | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Patient;
    }
    return null;
  }
};
