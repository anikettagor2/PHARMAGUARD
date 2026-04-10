"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Dna, Lock, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 selection:bg-purple-600 relative overflow-hidden">
      {/* Background Neon Glows */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.1),transparent_50%)]" />
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.1),transparent_50%)]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-[#0c0c0c] p-6 sm:p-10 rounded-[40px] border border-purple-900/40 shadow-[0_0_50px_rgba(0,0,0,1)] backdrop-blur-xl">
          <div className="flex justify-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-purple-400/30">
                  <Dna className="w-8 h-8 text-white animate-pulse" />
              </div>
          </div>
          
          <h2 className="text-3xl font-black text-white text-center mb-2 tracking-tighter uppercase">Protocol <span className="text-purple-500">Access</span></h2>
          <p className="text-gray-500 text-center mb-10 text-[10px] font-black uppercase tracking-[0.3em]">Initialize Clinical Node Credentials</p>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-900/20 border border-red-500/30 p-4 rounded-2xl mb-6 flex items-center gap-3"
            >
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <p className="text-red-400 text-[10px] font-black uppercase tracking-widest">{error}</p>
            </motion.div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-purple-400 uppercase tracking-widest ml-1">Node Identifier (Email)</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-900 group-focus-within:text-purple-400 transition-colors" />
                <input 
                  type="email" 
                  className="w-full bg-black border border-purple-900/30 rounded-2xl py-4 pl-12 pr-4 text-white font-medium focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all placeholder:text-gray-700"
                  value={email}
                  placeholder="name@clinical.node"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-purple-400 uppercase tracking-widest ml-1">Access Cipher (Password)</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-900 group-focus-within:text-purple-400 transition-colors" />
                <input 
                  type="password" 
                  className="w-full bg-black border border-purple-900/30 rounded-2xl py-4 pl-12 pr-4 text-white font-medium focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all placeholder:text-gray-700"
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="w-full group bg-purple-600 text-white font-black text-[12px] uppercase tracking-[0.4em] py-5 rounded-2xl hover:bg-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all mt-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent,rgba(255,255,255,0.1),transparent)] -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              Unlock Dashboard
            </button>
          </form>
          
          <div className="mt-10 pt-10 border-t border-purple-900/20 text-center">
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">
              Unregistered Specimen? <Link href="/signup" className="text-purple-400 hover:text-white hover:underline transition-colors">Join Protocol</Link>
            </p>
          </div>
        </div>
        
        {/* Footer Detail */}
        <div className="mt-8 text-center opacity-30">
          <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.8em]">End-to-End Encrypted Session</p>
        </div>
      </motion.div>
    </div>
  );
}
