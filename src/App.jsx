import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PatientView from './components/PatientView';
import DoctorAdminView from './components/DoctorAdminView';
import KioskDisplayView from './components/KioskDisplayView';
import HealthHub from './components/HealthHub';
import TokenModal from './components/TokenModal';
import WorkflowExplainerModal from './components/WorkflowExplainerModal';
import PhoneConnectModal from './components/PhoneConnectModal';
import AuthModal from './components/AuthModal';
import { 
  MOCK_HOSPITAL_BRANCHES, 
  INITIAL_USER_TOKEN, 
  MOCK_DOCTORS 
} from './data/mockData';
import { 
  fetchBranches, 
  fetchDoctors, 
  bookToken, 
  advanceQueue, 
  kioskScanToken, 
  fetchTokenStatus,
  getSavedUser,
  fetchCurrentUser
} from './utils/api';
import { socket } from './utils/socket';
import { Activity, QrCode, FileText, Sparkles, Heart } from 'lucide-react';

export default function App() {
  const [activeMode, setActiveMode] = useState('patient'); // 'patient', 'kiosk', or 'doctor'
  const [patientTab, setPatientTab] = useState('queue'); // 'queue' or 'health'
  const [selectedBranch, setSelectedBranch] = useState(MOCK_HOSPITAL_BRANCHES[0]);
  
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => getSavedUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Validate or refresh session on initial load
  useEffect(() => {
    fetchCurrentUser().then(user => {
      if (user) setCurrentUser(user);
    });
  }, []);

  // Active token state with localStorage persistence
  const [userToken, setUserToken] = useState(() => {
    try {
      const saved = localStorage.getItem('mediqueue_user_token');
      return saved ? JSON.parse(saved) : INITIAL_USER_TOKEN;
    } catch {
      return INITIAL_USER_TOKEN;
    }
  });
  
  // Booking & Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [isQrPassOnly, setIsQrPassOnly] = useState(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

  // Synchronize state changes over localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mediqueue_user_token', JSON.stringify(userToken));
    } catch (e) {
      console.warn('localStorage error:', e);
    }
  }, [userToken]);

  // Set up Socket.io & BroadcastChannel listeners for real-time multi-device sync
  useEffect(() => {
    // 1. WebSocket listener for cross-device queue updates
    const handleQueueUpdate = async (event) => {
      console.log('Real-time Socket Queue Event received:', event);
      if (userToken?.tokenNumber) {
        const updated = await fetchTokenStatus(userToken.tokenNumber);
        if (updated) {
          setUserToken(updated);
        }
      }
    };

    socket.on('QUEUE_UPDATED', handleQueueUpdate);

    // 2. BroadcastChannel fallback for multi-tab sync
    let channel;
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel('mediqueue_sync_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'UPDATE_TOKEN' && event.data.payload) {
          setUserToken(event.data.payload);
        }
      };
    }

    return () => {
      socket.off('QUEUE_UPDATED', handleQueueUpdate);
      if (channel) channel.close();
    };
  }, [userToken?.tokenNumber]);

  // Broadcast token updates to all open windows/tabs
  const broadcastTokenUpdate = (newToken) => {
    setUserToken(newToken);
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const channel = new BroadcastChannel('mediqueue_sync_channel');
        channel.postMessage({ type: 'UPDATE_TOKEN', payload: newToken });
        channel.close();
      } catch (err) {
        console.warn('BroadcastChannel post error:', err);
      }
    }
  };

  // Queue advancement handler (Calls backend API & advances queue)
  const handleAdvanceQueue = async () => {
    // Call backend API for doctor-1
    const updatedDoc = await advanceQueue('doc-1');
    
    if (userToken) {
      // Refresh token status from backend
      const freshToken = await fetchTokenStatus(userToken.tokenNumber);
      if (freshToken) {
        broadcastTokenUpdate(freshToken);
        return;
      }
      
      // Fallback local update if offline
      const currentNum = parseInt(userToken.currentlyServing.split('-')[1]);
      const userNum = parseInt(userToken.tokenNumber.split('-')[1]);
      const nextNum = Math.min(currentNum + 1, userNum);
      const newPosition = Math.max(0, userNum - nextNum);

      const updated = {
        ...userToken,
        currentlyServing: `A-${nextNum}`,
        positionInQueue: newPosition,
        estimatedWaitMinutes: newPosition * 3,
        status: newPosition === 0 ? 'Your Turn Now!' : newPosition === 1 ? 'Next Up!' : 'Waiting'
      };
      broadcastTokenUpdate(updated);
    }
  };

  // Complete consultation handler
  const handleCompleteConsultation = () => {
    handleAdvanceQueue();
  };

  // Kiosk check-in scan handler
  const handleKioskScan = async () => {
    if (userToken) {
      const scanned = await kioskScanToken(userToken.tokenNumber);
      if (scanned) {
        broadcastTokenUpdate(scanned);
      } else {
        const updated = {
          ...userToken,
          status: 'Checked-in at Kiosk'
        };
        broadcastTokenUpdate(updated);
      }
    }
  };

  // Confirm booking a new token via API
  const handleConfirmBooking = async ({ doctor, patientName, isEmergency }) => {
    const finalPatientName = patientName || currentUser?.name || 'Alex Morgan';
    const booked = await bookToken({
      doctorId: doctor?.id || 'doc-1',
      patientName: finalPatientName,
      isEmergency: !!isEmergency
    });

    if (booked) {
      broadcastTokenUpdate(booked);
    } else {
      // Fallback offline generator
      const randomTokenNum = `A-${Math.floor(115 + Math.random() * 20)}`;
      const newToken = {
        tokenNumber: randomTokenNum,
        patientName: finalPatientName,
        doctorName: doctor?.name || 'Dr. Rajesh Kumar',
        specialty: doctor?.specialty || 'General Medicine',
        room: doctor?.room || 'Room 102',
        department: doctor?.specialty || 'General Medicine',
        bookingTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        currentlyServing: 'A-108',
        positionInQueue: isEmergency ? 1 : 5,
        estimatedWaitMinutes: isEmergency ? 3 : 15,
        aiConfidenceScore: '96% High Accuracy',
        aiFactors: [isEmergency ? 'Emergency Express Priority' : 'Regular Booking', 'Avg 5 min/patient'],
        status: isEmergency ? 'Express Queue' : 'Waiting',
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=MEDIQUEUE-${randomTokenNum}-${encodeURIComponent(finalPatientName)}`
      };
      broadcastTokenUpdate(newToken);
    }
    setIsBookingModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-teal-500 selection:text-white">
      
      {/* Global Navbar */}
      <Navbar 
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        onOpenWorkflowModal={() => setIsWorkflowModalOpen(true)}
        onOpenPhoneModal={() => setIsPhoneModalOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Responsive Body Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 pt-4 pb-12">
        
        {/* View Switching Logic */}
        {activeMode === 'patient' ? (
          <div>
            {/* Mobile / Desktop Secondary Tab Bar */}
            <div className="flex items-center gap-2 mb-6 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800 max-w-md">
              <button
                onClick={() => setPatientTab('queue')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  patientTab === 'queue'
                    ? 'bg-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Live Queue & Doctors</span>
              </button>

              <button
                onClick={() => setPatientTab('health')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  patientTab === 'health'
                    ? 'bg-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Health Hub</span>
              </button>
            </div>

            {patientTab === 'queue' ? (
              <PatientView 
                activeToken={userToken}
                onOpenBookingModal={(doctor) => {
                  setSelectedDoctorForBooking(doctor);
                  setIsQrPassOnly(false);
                  setIsBookingModalOpen(true);
                }}
                onViewQrPass={() => {
                  setIsQrPassOnly(true);
                  setIsBookingModalOpen(true);
                }}
                onSimulateNextToken={handleAdvanceQueue}
              />
            ) : (
              <HealthHub 
                onOpenEmergencyModal={() => {
                  setSelectedDoctorForBooking(MOCK_DOCTORS[0]);
                  setIsQrPassOnly(false);
                  setIsBookingModalOpen(true);
                }}
              />
            )}
          </div>
        ) : activeMode === 'kiosk' ? (
          /* Public Display Kiosk Board View */
          <KioskDisplayView 
            activeToken={userToken}
            onSimulateNextToken={handleAdvanceQueue}
          />
        ) : (
          /* Doctor / Hospital Admin View */
          <DoctorAdminView 
            currentDoctorState={MOCK_DOCTORS[0]}
            onCallNextPatient={handleAdvanceQueue}
            onCompleteConsultation={handleCompleteConsultation}
            onSimulateKioskScan={handleKioskScan}
            activeToken={userToken}
          />
        )}

      </main>

      {/* Booking & Digital QR Pass Modal */}
      <TokenModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        doctor={selectedDoctorForBooking}
        onConfirmBooking={handleConfirmBooking}
        activeToken={userToken}
        viewPassOnly={isQrPassOnly}
      />

      {/* Architecture & Workflow Diagram Explainer Modal */}
      <WorkflowExplainerModal 
        isOpen={isWorkflowModalOpen}
        onClose={() => setIsWorkflowModalOpen(false)}
      />

      {/* Scannable Mobile Connection QR Modal */}
      <PhoneConnectModal 
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
      />

      {/* User Authentication & Role Switching Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          // If logged in user is doctor, switch to doctor mode automatically
          if (user?.role === 'doctor') {
            setActiveMode('doctor');
          }
        }}
      />

      {/* Bottom Sticky Mobile Navbar for Quick Token Pass Access */}
      {userToken && activeMode === 'patient' && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 p-3 sm:hidden">
          <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 font-mono font-bold flex items-center justify-center text-sm border border-teal-500/30">
                {userToken.tokenNumber}
              </div>
              <div>
                <p className="text-xs font-bold text-white">{userToken.doctorName}</p>
                <p className="text-[10px] text-teal-400 font-medium">Est Wait: ~{userToken.estimatedWaitMinutes}m ({userToken.positionInQueue} ahead)</p>
              </div>
            </div>

            <button
              onClick={() => {
                setIsQrPassOnly(true);
                setIsBookingModalOpen(true);
              }}
              className="py-1.5 px-3 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Pass</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
