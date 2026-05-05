# API Integration Guide

This document describes how the frontend integrates with the Spring Boot backend API.

## Overview

The frontend communicates with the backend through RESTful API endpoints. All API calls are managed through:
- **API Service**: `services/api.ts` - Centralized API client
- **Axios**: HTTP client with request/response interceptors
- **Token Management**: Automatic token refresh and error handling

## API Service Architecture

### Request Flow
```
React Component
    ↓
Zustand Store Action
    ↓
API Service Method
    ↓
Axios Request Interceptor (Add Auth Token)
    ↓
HTTP Request
    ↓
Backend API
    ↓
Axios Response Interceptor (Handle 401, Refresh Token)
    ↓
Return Data to Store
    ↓
Update Component State
```

### Token Management

The API service automatically handles JWT token management:

1. **On Login**
   - Backend returns `accessToken` and `refreshToken`
   - Tokens stored in HTTP-only cookies
   - `Cookie.set('accessToken', token)`

2. **On Each Request**
   - Request interceptor adds token to Authorization header
   - `Authorization: Bearer {accessToken}`

3. **On 401 Response**
   - Response interceptor detects 401 error
   - Automatically calls `/api/auth/refresh` endpoint
   - Gets new `accessToken` from refresh endpoint
   - Retries original request with new token

4. **On Invalid Refresh Token**
   - Clears both tokens from cookies
   - Redirects user to `/login`

## Request Structure

### POST Request Example
```typescript
// In a component or store action
const response = await apiService.bookAppointment({
  doctorId: '123',
  appointmentDate: '2024-05-15',
  appointmentTime: '10:00 AM',
  symptoms: 'Headache',
  consultationType: 'ONLINE'
});
```

### Behind the Scenes
```
Request Headers:
  Content-Type: application/json
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Request Body:
  {
    "doctorId": "123",
    "appointmentDate": "2024-05-15",
    "appointmentTime": "10:00 AM",
    "symptoms": "Headache",
    "consultationType": "ONLINE"
  }

Response:
  {
    "status": "SUCCESS",
    "message": "Appointment booked successfully",
    "data": {
      "id": "apt-001",
      "status": "SCHEDULED",
      ...
    }
  }
```

## Error Handling

### API Error Response Format
```typescript
{
  "status": "ERROR",
  "message": "User not found",
  "data": null,
  "errorCode": "USER_NOT_FOUND"
}
```

### Frontend Error Handling
```typescript
try {
  await apiService.login(email, password);
} catch (error: any) {
  const errorMessage = error.response?.data?.message || 'Login failed';
  toast({
    title: 'Error',
    description: errorMessage,
    variant: 'destructive'
  });
}
```

### Common Error Codes
| Code | Meaning | Action |
|------|---------|--------|
| 400 | Bad Request | Show validation errors |
| 401 | Unauthorized | Redirect to login |
| 403 | Forbidden | Show permission denied |
| 404 | Not Found | Show item not found |
| 500 | Server Error | Show generic error |

## Authentication Flow

### Login Process
```
1. User enters email/password
2. Component calls useAuthStore.login(email, password)
3. API calls POST /api/auth/login
4. Backend validates and returns accessToken + refreshToken
5. Tokens stored in cookies
6. User redirected to /dashboard
7. All subsequent requests include accessToken
```

### Logout Process
```
1. User clicks logout button
2. Component calls useAuthStore.logout()
3. API calls POST /api/auth/logout (with token)
4. Tokens removed from cookies
5. User redirected to home page
```

### Token Refresh Process (Automatic)
```
1. Request made with accessToken
2. Backend returns 401 (token expired)
3. Response interceptor detects 401
4. API calls POST /api/auth/refresh with refreshToken
5. Backend returns new accessToken
6. Original request retried with new token
7. If refresh fails, user redirected to login
```

## API Endpoints Reference

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "User registered successfully",
  "data": {
    "id": "user-001",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "PATIENT"
  }
}
```

#### POST /api/auth/login
Authenticate user with email and password.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-001",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "PATIENT"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### POST /api/auth/refresh
Refresh expired access token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### POST /api/auth/logout
Logout user and invalidate tokens.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Logged out successfully"
}
```

### Doctor Endpoints

#### GET /api/doctors/search
Search doctors with optional filters.

**Query Parameters:**
```
specialization?=Cardiology
minRating?=4
page?=1
limit?=10
```

**Response:**
```json
{
  "status": "SUCCESS",
  "data": {
    "doctors": [
      {
        "id": "doc-001",
        "fullName": "Dr. Smith",
        "specialization": "Cardiology",
        "qualification": "MD, Board Certified",
        "yearsOfExperience": 10,
        "consultationFee": 50,
        "rating": 4.8,
        "isAvailable": true
      }
    ],
    "totalDoctors": 1,
    "page": 1
  }
}
```

#### GET /api/doctors/{doctorId}
Get detailed information about a specific doctor.

**Response:**
```json
{
  "status": "SUCCESS",
  "data": {
    "id": "doc-001",
    "fullName": "Dr. Smith",
    "specialization": "Cardiology",
    "qualification": "MD, Board Certified",
    "yearsOfExperience": 10,
    "consultationFee": 50,
    "profilePicture": "url",
    "bio": "Experienced cardiologist...",
    "rating": 4.8,
    "isAvailable": true
  }
}
```

#### GET /api/doctors/{doctorId}/available-slots
Get available time slots for a doctor on a specific date.

**Query Parameters:**
```
date=2024-05-15
```

**Response:**
```json
{
  "status": "SUCCESS",
  "data": [
    {
      "id": "slot-001",
      "startTime": "09:00 AM",
      "endTime": "09:30 AM",
      "isAvailable": true
    },
    {
      "id": "slot-002",
      "startTime": "10:00 AM",
      "endTime": "10:30 AM",
      "isAvailable": false
    }
  ]
}
```

#### GET /api/doctors/{doctorId}/reviews
Get reviews for a doctor.

**Response:**
```json
{
  "status": "SUCCESS",
  "data": [
    {
      "id": "review-001",
      "rating": 5,
      "comment": "Excellent doctor!",
      "patientName": "John Doe",
      "date": "2024-04-15"
    }
  ]
}
```

### Appointment Endpoints

#### POST /api/appointments/book
Book a new appointment.

**Request:**
```json
{
  "doctorId": "doc-001",
  "appointmentDate": "2024-05-15",
  "appointmentTime": "10:00 AM",
  "symptoms": "Chest pain",
  "consultationType": "ONLINE"
}
```

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Appointment booked successfully",
  "data": {
    "id": "apt-001",
    "doctorId": "doc-001",
    "appointmentDate": "2024-05-15",
    "appointmentTime": "10:00 AM",
    "status": "SCHEDULED",
    "symptoms": "Chest pain",
    "consultationType": "ONLINE"
  }
}
```

#### GET /api/appointments
Get all appointments for the logged-in user.

**Response:**
```json
{
  "status": "SUCCESS",
  "data": [
    {
      "id": "apt-001",
      "doctorId": "doc-001",
      "appointmentDate": "2024-05-15",
      "appointmentTime": "10:00 AM",
      "status": "SCHEDULED",
      "consultationType": "ONLINE"
    }
  ]
}
```

#### GET /api/appointments/{appointmentId}
Get details of a specific appointment.

**Response:**
```json
{
  "status": "SUCCESS",
  "data": {
    "id": "apt-001",
    "doctorId": "doc-001",
    "doctorName": "Dr. Smith",
    "appointmentDate": "2024-05-15",
    "appointmentTime": "10:00 AM",
    "status": "SCHEDULED",
    "symptoms": "Chest pain",
    "consultationType": "ONLINE",
    "paymentStatus": "PENDING",
    "notes": null
  }
}
```

#### PUT /api/appointments/{appointmentId}/cancel
Cancel an appointment.

**Request:**
```json
{
  "reason": "Unable to attend"
}
```

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Appointment cancelled successfully",
  "data": {
    "id": "apt-001",
    "status": "CANCELLED"
  }
}
```

#### PUT /api/appointments/{appointmentId}/reschedule
Reschedule an appointment.

**Request:**
```json
{
  "newDate": "2024-05-20",
  "newSlot": "02:00 PM"
}
```

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Appointment rescheduled successfully",
  "data": {
    "id": "apt-001",
    "appointmentDate": "2024-05-20",
    "appointmentTime": "02:00 PM"
  }
}
```

#### POST /api/appointments/{appointmentId}/review
Submit a review for a completed appointment.

**Request:**
```json
{
  "rating": 5,
  "comment": "Excellent service!"
}
```

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Review submitted successfully"
}
```

### User Endpoints

#### GET /api/users/profile
Get current user's profile information.

**Response:**
```json
{
  "status": "SUCCESS",
  "data": {
    "id": "user-001",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "address": "123 Main St",
    "dateOfBirth": "1990-01-15",
    "role": "PATIENT"
  }
}
```

#### PUT /api/users/profile
Update user profile information.

**Request:**
```json
{
  "fullName": "John Doe",
  "phoneNumber": "+1234567890",
  "address": "123 Main St",
  "dateOfBirth": "1990-01-15"
}
```

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Profile updated successfully",
  "data": {
    "id": "user-001",
    "fullName": "John Doe",
    "phoneNumber": "+1234567890",
    "address": "123 Main St",
    "dateOfBirth": "1990-01-15"
  }
}
```

#### GET /api/users/medical-records
Get user's medical records.

**Response:**
```json
{
  "status": "SUCCESS",
  "data": [
    {
      "id": "record-001",
      "title": "Blood Test Report",
      "description": "Annual checkup results",
      "recordType": "LAB_TEST",
      "documentUrl": "url",
      "createdAt": "2024-04-10"
    }
  ]
}
```

#### POST /api/users/medical-records
Add a new medical record.

**Request:**
```json
{
  "title": "Blood Test Report",
  "description": "Annual checkup results",
  "recordType": "LAB_TEST"
}
```

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Medical record added successfully",
  "data": {
    "id": "record-001",
    "title": "Blood Test Report",
    "recordType": "LAB_TEST"
  }
}
```

### Admin Endpoints

#### GET /api/admin/dashboard
Get admin dashboard statistics.

**Response:**
```json
{
  "status": "SUCCESS",
  "data": {
    "totalUsers": 150,
    "totalAppointments": 500,
    "totalRevenue": 25000,
    "completionRate": 92
  }
}
```

#### GET /api/admin/users
Get paginated list of all users.

**Query Parameters:**
```
page=1
limit=10
```

**Response:**
```json
{
  "status": "SUCCESS",
  "data": {
    "users": [...],
    "totalUsers": 150,
    "page": 1,
    "limit": 10
  }
}
```

#### GET /api/admin/doctors
Get paginated list of all doctors.

**Query Parameters:**
```
page=1
limit=10
```

## Using the API Service

### Example: In a React Component

```typescript
'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';

export function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await apiService.searchDoctors({
          specialization: 'Cardiology',
          page: 1,
          limit: 10
        });
        setDoctors(response.data.doctors);
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {doctors.map(doctor => (
        <div key={doctor.id}>{doctor.fullName}</div>
      ))}
    </div>
  );
}
```

### Example: Using Zustand Store

```typescript
import { useDoctorStore } from '@/stores/doctorStore';

export function DoctorSearch() {
  const { doctors, searchDoctors, isLoading } = useDoctorStore();

  const handleSearch = () => {
    searchDoctors({
      specialization: 'Cardiology',
      minRating: 4
    });
  };

  return (
    <div>
      <button onClick={handleSearch}>Search</button>
      {isLoading && <p>Loading...</p>}
      {doctors.map(doctor => (
        <div key={doctor.id}>{doctor.fullName}</div>
      ))}
    </div>
  );
}
```

## Debugging API Issues

### Check Request/Response in DevTools
1. Open browser DevTools → Network tab
2. Look for your API call
3. Check:
   - Request headers (Authorization header present?)
   - Request body (correct data?)
   - Response status (200, 401, 500?)
   - Response body (error message?)

### Common Issues

**Issue: 401 Unauthorized**
- Solution: Check token is being sent in Authorization header
- Check token hasn't expired
- Check backend is returning refresh token correctly

**Issue: CORS Error**
- Solution: Backend needs CORS configured for localhost:3000
- Add to Spring Boot: `@CrossOrigin(origins = "http://localhost:3000")`

**Issue: 400 Bad Request**
- Solution: Check request body matches API spec
- Validate all required fields are included
- Check date/time formats

**Issue: 500 Server Error**
- Solution: Check backend logs
- Verify database connection
- Check SQL queries for errors

## Best Practices

1. **Always use try-catch** for API calls
2. **Show loading states** while fetching data
3. **Handle errors gracefully** with user-friendly messages
4. **Use TypeScript** for type safety
5. **Keep API URLs centralized** in ApiService
6. **Use Zustand stores** for shared state
7. **Test API integration** thoroughly before deployment
