import React, { useState, useEffect } from 'react';
import { 
  Clock, QrCode, UserCheck, Activity, Heart, Stethoscope, Brain, Baby, Sparkles, 
  ChevronRight, MapPin, Star, AlertCircle, RefreshCw, CheckCircle, Flame, ArrowUpRight, Zap, ShieldCheck
} from 'lucide-react';
import { MOCK_DEPARTMENTS, MOCK_DOCTORS } from '../data/mockData';
import { fetchAllTokens } from '../utils/api';

export default function PatientView({ activeToken, onOpenBookingModal, onViewQrPass, onSimulateNextToken }) {
  const [selectedDept, setSelectedDept] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveQueueStream, setLiveQueueStream] = useState([]);
  const [queueLoading, setQueueLoading] = useState(true);

  const loadQueueStream = async () => {
    setQueueLoading(true);
    const tokens = await fetchAllTokens({ limit: 8 });
    if (tokens && tokens.length > 0) {
      setLiveQueueStream(tokens.reverse()); // oldest first for stream display
    }
    setQueueLoading(false);
  };

  useEffect(() => {
    loadQueueStream();
  }, [activeToken?.tokenNumber]); // refresh when active token changes

  // Department icon mapper
  const getDeptIcon = (iconName) => {
    switch (iconName) {
      case 'Heart': return <Heart className="w-4 h-4" />;
      case 'Baby': return <Baby className="w-4 h-4" />;
      case 'Activity': return <Activity className="w-4 h-4" />;
      case 'Stethoscope': return <Stethoscope className="w-4 h-4" />;
      case 'Brain': return <Brain className="w-4 h-4" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4" />;
      default: return <Stethoscope className="w-4 h-4" />;
    }
  };

  const filteredDoctors = MOCK_DOCTORS.filter(doc => {
    const matchesDept = selectedDept === 'all' || doc.deptId === selectedDept;
    const matchesQuery = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesQuery;
  });

  return (
    <div className="space-y-6 pb-20">
      
      {/* Active Token Hero Card */}
      {activeToken ? (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950/40 to-slate-900 border border-teal-500/30 p-6 shadow-2xl shadow-teal-500/10">
          
          {/* Subtle Background Glow Elements */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            {/* Left: Token Metadata & Live Queue Status */}
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 text-xs font-extrabold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
                  Live Active Token
                </span>
                <span className="text-xs font-mono font-medium text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                  ID: {activeToken.tokenNumber}
                </span>
              </div>

              <div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-3">
                  <span className="text-gradient font-mono text-4xl">{activeToken.tokenNumber}</span>
                  <span className="text-sm font-normal text-slate-400">for {activeToken.doctorName}</span>
                </h2>
                <p className="text-xs text-teal-300 font-medium flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" /> {activeToken.room} • {activeToken.department}
                </p>
              </div>

              {/* Status Details Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3">
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Currently Serving</span>
                  <span className="text-lg font-bold font-mono text-white flex items-center gap-1.5 mt-0.5">
                    <UserCheck className="w-4 h-4 text-teal-400" />
                    {activeToken.currentlyServing}
                  </span>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3">
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Patients Ahead</span>
                  <span className="text-lg font-bold text-amber-400 flex items-center gap-1.5 mt-0.5">
                    <Flame className="w-4 h-4 text-amber-400" />
                    {activeToken.positionInQueue} Patients
                  </span>
                </div>

                <div className="col-span-2 sm:col-span-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-3">
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">AI Est. Waiting Time</span>
                  <span className="text-lg font-bold text-teal-300 flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-4 h-4 text-teal-400" />
                    ~{activeToken.estimatedWaitMinutes} mins
                  </span>
                </div>

              </div>
            </div>

            {/* Right: Interactive Timer Ring & QR Pass Button */}
            <div className="w-full md:w-auto flex flex-col items-center justify-center p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 min-w-[200px]">
              
              {/* Circular Wait Ring */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-teal-400 stroke-current transition-all duration-1000 ease-out"
                    strokeDasharray="75, 100"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-lg font-extrabold text-white font-mono">{activeToken.estimatedWaitMinutes}m</span>
                  <span className="text-[9px] text-teal-300 uppercase tracking-widest font-semibold">ETA</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-2 font-medium flex items-center gap-1">
                <Zap className="w-3 h-3 text-teal-400 fill-teal-400" />
                {activeToken.aiConfidenceScore}
              </p>

              {/* View QR Pass Action */}
              <button
                onClick={onViewQrPass}
                className="mt-3 w-full py-2 px-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <QrCode className="w-4 h-4" />
                <span>Show Digital QR Pass</span>
              </button>

            </div>

          </div>

          {/* AI Factor Tags */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">AI Model Factors:</span>
              {activeToken.aiFactors.map((factor, idx) => (
                <span key={idx} className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                  • {factor}
                </span>
              ))}
            </div>
            <button 
              onClick={onSimulateNextToken}
              className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 underline text-[11px]"
              title="Test simulation of queue advancing"
            >
              <RefreshCw className="w-3 h-3" /> Simulate Queue Advance
            </button>
          </div>

        </section>
      ) : (
        /* Empty Token Banner */
        <section className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No Active Consultation Token</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Select a specialist or department below to book a digital consultation token and get real-time AI waiting time updates.
          </p>
        </section>
      )}

      {/* Live Queue Progress Flow Stream */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-400" />
            Live Digital Token Stream
          </h3>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Live Sync
          </span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {queueLoading ? (
            // Skeleton loading state
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="min-w-[130px] p-3 rounded-2xl border border-slate-800 bg-slate-900 animate-pulse flex flex-col gap-2">
                <div className="h-2 bg-slate-800 rounded w-2/3"></div>
                <div className="h-6 bg-slate-800 rounded w-1/2"></div>
                <div className="h-2 bg-slate-800 rounded w-3/4"></div>
              </div>
            ))
          ) : liveQueueStream.length > 0 ? (
            liveQueueStream.map((token, idx) => {
              const isUserToken = token.tokenNumber === activeToken?.tokenNumber;
              const isServing = token.positionInQueue === 0 || token.status === 'Your Turn Now!';
              return (
                <div
                  key={token.id || token.tokenNumber}
                  className={`min-w-[130px] p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                    isServing
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-500/10'
                      : isUserToken
                      ? 'bg-teal-500/20 border-teal-400 text-teal-200 font-bold ring-2 ring-teal-500/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider">
                      {isServing ? 'In Room' : isUserToken ? 'Your Token' : `Queue #${idx + 1}`}
                    </span>
                    {isServing && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>}
                  </div>
                  <span className="font-mono text-xl font-extrabold text-white">{token.tokenNumber}</span>
                  <span className="text-[10px] text-slate-400 mt-1 truncate">
                    {isServing ? 'Consulting Now' : token.doctorName?.split(' ').slice(-1)[0]}
                  </span>
                </div>
              );
            })
          ) : (
            // Fallback static stream if no DB tokens yet
            ['A-108', 'A-109', 'A-110', 'A-111', 'A-112', 'A-113'].map((token, idx) => {
              const isServing = idx === 0;
              const isUserToken = token === (activeToken?.tokenNumber || 'A-112');
              return (
                <div
                  key={token}
                  className={`min-w-[130px] p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                    isServing
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-500/10'
                      : isUserToken
                      ? 'bg-teal-500/20 border-teal-400 text-teal-200 font-bold ring-2 ring-teal-500/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider">
                      {isServing ? 'In Room' : isUserToken ? 'Your Token' : `Queue #${idx + 1}`}
                    </span>
                    {isServing && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>}
                  </div>
                  <span className="font-mono text-xl font-extrabold text-white">{token}</span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    {isServing ? 'Consulting Now' : `Est ~${idx * 4 + 2}m`}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Departments Filter Horizontal Scroll */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-teal-400" />
          Medical Departments
        </h3>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedDept('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedDept === 'all'
                ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            All Departments ({MOCK_DEPARTMENTS.length})
          </button>

          {MOCK_DEPARTMENTS.map(dept => (
            <button
              key={dept.id}
              onClick={() => setSelectedDept(dept.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedDept === dept.id
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {getDeptIcon(dept.icon)}
              <span>{dept.name}</span>
              <span className="text-[10px] opacity-75 bg-slate-800 px-1.5 py-0.5 rounded-full text-slate-300">
                {dept.avgWait}m avg
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Doctor Availability Catalog */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-teal-400" />
            Available Doctors & Real-Time Queue Length
          </h3>
          
          <input
            type="text"
            placeholder="Search doctor or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-1.5 rounded-xl focus:outline-none focus:border-teal-500 w-full sm:w-64"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDoctors.map(doctor => (
            <div 
              key={doctor.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 rounded-2xl p-4 transition-all duration-200 shadow-lg flex flex-col justify-between group"
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-lg">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                    doctor.status === 'In Room' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}></span>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-bold text-white text-base group-hover:text-teal-300 transition-colors">
                      {doctor.name}
                    </h4>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {doctor.rating}
                    </span>
                  </div>

                  <p className="text-xs text-teal-400 font-medium">{doctor.specialty} • {doctor.experience}</p>
                  
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" /> {doctor.room}
                  </p>
                </div>
              </div>

              {/* Status Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="text-xs text-slate-300">
                  <span className="text-slate-400 text-[11px] block">Queue Status</span>
                  <span className="font-semibold text-white">
                    {doctor.queueLength} Patients Waiting (~{doctor.queueLength * doctor.avgConsultTimeMinutes} mins)
                  </span>
                </div>

                <button
                  onClick={() => onOpenBookingModal(doctor)}
                  className="px-4 py-2 rounded-xl bg-teal-500/15 hover:bg-teal-500 text-teal-300 hover:text-slate-950 font-bold text-xs border border-teal-500/30 transition-all flex items-center gap-1"
                >
                  <span>Book Token</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
