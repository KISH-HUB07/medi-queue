import 'dart:async';
import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'models/queue_data.dart';
import 'services/api_service.dart';

void main() {
  runApp(const MediQueueApp());
}

class MediQueueApp extends StatelessWidget {
  const MediQueueApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MediQueue',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF020617), // slate-950
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF0D9488), // teal-600
          secondary: Color(0xFF06B6D4), // cyan-500
          surface: Color(0xFF0F172A), // slate-900
        ),
        useMaterial3: true,
      ),
      home: const MainHomeScreen(),
    );
  }
}

class MainHomeScreen extends StatefulWidget {
  const MainHomeScreen({super.key});

  @override
  State<MainHomeScreen> createState() => _MainHomeScreenState();
}

class _MainHomeScreenState extends State<MainHomeScreen> {
  int _currentModeIndex = 0; // 0: Patient, 1: Kiosk, 2: Doctor
  UserToken _activeToken = initialToken;
  List<Doctor> _doctors = mockDoctors;
  bool _isLoading = false;
  Timer? _syncTimer;

  @override
  void initState() {
    super.initState();
    _loadInitialData();
    // Start periodic background sync with Express/SQLite backend
    _syncTimer = Timer.periodic(const Duration(seconds: 4), (_) => _syncQueueState());
  }

  @override
  void dispose() {
    _syncTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadInitialData() async {
    setState(() => _isLoading = true);
    final docs = await ApiService.getDoctors();
    final freshToken = await ApiService.getTokenStatus(_activeToken.tokenNumber);
    setState(() {
      _doctors = docs;
      if (freshToken != null) {
        _activeToken = freshToken;
      }
      _isLoading = false;
    });
  }

  Future<void> _syncQueueState() async {
    final freshToken = await ApiService.getTokenStatus(_activeToken.tokenNumber);
    final docs = await ApiService.getDoctors();
    if (mounted) {
      setState(() {
        _doctors = docs;
        if (freshToken != null) {
          _activeToken = freshToken;
        }
      });
    }
  }

  // Advance Doctor Queue via Backend API
  Future<void> _advanceQueue() async {
    setState(() => _isLoading = true);
    await ApiService.advanceQueue('doc-1');
    final freshToken = await ApiService.getTokenStatus(_activeToken.tokenNumber);
    final docs = await ApiService.getDoctors();

    setState(() {
      _doctors = docs;
      if (freshToken != null) {
        _activeToken = freshToken;
      } else {
        // Fallback local calculation
        int currentNum = int.parse(_activeToken.currentlyServing.split('-')[1]);
        int userNum = int.parse(_activeToken.tokenNumber.split('-')[1]);
        int nextNum = (currentNum + 1).clamp(0, userNum);
        int newPos = (userNum - nextNum).clamp(0, 999);

        _activeToken = _activeToken.copyWith(
          currentlyServing: 'A-$nextNum',
          positionInQueue: newPos,
          estimatedWaitMinutes: newPos * 3,
          status: newPos == 0 ? 'Your Turn Now!' : newPos == 1 ? 'Next Up!' : 'Waiting',
        );
      }
      _isLoading = false;
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Doctor called next token! Serving ${_activeToken.currentlyServing}'),
          backgroundColor: const Color(0xFF0D9488),
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

  // Complete consultation / RFID tap
  Future<void> _completeConsultation() async {
    await _advanceQueue();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('💳 Doctor RFID Tap validated. Consultation completed.'),
          backgroundColor: Color(0xFF14B8A6),
        ),
      );
    }
  }

  // Kiosk Check-In Scan Simulation
  Future<void> _simulateKioskCheckIn() async {
    setState(() => _isLoading = true);
    final updated = await ApiService.kioskScanToken(_activeToken.tokenNumber);
    setState(() {
      if (updated != null) {
        _activeToken = updated;
      } else {
        _activeToken = _activeToken.copyWith(status: 'Checked-in at Kiosk');
      }
      _isLoading = false;
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Token ${_activeToken.tokenNumber} verified & checked in at kiosk!'),
          backgroundColor: const Color(0xFF0D9488),
        ),
      );
    }
  }

  // Show Booking Dialog to create token on real backend
  void _showBookingDialog(Doctor doc) {
    final nameController = TextEditingController(text: 'Alex Morgan');
    bool isEmergency = false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          backgroundColor: const Color(0xFF0F172A),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: Row(
            children: [
              const Icon(Icons.calendar_month, color: Color(0xFF14B8A6)),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Book with ${doc.name}',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAlignment.start,
            children: [
              Text('${doc.specialty} • ${doc.room}', style: const TextStyle(fontSize: 12, color: Color(0xFF2DD4BF))),
              const SizedBox(height: 16),
              const Text('Patient Name', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white70)),
              const SizedBox(height: 6),
              TextField(
                controller: nameController,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  filled: true,
                  fillColor: const Color(0xFF020617),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.white12)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF14B8A6))),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
              ),
              const SizedBox(height: 12),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Emergency Express Priority', style: TextStyle(fontSize: 12, color: Colors.white)),
                value: isEmergency,
                activeColor: const Color(0xFF14B8A6),
                onChanged: (val) => setDialogState(() => isEmergency = val),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF14B8A6),
                foregroundColor: Colors.black,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () async {
                Navigator.pop(ctx);
                setState(() => _isLoading = true);
                final newToken = await ApiService.bookToken(
                  doctorId: doc.id,
                  patientName: nameController.text.trim(),
                  isEmergency: isEmergency,
                );

                setState(() {
                  if (newToken != null) {
                    _activeToken = newToken;
                  }
                  _isLoading = false;
                });

                if (mounted) {
                  _showQrPassModal();
                }
              },
              child: const Text('Confirm Booking', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  // Show Digital QR Pass Modal Dialog
  void _showQrPassModal() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0F172A),
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 16),
            const Text('DIGITAL OPD PASS & QR CODE', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF14B8A6), letterSpacing: 1.5)),
            const SizedBox(height: 8),
            Text(_activeToken.tokenNumber, style: const TextStyle(fontSize: 44, fontWeight: FontWeight.black, color: Colors.white, fontFamily: 'monospace')),
            Text('${_activeToken.patientName} • ${_activeToken.doctorName}', style: const TextStyle(fontSize: 13, color: Colors.white70)),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
              child: QrImageView(
                data: 'MEDIQUEUE-${_activeToken.tokenNumber}-${_activeToken.patientName}',
                version: QrVersions.auto,
                size: 160.0,
              ),
            ),
            const SizedBox(height: 16),
            Text('Scan at hospital kiosk for instant check-in', style: const TextStyle(fontSize: 11, color: Colors.white54)),
            const SizedBox(height: 24),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF14B8A6),
                foregroundColor: Colors.black,
                minimumSize: const Size(double.infinity, 48),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Done', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFF0D9488).withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.local_hospital, color: Color(0xFF14B8A6)),
            ),
            const SizedBox(width: 10),
            RichText(
              text: const TextSpan(
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.extrabold, color: Colors.white),
                children: [
                  TextSpan(text: 'Medi'),
                  TextSpan(text: 'Queue', style: TextStyle(color: Color(0xFF14B8A6))),
                ],
              ),
            ),
          ],
        ),
        actions: [
          if (_isLoading)
            const Padding(
              padding: EdgeInsets.only(right: 16),
              child: Center(child: SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF14B8A6)))),
            )
          else
            IconButton(
              icon: const Icon(Icons.sync, color: Color(0xFF14B8A6)),
              tooltip: 'Sync Queue with Server',
              onPressed: _syncQueueState,
            ),
        ],
      ),
      body: _buildBody(),
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: const Color(0xFF0F172A),
        selectedItemColor: const Color(0xFF14B8A6),
        unselectedItemColor: Colors.slate400,
        currentIndex: _currentModeIndex,
        onTap: (index) => setState(() => _currentModeIndex = index),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Patient View'),
          BottomNavigationBarItem(icon: Icon(Icons.tv), label: 'Kiosk Board'),
          BottomNavigationBarItem(icon: Icon(Icons.medical_information), label: 'Doctor Panel'),
        ],
      ),
    );
  }

  Widget _buildBody() {
    switch (_currentModeIndex) {
      case 0:
        return _buildPatientView();
      case 1:
        return _buildKioskView();
      case 2:
        return _buildDoctorView();
      default:
        return _buildPatientView();
    }
  }

  Widget _buildPatientView() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAlignment.start,
        children: [
          // Hero Token Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0F172A), Color(0xFF134E4A), Color(0xFF0F172A)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0xFF14B8A6).withOpacity(0.4)),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF14B8A6).withOpacity(0.1),
                  blurRadius: 20,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF14B8A6).withOpacity(0.2),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFF14B8A6).withOpacity(0.5)),
                      ),
                      child: Text(
                        _activeToken.status.toUpperCase(),
                        style: const TextStyle(color: Color(0xFF5EEAD4), fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                    Text('ID: ${_activeToken.tokenNumber}', style: const TextStyle(color: Colors.slate400, fontFamily: 'monospace')),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  _activeToken.tokenNumber,
                  style: const TextStyle(fontSize: 48, fontWeight: FontWeight.black, color: Color(0xFF5EEAD4), fontFamily: 'monospace'),
                ),
                Text('Doctor: ${_activeToken.doctorName}', style: const TextStyle(fontSize: 16, color: Colors.white70)),
                Text('${_activeToken.room} • ${_activeToken.specialty}', style: const TextStyle(fontSize: 12, color: Color(0xFF2DD4BF))),
                const Divider(height: 24, color: Colors.white12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildStatCol('Serving Now', _activeToken.currentlyServing, Colors.white),
                    _buildStatCol('Patients Ahead', '${_activeToken.positionInQueue}', Colors.amber),
                    _buildStatCol('Est. Wait Time', '~${_activeToken.estimatedWaitMinutes} mins', const Color(0xFF2DD4BF)),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFF5EEAD4),
                          side: const BorderSide(color: Color(0xFF14B8A6)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: _showQrPassModal,
                        icon: const Icon(Icons.qr_code, size: 18),
                        label: const Text('Show QR Pass', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF14B8A6).withOpacity(0.2),
                        foregroundColor: const Color(0xFF5EEAD4),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: _simulateKioskCheckIn,
                      child: const Text('Check-in'),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('AVAILABLE DOCTORS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.slate400, letterSpacing: 1.2)),
              Text('Live from API (${_doctors.length})', style: const TextStyle(fontSize: 10, color: Color(0xFF14B8A6))),
            ],
          ),
          const SizedBox(height: 12),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _doctors.length,
            itemBuilder: (context, index) {
              final doc = _doctors[index];
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white10),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: const Color(0xFF14B8A6).withOpacity(0.2),
                      child: const Icon(Icons.person, color: Color(0xFF14B8A6)),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAlignment.start,
                        children: [
                          Text(doc.name, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                          Text('${doc.specialty} • ${doc.room}', style: const TextStyle(fontSize: 12, color: Colors.slate400)),
                          Text('${doc.queueLength} Patients Waiting (~${doc.queueLength * doc.avgConsultTimeMinutes}m)', style: const TextStyle(fontSize: 11, color: Color(0xFF2DD4BF))),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF14B8A6),
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () => _showBookingDialog(doc),
                      child: const Text('Book', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildKioskView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Container(
          padding: const EdgeInsets.all(32),
          decoration: BoxDecoration(
            color: const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(32),
            border: Border.all(color: const Color(0xFF14B8A6), width: 2),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('HOSPITAL OPD MAIN DISPLAY BOARD', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.slate400, letterSpacing: 1.5)),
              const SizedBox(height: 24),
              const Text('NOW SERVING TOKEN', style: TextStyle(fontSize: 14, color: Colors.white70)),
              const SizedBox(height: 8),
              Text(
                _activeToken.currentlyServing,
                style: const TextStyle(fontSize: 72, fontWeight: FontWeight.black, color: Color(0xFF2DD4BF), fontFamily: 'monospace'),
              ),
              const SizedBox(height: 12),
              Text('${_activeToken.doctorName} (${_activeToken.room})', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF14B8A6),
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                onPressed: _advanceQueue,
                icon: const Icon(Icons.volume_up),
                label: const Text('Call Next Token (Voice Chime)', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDoctorView() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white12),
            ),
            child: Row(
              children: [
                const CircleAvatar(backgroundColor: Color(0xFF14B8A6), child: Icon(Icons.medical_services, color: Colors.black)),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAlignment.start,
                  children: [
                    Text(_activeToken.doctorName, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 16)),
                    Text('${_activeToken.department} • ${_activeToken.room}', style: const TextStyle(color: Colors.slate400, fontSize: 12)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF14B8A6),
              foregroundColor: Colors.black,
              minimumSize: const Size(double.infinity, 54),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            onPressed: _advanceQueue,
            icon: const Icon(Icons.campaign),
            label: const Text('📢 Call Next Patient Token', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              foregroundColor: const Color(0xFF2DD4BF),
              side: const BorderSide(color: Color(0xFF14B8A6)),
              minimumSize: const Size(double.infinity, 48),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            onPressed: _completeConsultation,
            icon: const Icon(Icons.nfc),
            label: const Text('💳 Tap Doctor RFID (Complete Consultation)'),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCol(String label, String val, Color valColor) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 10, color: Colors.slate400)),
        const SizedBox(height: 4),
        Text(val, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: valColor)),
      ],
    );
  }
}
