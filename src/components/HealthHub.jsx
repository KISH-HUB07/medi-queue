import React, { useState } from 'react';
import { 
  FileText, Pill, AlertTriangle, ShieldCheck, Download, Plus, Check, Clock, 
  Calendar, ChevronRight, Activity, Heart, Sparkles
} from 'lucide-react';
import { MOCK_HEALTH_RECORDS, MOCK_MEDICINE_REMINDERS } from '../data/mockData';

export default function HealthHub({ onOpenEmergencyModal }) {
  const [reminders, setReminders] = useState(MOCK_MEDICINE_REMINDERS);
  const [activeTab, setActiveTab] = useState('records');

  const toggleMedicineTaken = (id) => {
    setReminders(reminders.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border border-teal-500/30 p-5 rounded-3xl shadow-xl flex items-center justify-between">
        <div>
          <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded-full">
            Future Scope & Digital Health
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">Smart Health & Records Hub</h2>
          <p className="text-xs text-slate-400">Access verified digital lab reports, medicine reminders, and emergency triage.</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('records')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'records'
              ? 'bg-teal-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Digital Health Records</span>
        </button>

        <button
          onClick={() => setActiveTab('medicines')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'medicines'
              ? 'bg-teal-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Medicine Reminders</span>
        </button>
      </div>

      {/* Health Records Section */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Your Verified Prescriptions & Scans</h3>
            <button className="text-xs text-teal-400 font-semibold hover:underline flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Upload External Record
            </button>
          </div>

          <div className="space-y-3">
            {MOCK_HEALTH_RECORDS.map(rec => (
              <div 
                key={rec.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 p-4 rounded-2xl flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{rec.title}</h4>
                    <p className="text-xs text-slate-400">{rec.doctor} • {rec.date}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-teal-300">
                      {rec.type}
                    </span>
                  </div>
                </div>

                <button className="p-2 rounded-xl bg-slate-800 hover:bg-teal-500 hover:text-slate-950 text-slate-300 transition-all">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medicine Reminders Section */}
      {activeTab === 'medicines' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Daily Medicine Schedule</h3>
            <span className="text-xs text-teal-400 font-medium">1 of 3 Taken Today</span>
          </div>

          <div className="space-y-3">
            {reminders.map(med => (
              <div 
                key={med.id}
                onClick={() => toggleMedicineTaken(med.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  med.taken 
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-75' 
                    : 'bg-slate-900 border-teal-500/30 hover:border-teal-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    med.taken ? 'bg-emerald-500 text-slate-950' : 'border-2 border-slate-700 text-transparent'
                  }`}>
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  <div>
                    <h4 className={`font-bold text-sm ${med.taken ? 'line-through text-slate-500' : 'text-white'}`}>
                      {med.name}
                    </h4>
                    <p className="text-xs text-slate-400">{med.dose}</p>
                  </div>
                </div>

                <span className="text-xs font-mono font-semibold text-teal-300 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
                  {med.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Express Consultation Banner */}
      <section className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border border-amber-500/30 p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-white text-base">Emergency Express Token Booking</h4>
            <p className="text-xs text-slate-300">Requires triage priority assessment. Bypasses regular morning queues for urgent cases.</p>
          </div>
        </div>

        <button 
          onClick={onOpenEmergencyModal}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 whitespace-nowrap transition-all"
        >
          Request Priority Express Token
        </button>
      </section>

    </div>
  );
}
