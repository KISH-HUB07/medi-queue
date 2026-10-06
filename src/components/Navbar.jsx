import React, { useState, useEffect } from 'react';
import { Stethoscope, Building2, User, UserCheck, Monitor, Sparkles, Smartphone, Bell, ChevronDown, LogIn, ShieldCheck, Wifi, WifiOff, Download, CheckCircle2 } from 'lucide-react';
import { MOCK_HOSPITAL_BRANCHES } from '../data/mockData';
import { checkApiHealth } from '../utils/api';

export default function Navbar({ 
  activeMode, 
  setActiveMode, 
  selectedBranch, 
  setSelectedBranch, 
  onOpenWorkflowModal, 
  onOpenPhoneModal,
  currentUser,
  onOpenAuthModal 
}) {
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [apiOnline, setApiOnline] = useState(null); // null = checking, true = online, false = offline
  const [pwaInstallPrompt, setPwaInstallPrompt] = useState(null);
  const [pwaInstalled, setPwaInstalled] = useState(false);

  useEffect(() => {
    let interval;
    const check = async () => {
      const online = await checkApiHealth();
      setApiOnline(online);
    };
    check();
    interval = setInterval(check, 15000); // re-check every 15s
    return () => clearInterval(interval);
  }, []);

  // PWA Install Prompt listener
  useEffect(() => {
    const handleInstallAvailable = () => {
      if (window.deferredInstallPrompt) {
        setPwaInstallPrompt(window.deferredInstallPrompt);
      }
    };
    const handleInstalled = () => {
      setPwaInstalled(true);
      setPwaInstallPrompt(null);
    };

    // Check if prompt is already available (set before React mounted)
    if (window.deferredInstallPrompt) {
      setPwaInstallPrompt(window.deferredInstallPrompt);
    }

    window.addEventListener('pwaInstallAvailable', handleInstallAvailable);
    window.addEventListener('pwaInstalled', handleInstalled);
    return () => {
      window.removeEventListener('pwaInstallAvailable', handleInstallAvailable);
      window.removeEventListener('pwaInstalled', handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!pwaInstallPrompt) return;
    pwaInstallPrompt.prompt();
    const { outcome } = await pwaInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      setPwaInstalled(true);
    }
    setPwaInstallPrompt(null);
    window.deferredInstallPrompt = null;
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 text-slate-950 shadow-lg shadow-teal-500/20 font-bold">
            <Stethoscope className="w-6 h-6 stroke-[2.5]" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-400"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                Medi<span className="text-teal-400">Queue</span>
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-teal-500/10 text-teal-400 border border-teal-500/30 rounded-full">
                AI Powered
              </span>
              {/* Live API Status Indicator */}
              <span
                title={apiOnline === null ? 'Checking API...' : apiOnline ? 'Backend API Online' : 'Backend API Offline'}
                className={`hidden sm:flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full border transition-all ${
                  apiOnline === null
                    ? 'border-slate-700 text-slate-500 bg-slate-800/50'
                    : apiOnline
                    ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                    : 'border-red-500/40 text-red-400 bg-red-500/10'
                }`}
              >
                {apiOnline === null ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse"></span>
                ) : apiOnline ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                )}
                {apiOnline === null ? 'Checking' : apiOnline ? 'API Live' : 'API Down'}
              </span>
            </div>
            
            {/* Hospital Branch Selector */}
            <div className="relative">
              <button 
                onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-teal-300 transition-colors"
              >
                <Building2 className="w-3 h-3 text-teal-400" />
                <span className="truncate max-w-[150px] sm:max-w-[220px] font-medium">{selectedBranch?.name || 'Apollo City Hospital'}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {showBranchDropdown && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="text-[10px] uppercase font-semibold text-slate-400 px-3 py-1.5 tracking-wider">
                    Select Hospital Location
                  </div>
                  {MOCK_HOSPITAL_BRANCHES.map(branch => (
                    <button
                      key={branch.id}
                      onClick={() => {
                        setSelectedBranch(branch);
                        setShowBranchDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex flex-col ${
                        selectedBranch?.id === branch.id 
                          ? 'bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/30' 
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="font-medium text-slate-200">{branch.name}</span>
                      <span className="text-[11px] text-slate-500">{branch.address} • {branch.distance}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls & Mode Switcher */}
        <div className="flex items-center gap-2">
          
          {/* PWA Install Button */}
          {pwaInstalled ? (
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>App Installed</span>
            </span>
          ) : pwaInstallPrompt ? (
            <button
              onClick={handleInstallClick}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-cyan-400 hover:brightness-110 rounded-xl transition-all shadow-md shadow-teal-500/20 active:scale-95 animate-pulse"
              title="Install MediQueue as an app on your device"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          ) : (
            <button
              onClick={onOpenPhoneModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-cyan-400 hover:brightness-110 rounded-xl transition-all shadow-md shadow-teal-500/20 active:scale-95"
              title="Scan QR Code to view app on connected mobile phone"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Connect Phone</span>
            </button>
          )}

          {/* Mode Switcher: Patient App vs Public Display Board vs Hospital Admin Portal */}
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center gap-0.5">
            <button
              onClick={() => setActiveMode('patient')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeMode === 'patient'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Patient</span>
            </button>

            <button
              onClick={() => setActiveMode('kiosk')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeMode === 'kiosk'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kiosk</span>
            </button>

            <button
              onClick={() => setActiveMode('doctor')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeMode === 'doctor'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Doctor Panel</span>
            </button>
          </div>

          {/* User Account / Auth Trigger */}
          <button
            onClick={onOpenAuthModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              currentUser
                ? 'bg-teal-500/10 border-teal-500/30 text-teal-300 hover:bg-teal-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
            title={currentUser ? `Logged in as ${currentUser.name} (${currentUser.role})` : 'Sign in or register'}
          >
            {currentUser ? (
              <>
                <div className="w-4 h-4 rounded-full bg-teal-500 text-slate-950 text-[10px] font-extrabold flex items-center justify-center">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="hidden md:inline max-w-[90px] truncate">{currentUser.name}</span>
                <span className="text-[10px] uppercase font-bold text-teal-400 bg-teal-500/20 px-1 rounded">
                  {currentUser.role}
                </span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5 text-teal-400" />
                <span>Sign In</span>
              </>
            )}
          </button>

        </div>

      </div>
    </header>
  );
}
