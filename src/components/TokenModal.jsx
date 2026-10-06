import React, { useState } from 'react';
import { X, QrCode, CheckCircle, Clock, Stethoscope, ShieldCheck, MapPin, User, Sparkles, AlertCircle } from 'lucide-react';

export default function TokenModal({ isOpen, onClose, doctor, onConfirmBooking, activeToken, viewPassOnly }) {
  const [patientName, setPatientName] = useState('Alex Morgan');
  const [patientAge, setPatientAge] = useState('28');
  const [patientPhone, setPatientPhone] = useState('+91 98765 43210');
  const [symptoms, setSymptoms] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!doctor) return;
    onConfirmBooking({
      doctor,
      patientName,
      patientAge,
      patientPhone,
      symptoms,
      isEmergency
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-500/10 text-teal-400 rounded-xl">
              {viewPassOnly ? <QrCode className="w-5 h-5" /> : <Stethoscope className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {viewPassOnly ? 'Digital Consultation Token Pass' : 'Book Digital Consultation Token'}
              </h3>
              <p className="text-xs text-slate-400">
                {viewPassOnly ? 'Scan QR at hospital check-in kiosk' : 'Instant token generation & AI queue prediction'}
              </p>
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
        <div className="p-6 overflow-y-auto space-y-5">
          {viewPassOnly && activeToken ? (
            /* Digital Pass QR Screen */
            <div className="space-y-5 text-center">
              {/* QR Code Container */}
              <div className="bg-white p-5 rounded-3xl inline-block shadow-xl shadow-teal-500/10 border-4 border-teal-500/20">
                <img 
                  src={activeToken.qrCodeUrl || "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=MEDIQUEUE-PASS"} 
                  alt="Token QR Pass" 
                  className="w-44 h-44 mx-auto"
                />
                <p className="mt-2 text-xs font-mono font-bold text-slate-800 tracking-wider">
                  TOKEN ID: {activeToken.tokenNumber}
                </p>
              </div>

              {/* Status Banner */}
              <div className="bg-teal-500/10 border border-teal-500/30 rounded-2xl p-3 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-teal-400 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-teal-400" /> Active Token Booking
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono font-bold">
                    {activeToken.status}
                  </span>
                </div>
                <div className="text-xs text-slate-300 flex justify-between pt-1 border-t border-teal-500/20">
                  <span>Patient: <strong>{activeToken.patientName}</strong></span>
                  <span>Est Wait: <strong className="text-teal-300">{activeToken.estimatedWaitMinutes} mins</strong></span>
                </div>
              </div>

              {/* Consultation Details Card */}
              <div className="bg-slate-800/60 rounded-2xl p-4 text-left space-y-2 border border-slate-700/50">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Doctor:</span>
                  <span className="font-semibold text-white">{activeToken.doctorName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Department:</span>
                  <span className="font-medium text-teal-300">{activeToken.department}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Room Location:</span>
                  <span className="font-medium text-amber-300 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {activeToken.room}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-700/60">
                  <span className="text-slate-400">Current Token Serving:</span>
                  <span className="font-mono font-bold text-white bg-slate-700 px-2 py-0.5 rounded">
                    {activeToken.currentlyServing}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Show this QR code at the Kiosk or Doctor's assistant on arrival</span>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Doctor Quick Summary */}
              {doctor && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center font-bold">
                    <Stethoscope className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{doctor.name}</h4>
                    <p className="text-xs text-teal-400 font-medium">{doctor.specialty} • {doctor.room}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Est Wait: ~{(doctor.queueLength * doctor.avgConsultTimeMinutes)} mins ({doctor.queueLength} in queue)</p>
                  </div>
                </div>
              )}

              {/* Inputs */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Patient Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                    placeholder="Enter patient name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Age</label>
                  <input 
                    type="number" 
                    required
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mobile Phone</label>
                  <input 
                    type="text" 
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Primary Symptoms / Reason for visit (Optional)</label>
                <textarea 
                  rows={2}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500 resize-none"
                  placeholder="e.g. Mild fever, chest tightness, routine checkup..."
                />
              </div>

              {/* Emergency Checkbox */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-amber-200 font-medium">Request Emergency Express Priority</span>
                </div>
                <input 
                  type="checkbox"
                  checked={isEmergency}
                  onChange={(e) => setIsEmergency(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>Confirm & Generate Digital Token</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
