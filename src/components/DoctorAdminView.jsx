import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserCheck, Volume2, Radio, QrCode, CheckCircle, Clock, AlertTriangle, 
  ArrowRight, ShieldCheck, RefreshCw, Smartphone, Server, Play, Pause, Activity
} from 'lucide-react';
import { MOCK_DOCTORS } from '../data/mockData';
import { announceTokenVoice } from '../utils/audioUtils';
import { fetchStats, advanceQueue as apiAdvanceQueue } from '../utils/api';

export default function DoctorAdminView({ 
  currentDoctorState, 
  onCallNextPatient, 
  onCompleteConsultation, 
  onSimulateKioskScan,
  activeToken,
  buzzerAnnouncedToken
}) {
  const [selectedDoctor, setSelectedDoctor] = useState(MOCK_DOCTORS[0]);
  const [doctorStatus, setDoctorStatus] = useState('In Consultation');
  const [lastActionLog, setLastActionLog] = useState('System initialized. Doctor RFID logged into Room 102.');
  const [isBuzzerActive, setIsBuzzerActive] = useState(false);
  const [liveStats, setLiveStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const refreshStats = useCallback(async () => {
    setStatsLoading(true);
    const stats = await fetchStats();
    if (stats) setLiveStats(stats);
    setStatsLoading(false);
  }, []);

  useEffect(() => {
    refreshStats();
    // Auto-refresh stats every 30 seconds
    const interval = setInterval(refreshStats, 30000);
    return () => clearInterval(interval);
  }, [refreshStats]);

  const handleCallNext = () => {
    setIsBuzzerActive(true);
    onCallNextPatient();
    const nextToken = activeToken?.currentlyServing || 'A-109';
    announceTokenVoice(nextToken, selectedDoctor.room, selectedDoctor.name);
    setLastActionLog(`📢 Token called: ${nextToken}. Counter Buzzer & Loudspeaker chime triggered.`);
    setTimeout(() => {
      setIsBuzzerActive(false);
      refreshStats();
    }, 3500);
  };

  const handleRfidTap = () => {
    onCompleteConsultation();
    setLastActionLog(`💳 RFID Tap detected! Consultation completed for current patient.`);
    setTimeout(refreshStats, 1000);
  };

  const handleKioskCheckIn = () => {
    onSimulateKioskScan();
    setLastActionLog(`🎟️ Kiosk Scanner: QR verified for Patient Alex Morgan (Token A-112).`);
    setTimeout(refreshStats, 1000);
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950/60 to-slate-900 border border-teal-500/30 p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded-full">
              Hospital Management Control Panel
            </span>
            <span className="text-xs text-slate-400 font-mono">Room 102 • Block A</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Doctor & Room Control Station</h2>
          <p className="text-xs text-slate-400">Manage real-time token queues, RFID tap check-outs, and digital buzzer displays.</p>
        </div>

        {/* Doctor Selector */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <select 
            value={selectedDoctor.id}
            onChange={(e) => {
              const doc = MOCK_DOCTORS.find(d => d.id === e.target.value);
              if (doc) setSelectedDoctor(doc);
            }}
            className="bg-slate-900 border border-slate-700 text-white text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:border-teal-500"
          >
            {MOCK_DOCTORS.map(doc => (
              <option key={doc.id} value={doc.id}>
                {doc.name} ({doc.specialty})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Simulated LED Digital Token Display Board & Buzzer */}
      <section className={`relative overflow-hidden rounded-3xl bg-slate-950 border-2 p-6 text-center transition-all ${
        isBuzzerActive 
          ? 'border-amber-400 ring-4 ring-amber-400/20 shadow-2xl shadow-amber-500/20' 
          : 'border-teal-500/40 shadow-xl'
      }`}>
        
        {/* Glow Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2 font-mono text-slate-400">
            <Radio className="w-4 h-4 text-teal-400 animate-pulse" />
            <span>HOSPITAL LOBBY LED DISPLAY BOARD</span>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            isBuzzerActive ? 'bg-amber-400 text-slate-950 animate-bounce' : 'bg-slate-800 text-teal-300'
          }`}>
            {isBuzzerActive ? '🔔 BUZZER CHIMING NOW' : 'LIVE BOARD ACTIVE'}
          </span>
        </div>

        <div className="py-4 space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Now Calling Token</p>
          <div className="text-5xl sm:text-6xl font-extrabold font-mono text-gradient tracking-tight">
            {activeToken?.currentlyServing || 'A-108'}
          </div>
          <p className="text-sm font-semibold text-slate-200">
            Proceed to <span className="text-teal-300 font-bold">{selectedDoctor.room}</span> ({selectedDoctor.name})
          </p>
        </div>

        {/* Audio Visualizer Waves */}
        {isBuzzerActive && (
          <div className="flex items-center justify-center gap-1.5 my-2">
            <span className="w-1.5 h-6 bg-amber-400 rounded-full animate-bounce"></span>
            <span className="w-1.5 h-10 bg-amber-400 rounded-full animate-bounce delay-75"></span>
            <span className="w-1.5 h-8 bg-amber-400 rounded-full animate-bounce delay-150"></span>
            <span className="w-1.5 h-5 bg-amber-400 rounded-full animate-bounce delay-100"></span>
          </div>
        )}

        <p className="text-[11px] text-slate-500 mt-2">
          Syncs with Patient Mobile App, Kiosk K1, and Hallway Monitors.
        </p>
      </section>

      {/* Control Station Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Doctor Actions */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-lg">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-teal-400" />
            Doctor & Room Operations
          </h3>

          <div className="space-y-3">
            {/* Call Next Button */}
            <button
              onClick={handleCallNext}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-sm rounded-2xl shadow-lg shadow-teal-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Volume2 className="w-5 h-5 fill-slate-950" />
              <span>📢 Call Next Patient Token</span>
            </button>

            {/* RFID Tap Button */}
            <button
              onClick={handleRfidTap}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs rounded-2xl border border-teal-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Radio className="w-4 h-4 text-teal-400" />
              <span>💳 Tap Doctor RFID (Complete Consultation)</span>
            </button>

            {/* Room Status Selector */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Doctor Room Status</label>
              <div className="grid grid-cols-3 gap-2">
                {['In Consultation', 'In Room', 'On Break'].map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      setDoctorStatus(status);
                      setLastActionLog(`Doctor status changed to: ${status}`);
                    }}
                    className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all ${
                      doctorStatus === status
                        ? 'bg-teal-500/20 border-teal-400 text-teal-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Kiosk & Patient Flow Actions */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-lg">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <QrCode className="w-4 h-4 text-cyan-400" />
            Patient Kiosk & SMS Notifications
          </h3>

          <div className="space-y-3">
            {/* Simulate Kiosk Scan */}
            <button
              onClick={handleKioskCheckIn}
              className="w-full py-3 px-4 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-bold text-xs rounded-2xl border border-cyan-500/40 transition-all flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>🎟️ Patient Lobby Kiosk Check-In Scan</span>
            </button>

            {/* Send SMS Notification */}
            <button
              onClick={() => setLastActionLog('📲 SMS & App push notification dispatched: "Your token A-112 is next!"')}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-2xl border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4 text-teal-400" />
              <span>📲 Dispatch SMS Alert to Next 3 Patients</span>
            </button>

            {/* Live System Log Output */}
            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-[11px] font-mono text-slate-300">
              <span className="text-slate-500 font-bold block mb-1">SYSTEM ACTION LOG:</span>
              <p className="text-teal-400 font-medium">{lastActionLog}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Queue Metrics Summary */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Tokens Today</span>
          <span className="text-2xl font-bold font-mono text-white block mt-1">
            {statsLoading ? <span className="inline-block w-8 h-6 bg-slate-800 rounded animate-pulse" /> : (liveStats?.totalTokensToday ?? '—')}
          </span>
          {liveStats && <span className="text-[10px] text-slate-500 absolute bottom-2 right-3">live</span>}
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Consultations Completed</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 block mt-1">
            {statsLoading ? <span className="inline-block w-8 h-6 bg-slate-800 rounded animate-pulse" /> : (liveStats?.consultationsCompleted ?? '—')}
          </span>
          {liveStats && <span className="text-[10px] text-slate-500 absolute bottom-2 right-3">live</span>}
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Avg Consult Speed</span>
          <span className="text-2xl font-bold font-mono text-teal-300 block mt-1">
            {statsLoading ? <span className="inline-block w-10 h-6 bg-slate-800 rounded animate-pulse" /> : `${liveStats?.avgConsultSpeedMins ?? '—'} mins`}
          </span>
          {liveStats && <span className="text-[10px] text-slate-500 absolute bottom-2 right-3">live</span>}
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">AI Wait Accuracy</span>
          <span className="text-2xl font-bold font-mono text-cyan-300 block mt-1">
            {statsLoading ? <span className="inline-block w-12 h-6 bg-slate-800 rounded animate-pulse" /> : (liveStats?.aiWaitAccuracy ?? '—')}
          </span>
          {liveStats && <span className="text-[10px] text-slate-500 absolute bottom-2 right-3">live</span>}
        </div>
      </section>

    </div>
  );
}
