import React from 'react';
import { X, Layers, Cpu, Server, CheckCircle2, ArrowRight, Zap, Shield, Smartphone, Clock } from 'lucide-react';

export default function WorkflowExplainerModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-500/10 text-teal-400 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">MediQueue System Architecture & Workflow</h3>
              <p className="text-xs text-slate-400">Project specifications based on hospital queue automation documentation</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Problem Statement Card */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <h4 className="font-bold text-teal-400 text-sm mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" />
              II. Problem Statement Solved
            </h4>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Many hospitals still rely on manual token systems, causing long waiting hours and overcrowded waiting areas.</li>
              <li>Patients lack real-time visibility into expected consultation times, causing frustration and wasted time.</li>
              <li>Hospital staff struggle to manage patient flow during peak morning & afternoon hours.</li>
            </ul>
          </div>

          {/* Three-Tier Architecture Grid */}
          <div>
            <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-teal-400" />
              III. Three-Tier System Architecture
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              {/* User Layer */}
              <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Smartphone className="w-4 h-4 text-teal-400" />
                    <h5 className="font-bold text-white text-xs uppercase tracking-wider">1. User Layer</h5>
                  </div>
                  <p className="text-xs text-slate-300">
                    Patients book digital consultation tokens, monitor live queue status in real-time, and receive predictive wait-time notifications via smartphone.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-teal-500/20 text-[11px] text-teal-300 font-medium">
                  Active in Patient Mobile App
                </div>
              </div>

              {/* AI Processing Layer */}
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <h5 className="font-bold text-white text-xs uppercase tracking-wider">2. AI Engine Layer</h5>
                  </div>
                  <p className="text-xs text-slate-300">
                    Calculates dynamic waiting time ETAs by continuously analyzing queue length, consultation speed per doctor, and historical hospital peak hours.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-cyan-500/20 text-[11px] text-cyan-300 font-medium">
                  Continuous Prediction Engine
                </div>
              </div>

              {/* Hospital Management Layer */}
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Server className="w-4 h-4 text-indigo-400" />
                    <h5 className="font-bold text-white text-xs uppercase tracking-wider">3. Hospital Layer</h5>
                  </div>
                  <p className="text-xs text-slate-300">
                    Hospital database manages patient medical records, doctor availability, room status (via RFID tap), token generation, and live counter buzzers.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-indigo-500/20 text-[11px] text-indigo-300 font-medium">
                  Hospital Admin & Kiosk Hub
                </div>
              </div>

            </div>
          </div>

          {/* Block Diagram Workflow Flowchart */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
            <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-teal-400" />
              VII. System Dataflow & Control Loop
            </h4>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="font-semibold text-teal-400 block mb-1">Inputs (Data Sources)</span>
                  <p className="text-slate-300 text-[11px]">
                    • <strong>Patient Kiosk:</strong> QR scan or token generation upon arrival.<br/>
                    • <strong>Doctor / Room Status:</strong> RFID tap marks consultation complete.
                  </p>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="font-semibold text-cyan-400 block mb-1">Main AI Controller</span>
                  <p className="text-slate-300 text-[11px]">
                    • Reads live token queue state.<br/>
                    • Predicts wait times (AI/ML models).<br/>
                    • Updates priority & dispatches notifications.
                  </p>
                </div>

              </div>

              <div className="flex justify-center text-slate-500 my-1">
                <ArrowRight className="w-5 h-5 rotate-90 sm:rotate-0 text-teal-400 animate-pulse" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="font-semibold text-amber-400 block mb-1">Outputs (Display & Alerts)</span>
                  <p className="text-slate-300 text-[11px]">
                    • <strong>Token Display & Buzzer:</strong> Live LED display at hospital.<br/>
                    • <strong>SMS & App Notification:</strong> Alerts patient before their turn.
                  </p>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="font-semibold text-purple-400 block mb-1">Cloud Platform</span>
                  <p className="text-slate-300 text-[11px]">
                    • Syncs mobile app with doctor dashboard in real-time.<br/>
                    • Predicts hospital peak crowd hours.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition-colors"
          >
            Close Workflow Overview
          </button>
        </div>

      </div>
    </div>
  );
}
