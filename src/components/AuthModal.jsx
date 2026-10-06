import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Stethoscope, UserCheck, LogIn, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { loginUser, registerUser, logoutUser } from '../utils/api';

export default function AuthModal({ isOpen, onClose, currentUser, onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('patient');
  const [doctorId, setDoctorId] = useState('doc-1');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await loginUser({ email, password });
        onAuthSuccess(result.user);
        onClose();
      } else {
        const result = await registerUser({
          name,
          email,
          password,
          role,
          doctorId: role === 'doctor' ? doctorId : null
        });
        onAuthSuccess(result.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setError('');
    setLoading(true);
    try {
      const result = await loginUser({ email: demoEmail, password: demoPassword });
      onAuthSuccess(result.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    onAuthSuccess(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-teal-500/10 text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {currentUser ? (
          /* Already Logged In Screen */
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center mx-auto text-2xl font-bold">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{currentUser.name}</h3>
              <p className="text-xs text-slate-400">{currentUser.email}</p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Role: {currentUser.role}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition-all"
              >
                Close
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all"
              >
                Log Out
              </button>
            </div>
          </div>
        ) : (
          /* Sign In / Register Form */
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-extrabold text-white">
                {mode === 'login' ? 'Sign In to MediQueue' : 'Create an Account'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Access role-based hospital queue control and patient appointments
              </p>
            </div>

            {/* Mode Switch Tabs */}
            <div className="flex bg-slate-950 p-1 rounded-xl mb-5 border border-slate-800">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'login' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'register' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" /> Register
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'register' && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Account Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="patient">Patient (Book Appointments & Track Queue)</option>
                    <option value="doctor">Doctor (Call Next & Complete Consultations)</option>
                    <option value="admin">Hospital Administrator / Kiosk Staff</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {/* Quick Demo Logins Section */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block text-center mb-3">
                1-Click Demo Accounts
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('alex@mediqueue.com', 'password123')}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/40 hover:bg-slate-800 text-center transition-all group"
                >
                  <UserCheck className="w-4 h-4 mx-auto text-teal-400 group-hover:scale-110 transition-transform mb-1" />
                  <span className="text-[10px] font-bold block text-slate-200">Patient</span>
                  <span className="text-[9px] text-slate-500 block truncate">Alex Morgan</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('rajesh@mediqueue.com', 'password123')}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/40 hover:bg-slate-800 text-center transition-all group"
                >
                  <Stethoscope className="w-4 h-4 mx-auto text-cyan-400 group-hover:scale-110 transition-transform mb-1" />
                  <span className="text-[10px] font-bold block text-slate-200">Doctor</span>
                  <span className="text-[9px] text-slate-500 block truncate">Dr. Rajesh</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@mediqueue.com', 'admin123')}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/40 hover:bg-slate-800 text-center transition-all group"
                >
                  <ShieldCheck className="w-4 h-4 mx-auto text-amber-400 group-hover:scale-110 transition-transform mb-1" />
                  <span className="text-[10px] font-bold block text-slate-200">Admin</span>
                  <span className="text-[9px] text-slate-500 block truncate">Staff</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
