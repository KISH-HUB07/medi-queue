import 'dart:convert';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;
import '../models/queue_data.dart';

class ApiService {
  // Determine appropriate host depending on platform (Android emulator vs Web/Desktop/iOS)
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:5000/api';
    }
    try {
      if (Platform.isAndroid) {
        return 'http://10.0.2.2:5000/api'; // Android Emulator host loopback
      }
    } catch (_) {}
    return 'http://localhost:5000/api';
  }

  // Fetch list of doctors
  static Future<List<Doctor>> getDoctors() async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/doctors')).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final List<dynamic> data = jsonDecode(res.body);
        return data.map((json) => Doctor.fromJson(json)).toList();
      }
    } catch (e) {
      // Fallback to local mock if server is unreachable
      print('ApiService.getDoctors error: $e');
    }
    return mockDoctors;
  }

  // Book a new token for patient
  static Future<UserToken?> bookToken({
    required String doctorId,
    required String patientName,
    bool isEmergency = false,
  }) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/tokens/book'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'doctorId': doctorId,
          'patientName': patientName,
          'isEmergency': isEmergency,
        }),
      ).timeout(const Duration(seconds: 4));

      if (res.statusCode == 200 || res.statusCode == 201) {
        final data = jsonDecode(res.body);
        return UserToken.fromJson(data);
      }
    } catch (e) {
      print('ApiService.bookToken error: $e');
    }
    return null;
  }

  // Refresh active token status
  static Future<UserToken?> getTokenStatus(String tokenNumber) async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/tokens/$tokenNumber')).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        return UserToken.fromJson(data);
      }
    } catch (e) {
      print('ApiService.getTokenStatus error: $e');
    }
    return null;
  }

  // Doctor calls next patient (advance queue)
  static Future<Doctor?> advanceQueue(String doctorId) async {
    try {
      final res = await http.post(Uri.parse('$baseUrl/doctors/$doctorId/advance')).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        return Doctor.fromJson(data);
      }
    } catch (e) {
      print('ApiService.advanceQueue error: $e');
    }
    return null;
  }

  // Kiosk scan token
  static Future<UserToken?> kioskScanToken(String tokenNumber) async {
    try {
      final res = await http.post(Uri.parse('$baseUrl/tokens/$tokenNumber/scan')).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        return UserToken.fromJson(data);
      }
    } catch (e) {
      print('ApiService.kioskScanToken error: $e');
    }
    return null;
  }
}
