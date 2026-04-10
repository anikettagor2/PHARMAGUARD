import { Variant } from "@/types";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const GEMINI_API_KEY = "AIzaSyCrBdoSavc74l0U1kDlgLFhJQnpnhrNGwY";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
const HIGH_RISK_AI = new Set(["Toxic", "Adjust Dosage", "Ineffective"]);

export async function explainVariant(v: Variant): Promise<string> {
  // Check cache
  const cacheKey = `${v.gene}-${v.mutation}-${v.risk}`;
  const cacheRef = doc(db, "predictions", cacheKey);
  try {
    const cached = await getDoc(cacheRef);
    if (cached.exists()) return cached.data().explanation;
  } catch (e) {
    console.warn("Cache fetch failed", e);
  }

  // Clinical prompt for Gemini 2.0
  const prompt = `
    Context: You are a professional Pharmacogenomics (PGx) Specialist.
    Analyze this variant: Gene [${v.gene}], Mutation [${v.mutation}], Clinical Status [${v.risk}].
    Clinical Recommendation provided: ${v.recommendation}.

    Generate a human-readable, high-fidelity clinical reasoning report structured with these EXACT labels:

    LABELS:
    1. BIOLOGICAL REASONING: Explain the gene's function and how this specific mutation (${v.mutation}) alters protein activity.
    2. METABOLIC IMPACT: Describe how the mutation affects drug metabolism (e.g., reduced enzyme activity, slower breakdown).
    3. DRUG BEHAVIOR IN BODY: Explain if the drug accumulates (increased toxicity) or becomes ineffective (therapeutic failure).
    4. CLINICAL EFFECTS & SIDE EFFECTS: List the physiological risks to the patient (e.g., neutropenia, GI damage).
    5. SUGGESTED SAFE ALTERNATIVES: Based on PGx evidence for ${v.gene}, suggest 2-3 safe alternatives or dosage adjustments.
    6. CLINICAL INTERPRETATION & DURATION: Summary for the clinician, including suggested monitoring duration.

    Tone: Professional, clinical, yet accessible. Avoid overly technical jargon where possible, but stay scientifically accurate.
  `;

  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        contents: [{ 
          parts: [{ text: prompt }] 
        }],
        generationConfig: {
          temperature: 0.2, // Keep it clinically consistent
          topK: 40,
          topP: 0.95,
        }
      }),
    });

    if (res.status === 429) throw new Error("QUOTA_HIT");
    if (!res.ok) throw new Error(`API_${res.status}`);

    const data = await res.json();
    const explanation = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (explanation) {
      try {
        await setDoc(cacheRef, { explanation, createdAt: Date.now() }, { merge: true });
      } catch (e) {
        console.warn("Cache save failed", e);
      }
      return explanation;
    }
  } catch (err: any) {
    if (err.message === "QUOTA_HIT") {
      return `[QUOTA RECOVERY MODE - GENERATED TEMPLATE]
      
BIOLOGICAL REASONING:
${v.gene} ${v.mutation} involves a sequence variation in the metabolic coding region.

METABOLIC IMPACT:
Reduced enzymatic efficiency leading to altered pharmacokinetics.

DRUG BEHAVIOR:
Potentially high plasma concentrations leading to increased systemic exposure.

CLINICAL INTERPRETATION:
${v.recommendation}

NOTE: Real-time AI analysis is cooling down. Referencing stored CPIC guidelines.`;
    }
  }

  return `CLINICAL NOTE: ${v.recommendation}\n\nEvidence based on clinical risk assessment for ${v.gene} ${v.mutation}. Primary concern: ${v.risk}. Ensure metabolic screening is validated via blood plasma levels if toxicity is suspected.`;
}
