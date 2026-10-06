const MOCK_HOSPITAL_BRANCHES = [
  { id: 'h1', name: 'Apollo City Hospital - Main Campus', address: 'Greams Road, Chennai', distance: '1.2 km' },
  { id: 'h2', name: 'Fortis Multi-Speciality Clinic', address: 'Anna Nagar, Chennai', distance: '3.4 km' },
  { id: 'h3', name: 'CIT Health Center & Research', address: 'Kundrathur, Chennai', distance: '0.8 km' }
];

const MOCK_DEPARTMENTS = [
  { id: 'cardio', name: 'Cardiology', icon: 'Heart', color: 'from-rose-500 to-red-600', activeDoctors: 4, avgWait: 18 },
  { id: 'peds', name: 'Pediatrics', icon: 'Baby', color: 'from-amber-500 to-orange-600', activeDoctors: 3, avgWait: 12 },
  { id: 'ortho', name: 'Orthopedics', icon: 'Activity', color: 'from-emerald-500 to-teal-600', activeDoctors: 5, avgWait: 25 },
  { id: 'general', name: 'General Medicine', icon: 'Stethoscope', color: 'from-teal-500 to-cyan-600', activeDoctors: 6, avgWait: 10 },
  { id: 'neuro', name: 'Neurology', icon: 'Brain', color: 'from-purple-500 to-indigo-600', activeDoctors: 2, avgWait: 30 },
  { id: 'derma', name: 'Dermatology', icon: 'Sparkles', color: 'from-pink-500 to-rose-500', activeDoctors: 3, avgWait: 15 },
];

let MOCK_DOCTORS = [
  {
    id: 'doc-1',
    name: 'Dr. Rajesh Kumar',
    specialty: 'General Medicine',
    deptId: 'general',
    room: 'Room 102 - Block A',
    rating: 4.9,
    experience: '14 yrs',
    status: 'In Room', // 'In Room', 'In Consultation', 'On Break'
    currentToken: 'A-108',
    queueLength: 4,
    avgConsultTimeMinutes: 7,
  },
  {
    id: 'doc-2',
    name: 'Dr. Ananya Sundaram',
    specialty: 'Cardiology',
    deptId: 'cardio',
    room: 'Room 304 - Cardio Wing',
    rating: 4.95,
    experience: '18 yrs',
    status: 'In Consultation',
    currentToken: 'C-205',
    queueLength: 6,
    avgConsultTimeMinutes: 12,
  },
  {
    id: 'doc-3',
    name: 'Dr. Vikramaditya Roy',
    specialty: 'Orthopedics',
    deptId: 'ortho',
    room: 'Room 201 - Trauma Care',
    rating: 4.8,
    experience: '11 yrs',
    status: 'In Room',
    currentToken: 'O-412',
    queueLength: 2,
    avgConsultTimeMinutes: 10,
  },
  {
    id: 'doc-4',
    name: 'Dr. Priya Sharma',
    specialty: 'Pediatrics',
    deptId: 'peds',
    room: 'Room 105 - Child Wellness',
    rating: 4.9,
    experience: '9 yrs',
    status: 'In Consultation',
    currentToken: 'P-088',
    queueLength: 5,
    avgConsultTimeMinutes: 8,
  }
];

let activeTokens = [
  {
    tokenNumber: 'A-112',
    patientName: 'Alex Morgan',
    doctorName: 'Dr. Rajesh Kumar',
    specialty: 'General Medicine',
    room: 'Room 102 - Block A',
    department: 'General Medicine',
    bookingTime: '10:15 AM',
    currentlyServing: 'A-108',
    positionInQueue: 4,
    estimatedWaitMinutes: 14,
    aiConfidenceScore: '94% Accurate',
    aiFactors: ['Peak Morning Flow', 'Avg 7 min/patient', '0 Emergency overrides'],
    status: 'Waiting',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=MEDIQUEUE-A112-ALEX'
  }
];

module.exports = {
  MOCK_HOSPITAL_BRANCHES,
  MOCK_DEPARTMENTS,
  MOCK_DOCTORS,
  activeTokens
};
