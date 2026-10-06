import React, { useState, useEffect } from 'react';
import { Radio, Volume2, ShieldAlert, Monitor, Clock, MapPin, Sparkles, CheckCircle2, UserCheck, Flame } from 'lucide-react';
import { MOCK_DOCTORS } from '../data/mockData';
import { announceTokenVoice } from '../utils/audioUtils';

export default function KioskDisplayView({ activeToken, onSimulateNextToken }) {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [isAnnouncing, setIsAnnouncing] = useState(false);
  const [announcedMessage, setAnnouncedMessage] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerVoiceAnnouncement = (tokenNum, roomName, doctorName) => {
    setIsAnnouncing(true);
    setAnnouncedMessage(`"Token ${tokenNum}, please proceed to ${roomName} for ${doctorName}"`);

    // Trigger hospital loudspeaker chime and speech synthesis
    announceTokenVoice(tokenNum, roomName, doctorName);

    setTimeout(() => {
      setIsAnnouncing(false);
    }, 4500);
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* High-Visibility Public LED Display Board */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 border-2 border-teal-500/40 p-6 sm:p-8 shadow-2xl shadow-teal-500/10">
        
        {/* Background Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Board Top Ticker Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Monitor className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                HOSPITAL MAIN OPD WAITING HALL DISPLAY
              </h2>
              <p className="text-xs text-slate-400 font-mono">Live Counter Broadcast • Automatic Audio Chime Sync</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">System Clock</span>
              <span className="text-base font-extrabold font-mono text-teal-300">{currentTime}</span>
            </div>
          </div>
        </div>

        {/* Audio Speech Announcement Visualizer Notification */}
        {isAnnouncing && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-teal-500/20 to-cyan-500/20 border-2 border-amber-400 animate-in fade-in zoom-in-95 flex items-center justify-between gap-3 shadow-lg shadow-amber-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-400 text-slate-950 rounded-xl animate-bounce">
                <Volume2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 block">
                  📢 AUDIO CHIME BROADCASTING OVER LOUDSPEAKER
                </span>
                <p className="text-sm font-bold text-white font-mono">{announcedMessage}</p>
              </div>
            </div>

            {/* Sound Frequency Wave animation */}
            <div className="hidden sm:flex items-center gap-1">
              <span className="w-1.5 h-8 bg-teal-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-12 bg-amber-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-6 bg-teal-400 rounded-full animate-bounce delay-150"></span>
              <span className="w-1.5 h-10 bg-cyan-400 rounded-full animate-bounce delay-100"></span>
            </div>
          </div>
        )}

        {/* Featured Big Announcement Token Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Main Active Token Callout */}
          <div className="md:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/60 border border-teal-500/30 rounded-3xl p-6 sm:p-8 text-center space-y-3 relative overflow-hidden shadow-xl">
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded-full inline-flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-teal-400 animate-ping" />
              NOW SERVING AT COUNTER 1
            </span>

            <div className="py-2">
              <div className="text-6xl sm:text-7xl font-extrabold font-mono text-gradient tracking-tight drop-shadow-md">
                {activeToken?.currentlyServing || 'A-108'}
              </div>
              <p className="text-lg font-bold text-white mt-2">
                Dr. Rajesh Kumar <span className="text-slate-400 font-normal text-sm">(General Medicine)</span>
              </p>
              <p className="text-sm font-semibold text-teal-300 mt-1 flex items-center justify-center gap-1">
                <MapPin className="w-4 h-4 text-teal-400" /> Room 102 • Block A
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-center gap-3">
              <button
                onClick={() => triggerVoiceAnnouncement(activeToken?.currentlyServing || 'A-108', 'Room 102 - Block A', 'Dr. Rajesh Kumar')}
                className="px-5 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-teal-500/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <Volume2 className="w-4 h-4" />
                <span>Play Voice Announcement</span>
              </button>

              <button
                onClick={onSimulateNextToken}
                className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 active:scale-95 transition-all"
              >
                Simulate Call Next
              </button>
            </div>
          </div>

          {/* Emergency Priority Alert Panel */}
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Express Priority Queue</span>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-amber-300">
                <span>Emergency Token</span>
                <span className="font-mono text-sm bg-amber-500/20 px-2 py-0.5 rounded text-amber-200">E-001</span>
              </div>
              <p className="text-[11px] text-slate-300">Priority triage cleared for Trauma Care Room 201.</p>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1">
              <p className="flex justify-between">
                <span>Active OPD Rooms:</span>
                <strong className="text-white">4 Operating</strong>
              </p>
              <p className="flex justify-between">
                <span>Patients Waiting in Hall:</span>
                <strong className="text-teal-300">17 Total</strong>
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* OPD Rooms Live Matrix Board */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-teal-400" />
          OPD Rooms & Active Consultation Matrix
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_DOCTORS.map(doc => (
            <div 
              key={doc.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg hover:border-teal-500/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-800 text-teal-300 px-2 py-0.5 rounded-full border border-slate-700">
                  {doc.specialty}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Active
                </span>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm">{doc.name}</h4>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-500" /> {doc.room}
                </p>
              </div>

              {/* Token Number Display Box */}
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Serving Now</span>
                <span className="text-2xl font-extrabold font-mono text-teal-300 tracking-tight">{doc.currentToken}</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Waiting:</span>
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  {doc.queueLength} Patients
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
