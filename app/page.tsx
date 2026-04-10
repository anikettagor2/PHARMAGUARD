"use client";

import React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Dna, 
  ShieldCheck, 
  Activity, 
  BrainCircuit, 
  ArrowRight, 
  Zap,
  Globe,
  Database,
  Stethoscope,
  Microscope,
  Crosshair,
  HeartPulse,
  Sun,
  Moon
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

// Neon Theme Constants
const NEON_PURPLE = "#A855F7";
const DEEP_BLACK = "#000000";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const DigitalRain = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -500, opacity: 0 }}
          animate={{ 
            y: [null, 1500],
            opacity: [0, 0.5, 0]
          }}
          transition={{ 
            duration: Math.random() * 5 + 3,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "linear"
          }}
          className="absolute w-[1px] bg-gradient-to-b from-transparent via-purple-500 to-transparent"
          style={{
            left: `${Math.random() * 100}%`,
            height: `${Math.random() * 300 + 100}px`,
          }}
        />
      ))}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`dna-${i}`}
          initial={{ y: -200, opacity: 0 }}
          animate={{ 
            y: [null, 1200],
            opacity: [0, 0.3, 0]
          }}
          transition={{ 
            duration: Math.random() * 8 + 5,
            repeat: Infinity,
            delay: Math.random() * 15,
            ease: "linear"
          }}
          className="absolute text-purple-400/30 text-[8px] font-black uppercase tracking-widest whitespace-nowrap rotate-90"
          style={{
            left: `${Math.random() * 100}%`,
          }}
        >
          {["ACTG", "GCTA", "TTCG", "CAGG"][Math.floor(Math.random() * 4)]}
        </motion.div>
      ))}
    </div>
  );
};

const ScrambleText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = React.useState(text);
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";

  React.useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(prev => 
        text.split("")
          .map((char, index) => {
            if (index < iteration) return text[index];
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join("")
      );

      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 30);

    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayText}</span>;
};

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const { scrollYProgress } = useScroll();
  const isDark = theme === "dark";

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const dnaRotate = useTransform(scrollYProgress, [0, 1], [0, 180]);

  return (
    <div className="min-h-screen bg-[var(--pg-background)] selection:bg-purple-600 selection:text-white transition-colors duration-500 overflow-x-hidden font-body text-[var(--pg-foreground)]">
      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-purple-600 z-[100] origin-left shadow-[0_0_15px_purple]"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Background Digital Rain */}
      <DigitalRain />

      {/* Dynamic Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-[70] opacity-[0.05] overflow-hidden">
        <div className="w-full h-1 bg-purple-500/20 blur-sm animate-scanline shadow-[0_0_20px_purple]" />
      </div>
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(168,85,247,0.1)_1px,transparent_1px)] bg-[size:100%_4px]" />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[60] px-6 py-6 backdrop-blur-xl bg-black/40 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-purple-400/30">
              <Dna className="text-white w-6 h-6 animate-pulse" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-[var(--pg-foreground)]">PHARMA<span className="text-purple-500">GUARD</span></span>
          </motion.div>
          
          <div className="hidden md:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">
            <a href="#features" className="hover:text-purple-400 transition-all hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">Protocol</a>
            <a href="#tech" className="hover:text-purple-400 transition-all hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">Intelligence</a>
            <a href="#secure" className="hover:text-purple-400 transition-all hover:drop-shadow-[0_0_8_rgba(168,85,247,0.8)]">Shield</a>
            
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 hover:bg-purple-500 hover:text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.1)]"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>
          </div>

          <Link href="/login">
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(168,85,247,0.6)" }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-purple-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all"
            >
              Initialize Node
            </motion.button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Animated DNA Background Element */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-20 pointer-events-none">
          <motion.div
            animate={{ 
              rotateY: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="relative w-[600px] h-[600px] blur-[1px]"
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  y: [0, -20, 0],
                  opacity: [0.2, 0.5, 0.2]
                }}
                transition={{ duration: 3, delay: i * 0.1, repeat: Infinity }}
                className="absolute w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_10px_purple]"
                style={{
                  top: `${(i / 20) * 100}%`,
                  left: `${50 + Math.sin(i * 0.6) * 30}%`,
                }}
              />
            ))}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={`b-${i}`}
                animate={{ 
                  y: [0, 20, 0],
                  opacity: [0.2, 0.5, 0.2]
                }}
                transition={{ duration: 3, delay: i * 0.1, repeat: Infinity }}
                className="absolute w-2 h-2 bg-purple-300 rounded-full shadow-[0_0_10px_white]"
                style={{
                  top: `${(i / 20) * 100}%`,
                  left: `${50 - Math.sin(i * 0.6) * 30}%`,
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Global Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none" />

        <motion.div 
          style={{ opacity, scale, y }}
          className="relative z-10 max-w-6xl mx-auto px-6 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-6 py-2 bg-purple-900/20 rounded-full border border-purple-500/30 mb-12 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
          >
            <Microscope className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-300">Advanced Pharmacogenomic Node v2.0</span>
            <div className="flex h-1.5 w-1.5 rounded-full bg-purple-500 animate-ping"></div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-7xl md:text-[10rem] font-black tracking-tighter leading-[0.85] mb-12 neon-text text-[var(--pg-foreground)] relative"
          >
            <motion.span
              animate={{ 
                opacity: [1, 0.8, 1],
                textShadow: [
                  "0 0 10px rgba(168,85,247,0.5)",
                  "0 0 20px rgba(168,85,247,0.8)",
                  "0 0 10px rgba(168,85,247,0.5)"
                ]
              }}
              transition={{ duration: 0.1, repeat: Infinity, repeatDelay: Math.random() * 5 }}
            >
              PRECISION<br/>
              <span className="text-purple-600 drop-shadow-[0_0_40px_rgba(168,85,247,1)] italic">PHARMA</span>
            </motion.span>
          </motion.h1>

          {/* Clinical Scanner Mockup */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.15]">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-purple-500 shadow-[0_0_20px_purple] animate-[scan_6s_linear_infinite]" />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16"
          >
            <div className="space-y-2 group">
              <p className="text-[10px] font-black tracking-[0.4em] text-purple-500 uppercase group-hover:text-white transition-colors">
                <ScrambleText text="Digital DNA" />
              </p>
              <p className="text-xs text-gray-400 font-medium leading-relaxed">High-fidelity VCF sequencing and automated mutation parsing.</p>
            </div>
            <div className="space-y-2 group">
              <p className="text-[10px] font-black tracking-[0.4em] text-purple-500 uppercase group-hover:text-white transition-colors">
                <ScrambleText text="AI Diagnostics" />
              </p>
              <p className="text-xs text-gray-400 font-medium leading-relaxed">Gemini 2.0 powered explainable reasoning for clinical trust.</p>
            </div>
            <div className="space-y-2 group">
              <p className="text-[10px] font-black tracking-[0.4em] text-purple-500 uppercase group-hover:text-white transition-colors">
                <ScrambleText text="Risk Shield" />
              </p>
              <p className="text-xs text-gray-400 font-medium leading-relaxed">Sub-second toxicity prediction and automated dosage mitigation.</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link href="/login">
              <button className="group relative px-12 py-5 bg-purple-600 text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.6)] hover:bg-purple-500 transition-all flex items-center gap-4 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent,rgba(255,255,255,0.2),transparent)] -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                Start Analysis
                <Zap className="w-4 h-4 fill-current group-hover:scale-125 transition-transform" />
              </button>
            </Link>
            <button className="px-12 py-5 bg-transparent border border-purple-500/40 text-purple-600 rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] hover:bg-purple-600 hover:text-white transition-all shadow-[inset_0_0_15px_rgba(168,85,247,0.1)]">
              Clinical Specs
            </button>
          </motion.div>
        </motion.div>

        {/* Floating Scanline Marker */}
        <div className="absolute bottom-10 left-10 flex items-center gap-4 opacity-30">
          <div className="w-8 h-[1px] bg-purple-500 animate-pulse" />
          <span className="text-[8px] font-black tracking-[0.5em] uppercase text-purple-400">Node Syncing...</span>
        </div>
      </section>

      {/* Grid Stats */}
      <section className="py-24 bg-black border-y border-purple-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: "GENE TARGETS", value: "300+", icon: <Dna /> },
              { label: "AI CONFIDENCE", value: "99.8%", icon: <BrainCircuit /> },
              { label: "LATENCY MS", value: "120", icon: <Zap /> },
              { label: "ACCURACY", value: "99.9%", icon: <Crosshair /> }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 bg-purple-900/5 rounded-3xl border border-purple-500/10 shadow-[inner_0_0_20px_rgba(168,85,247,0.05)] text-center relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-[0.15] transition-opacity">
                  {React.cloneElement(stat.icon, { className: "w-12 h-12 text-purple-500" })}
                </div>
                <h4 className="text-5xl font-black text-white tracking-tighter mb-2 group-hover:text-purple-400 transition-colors">{stat.value}</h4>
                <p className="text-[9px] font-black text-purple-500 uppercase tracking-[0.4em]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Command Center */}
      <section id="features" className="py-32 relative bg-black">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.05),transparent_70%)]" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
            <div className="space-y-4">
              <h2 className="text-[12px] font-black text-purple-500 uppercase tracking-[0.5em]">Clinical Feature-Set</h2>
              <h3 className="text-5xl md:text-7xl font-black tracking-tighter">Diagnostic <span className="text-purple-600 italic">Interface.</span></h3>
            </div>
            <p className="max-w-md text-gray-500 text-lg font-medium leading-relaxed">
              Every clinical dimension is calculated in sub-second precision, backed by deep biological reasoning.
            </p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { 
                icon: <Stethoscope />, 
                title: "Clinician Hub", 
                desc: "Unified patient registry with zero-alert noise floor. Optimized for diagnostic efficiency.",
                glow: "shadow-[0_0_30px_rgba(168,85,247,0.15)]"
              },
              { 
                icon: <BrainCircuit />, 
                title: "LLM Reasoning", 
                desc: "Direct integration with Gemini 2.0 to provide biological context for mutation severity.",
                glow: "shadow-[0_0_30px_rgba(168,85,247,0.25)]"
              },
              { 
                icon: <HeartPulse />, 
                title: "Vital Monitoring", 
                desc: "Real-time pharmacokinetic impact assessments for critical dosage management.",
                glow: "shadow-[0_0_30px_rgba(168,85,247,0.15)]"
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                variants={fadeIn}
                whileHover={{ scale: 1.02 }}
                className={`p-10 bg-purple-900/10 rounded-[40px] border border-purple-500/20 group hover:bg-purple-900/20 transition-all ${feature.glow}`}
              >
                <div className="w-16 h-16 rounded-2xl bg-purple-600/20 flex items-center justify-center mb-8 border border-purple-500/30 group-hover:bg-purple-600 transition-all">
                  {React.cloneElement(feature.icon as React.ReactElement, { className: "w-8 h-8 text-purple-400 group-hover:text-white" })}
                </div>
                <h4 className="text-2xl font-black mb-4 tracking-tight group-hover:text-purple-400 transition-colors">{feature.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Deep DNA Visualization Section */}
      <section className="py-32 bg-black overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <motion.div
             initial={{ opacity: 0, x: -100 }}
             whileInView={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.8, ease: "easeOut" }}
             viewport={{ once: true }}
             className="relative aspect-square rounded-[60px] bg-purple-900/10 border border-purple-500/20 flex items-center justify-center overflow-hidden"
           >
              {/* Animated DNA Strand Visual */}
              <div className="absolute inset-0 flex items-center justify-center">
                 <motion.div 
                   style={{ rotate: dnaRotate }}
                   className="w-[120%] h-[120%] border-[20px] border-dashed border-purple-500/5 rounded-full"
                 />
                 <motion.div 
                   animate={{ rotate: -360 }}
                   transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                   className="absolute w-[80%] h-[80%] border-[2px] border-purple-500/10 rounded-full"
                 />
                 <div className="relative z-10 space-y-4 text-center">
                    <Dna className="w-40 h-40 text-purple-500 animate-[pulse_4s_infinite] drop-shadow-[0_0_40px_rgba(168,85,247,0.6)] mx-auto" />
                    <div className="h-1 w-32 bg-purple-500/50 rounded-full mx-auto shadow-[0_0_10px_purple]" />
                 </div>
              </div>
              
              {/* Medical Grid Overlay */}
              <div className="absolute inset-0 opacity-[0.1] bg-[radial-gradient(#A855F7_1px,transparent_1px)] bg-[size:20px_20px]" />
           </motion.div>

           <div className="space-y-8">
              <h2 className="text-[12px] font-black text-purple-500 uppercase tracking-[0.6em]">Molecular Trust</h2>
              <h3 className="text-5xl font-black tracking-tighter leading-tight">Every Gene,<br/><span className="text-purple-600">Perfectly Mapped.</span></h3>
              <p className="text-gray-400 text-lg font-medium leading-relaxed">
                PharmaGuard transforms complex genetic code into clear, actionable clinical strategies. We provide the "Why" behind the "What", bridging the gap between bioinformatics and bedside care.
              </p>
              
              <div className="space-y-6">
                 {[
                   { label: "Sequencing Protocol", desc: "Automated VCF 4.2 processing engine." },
                   { label: "Drug Bio-Library", desc: "1,200+ Pharmacokinetic mappings." },
                   { label: "Security Tier", desc: "End-to-end encrypted clinical nodes." }
                 ].map((item, i) => (
                   <div key={i} className="flex gap-6 items-start group">
                      <div className="w-px h-12 bg-purple-900 group-hover:bg-purple-500 transition-colors mt-1" />
                      <div className="space-y-1">
                         <h5 className="font-black text-sm uppercase tracking-widest text-white group-hover:text-purple-400 transition-colors">{item.label}</h5>
                         <p className="text-xs text-gray-500 font-medium">{item.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* Neon CTA */}
      <section className="py-40 bg-black relative border-t border-purple-900/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15),transparent_70%)]" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="space-y-12"
           >
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85]">ELEVATE YOUR<br/>DIAGNOSTICS.</h2>
              <p className="text-gray-400 text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                 Join the protocol. Deploy PharmaGuard in your clinical workflow and eliminate medication risk with AI-enhanced precision.
              </p>
              <Link href="/login">
                <button className="px-16 py-6 bg-transparent border-2 border-purple-600 text-purple-400 rounded-3xl text-[14px] font-black uppercase tracking-[0.4em] hover:bg-purple-600 hover:text-white hover:shadow-[0_0_60px_rgba(168,85,247,0.6)] transition-all duration-500">
                   Access Protocol
                </button>
              </Link>
           </motion.div>
        </div>
      </section>

      {/* Futuristic Footer */}
      <footer className="py-16 bg-black border-t border-purple-900/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
             <Dna className="w-6 h-6 text-purple-600" />
             <span className="font-black text-lg tracking-[0.2em]">PHARMAGUARD // PROTOCOL</span>
          </div>
          <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.5em]">
            © 2026 // BIOMETRIC INTELLIGENCE CORP // EXPERIMENTAL UNIT
          </p>
          <div className="flex gap-8 text-[9px] font-black text-purple-600 uppercase tracking-[0.3em]">
             <a href="#" className="hover:text-white transition-colors">Encrypted-Storage</a>
             <a href="#" className="hover:text-white transition-colors">HIPAA-Sync</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
