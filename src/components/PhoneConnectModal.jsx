import React, { useState } from 'react';
import { X, Smartphone, QrCode, Wifi, Copy, Check, ExternalLink, ShieldCheck, Zap } from 'lucide-react';

export default function PhoneConnectModal({ isOpen, onClose }) {
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const wifiUrl = 'https://tiny-swans-unite.loca.lt';
  const ethernetUrl = 'http://172.29.204.42:3000';
  const qrCodeImg = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(wifiUrl)}`;

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-teal-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-500/10 text-teal-400 rounded-xl">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Open MediQueue on Your Phone</h3>
              <p className="text-xs text-slate-400">Live mobile queue & real-time token sync</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 text-center">
          
          {/* QR Code Container */}
          <div className="inline-block p-4 bg-white rounded-3xl shadow-xl shadow-teal-500/10 ring-4 ring-teal-500/20">
            <img 
              src={qrCodeImg} 
              alt="Scan QR Code to open on phone" 
              className="w-48 h-48 object-contain rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 text-teal-300 text-xs font-bold border border-teal-500/30">
              <Zap className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              Instant Camera Scan Supported
            </span>
            <p className="text-xs text-slate-300 max-w-xs mx-auto pt-1">
              Open your phone camera app and point it at the QR code above to launch MediQueue instantly on your phone.
            </p>
          </div>

          {/* Wi-Fi & IP Address Link Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2 text-left">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1.5 text-teal-400">
                <Wifi className="w-4 h-4" /> Wi-Fi Network Address
              </span>
              <span className="text-[10px] text-teal-300 uppercase font-mono font-bold">Public HTTPS Tunnel</span>
            </div>

            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-2.5">
              <span className="font-mono text-sm font-bold text-white tracking-wide">{wifiUrl}</span>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCopy(wifiUrl)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Copy URL"
                >
                  {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={wifiUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500 text-teal-300 hover:text-slate-950 transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Alternative IP */}
            <p className="text-[11px] text-slate-500 flex items-center justify-between">
              <span>Alternative Ethernet LAN URL:</span>
              <span className="font-mono text-slate-400">{ethernetUrl}</span>
            </p>
          </div>

          {/* Feature Callouts */}
          <div className="grid grid-cols-2 gap-2 text-left text-[11px]">
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
              <span className="text-slate-300">Live Cross-Tab Queue Sync</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-slate-300">Mobile QR Digital Pass</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all"
          >
            Done
          </button>

        </div>

      </div>
    </div>
  );
}
