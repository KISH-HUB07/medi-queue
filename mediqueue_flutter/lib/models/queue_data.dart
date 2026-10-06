class HospitalBranch {
  final String id;
  final String name;
  final String address;
  final String distance;

  HospitalBranch({
    required this.id,
    required this.name,
    required this.address,
    required this.distance,
  });

  factory HospitalBranch.fromJson(Map<String, dynamic> json) {
    return HospitalBranch(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      address: json['address'] ?? '',
      distance: json['distance'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'address': address,
    'distance': distance,
  };
}

class Doctor {
  final String id;
  final String name;
  final String specialty;
  final String deptId;
  final String room;
  final double rating;
  final String experience;
  final String status;
  final String currentToken;
  final int queueLength;
  final int avgConsultTimeMinutes;

  Doctor({
    required this.id,
    required this.name,
    required this.specialty,
    required this.deptId,
    required this.room,
    required this.rating,
    required this.experience,
    required this.status,
    required this.currentToken,
    required this.queueLength,
    required this.avgConsultTimeMinutes,
  });

  factory Doctor.fromJson(Map<String, dynamic> json) {
    return Doctor(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      specialty: json['specialty'] ?? '',
      deptId: json['deptId'] ?? '',
      room: json['room'] ?? '',
      rating: (json['rating'] != null) ? (json['rating'] as num).toDouble() : 5.0,
      experience: json['experience'] ?? '',
      status: json['status'] ?? 'In Room',
      currentToken: json['currentToken'] ?? 'A-101',
      queueLength: (json['queueLength'] != null) ? (json['queueLength'] as num).toInt() : 0,
      avgConsultTimeMinutes: (json['avgConsultTimeMinutes'] != null) ? (json['avgConsultTimeMinutes'] as num).toInt() : 7,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'specialty': specialty,
    'deptId': deptId,
    'room': room,
    'rating': rating,
    'experience': experience,
    'status': status,
    'currentToken': currentToken,
    'queueLength': queueLength,
    'avgConsultTimeMinutes': avgConsultTimeMinutes,
  };
}

class UserToken {
  final String tokenNumber;
  final String patientName;
  final String doctorName;
  final String specialty;
  final String room;
  final String department;
  final String bookingTime;
  final String currentlyServing;
  final int positionInQueue;
  final int estimatedWaitMinutes;
  final String aiConfidenceScore;
  final List<String> aiFactors;
  final String status;
  final String qrCodeUrl;

  UserToken({
    required this.tokenNumber,
    required this.patientName,
    required this.doctorName,
    required this.specialty,
    required this.room,
    required this.department,
    required this.bookingTime,
    required this.currentlyServing,
    required this.positionInQueue,
    required this.estimatedWaitMinutes,
    required this.aiConfidenceScore,
    required this.aiFactors,
    required this.status,
    this.qrCodeUrl = '',
  });

  factory UserToken.fromJson(Map<String, dynamic> json) {
    List<String> parsedFactors = [];
    if (json['aiFactors'] is List) {
      parsedFactors = (json['aiFactors'] as List).map((e) => e.toString()).toList();
    } else if (json['aiFactors'] is String) {
      parsedFactors = [json['aiFactors'].toString()];
    }

    return UserToken(
      tokenNumber: json['tokenNumber'] ?? 'A-100',
      patientName: json['patientName'] ?? 'Alex Morgan',
      doctorName: json['doctorName'] ?? 'Dr. Rajesh Kumar',
      specialty: json['specialty'] ?? 'General Medicine',
      room: json['room'] ?? 'Room 102',
      department: json['department'] ?? 'General Medicine',
      bookingTime: json['bookingTime'] ?? '',
      currentlyServing: json['currentlyServing'] ?? 'A-100',
      positionInQueue: (json['positionInQueue'] != null) ? (json['positionInQueue'] as num).toInt() : 0,
      estimatedWaitMinutes: (json['estimatedWaitMinutes'] != null) ? (json['estimatedWaitMinutes'] as num).toInt() : 0,
      aiConfidenceScore: json['aiConfidenceScore'] ?? '95% Accurate',
      aiFactors: parsedFactors,
      status: json['status'] ?? 'Waiting',
      qrCodeUrl: json['qrCodeUrl'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'tokenNumber': tokenNumber,
    'patientName': patientName,
    'doctorName': doctorName,
    'specialty': specialty,
    'room': room,
    'department': department,
    'bookingTime': bookingTime,
    'currentlyServing': currentlyServing,
    'positionInQueue': positionInQueue,
    'estimatedWaitMinutes': estimatedWaitMinutes,
    'aiConfidenceScore': aiConfidenceScore,
    'aiFactors': aiFactors,
    'status': status,
    'qrCodeUrl': qrCodeUrl,
  };

  UserToken copyWith({
    String? currentlyServing,
    int? positionInQueue,
    int? estimatedWaitMinutes,
    String? status,
  }) {
    return UserToken(
      tokenNumber: tokenNumber,
      patientName: patientName,
      doctorName: doctorName,
      specialty: specialty,
      room: room,
      department: department,
      bookingTime: bookingTime,
      currentlyServing: currentlyServing ?? this.currentlyServing,
      positionInQueue: positionInQueue ?? this.positionInQueue,
      estimatedWaitMinutes: estimatedWaitMinutes ?? this.estimatedWaitMinutes,
      aiConfidenceScore: aiConfidenceScore,
      aiFactors: aiFactors,
      status: status ?? this.status,
      qrCodeUrl: qrCodeUrl,
    );
  }
}

final mockBranches = [
  HospitalBranch(id: 'h1', name: 'Apollo City Hospital - Main Campus', address: 'Greams Road, Chennai', distance: '1.2 km'),
  HospitalBranch(id: 'h2', name: 'Fortis Multi-Speciality Clinic', address: 'Anna Nagar, Chennai', distance: '3.4 km'),
  HospitalBranch(id: 'h3', name: 'CIT Health Center & Research', address: 'Kundrathur, Chennai', distance: '0.8 km'),
];

final mockDoctors = [
  Doctor(
    id: 'doc-1',
    name: 'Dr. Rajesh Kumar',
    specialty: 'General Medicine',
    deptId: 'general',
    room: 'Room 102 - Block A',
    rating: 4.9,
    experience: '14 yrs',
    status: 'In Room',
    currentToken: 'A-108',
    queueLength: 4,
    avgConsultTimeMinutes: 7,
  ),
  Doctor(
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
  ),
  Doctor(
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
  ),
];

final initialToken = UserToken(
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
  qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=MEDIQUEUE-A112-ALEX',
);
