# Testing Guide - MedBook Healthcare Appointment System

## Mock Data Setup

The application now includes comprehensive mock data for testing without a backend server.

### Enable/Disable Mock Mode

Edit `.env.local`:
```
NEXT_PUBLIC_USE_MOCK_DATA=true  # Enable mock data
NEXT_PUBLIC_USE_MOCK_DATA=false # Disable and use real backend
```

When `NEXT_PUBLIC_USE_MOCK_DATA=true`, all API calls return mock data immediately without making HTTP requests.

---

## Mock Test Data

### Users
- **Test User**: 
  - Email: `user@example.com`
  - Password: Any password works in mock mode
  - Name: Nguyễn Văn Test
  - Phone: 0123456789

### Doctors (5 Mock Doctors)
1. **Dr. Nguyễn Văn A** - Cardiology (Tim Mạch) - Rating: 4.8
2. **Dr. Trần Thị B** - Dermatology (Da Liễu) - Rating: 4.9
3. **Dr. Lê Văn C** - Orthopedics (Chỉnh Hình) - Rating: 4.7
4. **Dr. Phạm Thị D** - Pediatrics (Nhi Khoa) - Rating: 4.6
5. **Dr. Hoàng Văn E** - Neurology (Thần Kinh) - Rating: 4.9

### Hospitals (3 Mock Hospitals)
1. **Bệnh viện Trung Ương** - Central Hospital
2. **Bệnh viện Da Liễu TP.HCM** - Dermatology Hospital
3. **Bệnh viện Nhi Đồng** - Children's Hospital

### Specialties (5 Specialties)
- Cardiology (Tim Mạch)
- Dermatology (Da Liễu)
- Orthopedics (Chỉnh Hình)
- Pediatrics (Nhi Khoa)
- Neurology (Thần Kinh)

### Appointments (3 Mock Appointments)
1. **Appointment 1** - Scheduled with Dr. Nguyễn Văn A on 2024-05-10 at 09:00
2. **Appointment 2** - Scheduled with Dr. Trần Thị B on 2024-05-15 at 14:30
3. **Appointment 3** - Completed with Dr. Lê Văn C on 2024-04-05 at 10:00

---

## Testing Workflows

### 1. Authentication Flow
```
1. Go to / (Home page)
2. Click "Register" or "Get Started"
3. Fill registration form:
   - Name: Any name
   - Email: Any email
   - Phone: Any phone
   - Password: Any password
4. Click "Create Account"
5. Should redirect to /dashboard
```

### 2. Doctor Search & Booking
```
1. From dashboard, click "Browse Doctors"
2. View all 5 mock doctors
3. Click on any doctor to view details
4. View available time slots
5. Select a date and time
6. Complete booking form
7. Appointment created successfully
8. View new appointment in dashboard
```

### 3. Appointment Management
```
1. Go to /appointments
2. View all 3 mock appointments
3. Click on any appointment
4. View appointment details
5. Options: Reschedule, Cancel, or Submit Feedback
6. Try rescheduling to a different date/time
7. Try canceling an appointment
8. Submit feedback/review
```

### 4. Medical Records
```
1. Go to /medical-records
2. View mock medical records
3. See diagnosis, lab results, and prescriptions
4. View attachments
```

### 5. User Profile
```
1. Go to /profile
2. View current user information
3. Edit profile details
4. Change password
5. Upload avatar
```

### 6. Admin Dashboard
```
1. Note: You need ADMIN role to access
2. Default user is USER role
3. To test admin panel:
   - Modify mockUser role: "ADMIN"
   - Access /admin
   - View statistics
   - Manage users, doctors, appointments
```

---

## Available Mock Data Endpoints

All these endpoints return mock data when `NEXT_PUBLIC_USE_MOCK_DATA=true`:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns mock token)
- `POST /api/auth/logout` - Logout

### Doctors
- `GET /api/doctors/search` - Search doctors with filters
- `GET /api/doctors/{id}` - Get doctor details
- `GET /api/doctors/{id}/available-slots` - Get available time slots
- `GET /api/specialties` - Get all specialties
- `GET /api/hospitals` - Get all hospitals
- `GET /api/hospitals/{id}` - Get hospital details

### Appointments
- `POST /api/appointments/book` - Book new appointment
- `GET /api/appointments` - Get user's appointments
- `GET /api/appointments/{id}` - Get appointment details
- `PUT /api/appointments/{id}/cancel` - Cancel appointment
- `PUT /api/appointments/{id}/reschedule` - Reschedule appointment

### User Profile
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/medical-records` - Get medical records
- `POST /api/users/medical-records` - Add medical record

---

## Testing Features Checklist

### Frontend Features
- [x] Responsive design (mobile, tablet, desktop)
- [x] Navigation and routing
- [x] Authentication (login/register)
- [x] Doctor search with filters
- [x] Doctor details and reviews
- [x] Appointment booking (multi-step form)
- [x] Appointment management (list, view, reschedule, cancel)
- [x] Medical records viewing
- [x] User profile editing
- [x] Admin dashboard (if role=ADMIN)

### UI/UX
- [x] Professional healthcare design
- [x] Color scheme (Blue/Teal/Orange)
- [x] Dark mode support
- [x] Toast notifications
- [x] Loading states
- [x] Error handling
- [x] Form validation
- [x] Accessibility

---

## Switching to Real Backend

To use your Spring Boot backend:

1. **Stop the dev server** (if running)

2. **Update .env.local**:
   ```
   NEXT_PUBLIC_USE_MOCK_DATA=false
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
   ```

3. **Ensure backend is running** on port 8080

4. **Start dev server again**:
   ```
   pnpm dev
   ```

5. **Login with real credentials** from your backend

---

## Troubleshooting

### Mock data not showing?
- Verify `NEXT_PUBLIC_USE_MOCK_DATA=true` in `.env.local`
- Restart dev server after changing env variables
- Check browser console for errors

### Backend calls instead of mock?
- Clear browser cache
- Verify env variable is set to `true`
- Check if `USE_MOCK_DATA` variable is being read

### Images not loading?
- Mock data uses Unsplash URLs
- Ensure internet connection for external images
- Or modify `mockData.ts` to use local image paths

---

## API Response Format Compatibility

All mock responses follow the same format as your Spring Boot backend:

```json
{
  "data": { /* actual data */ },
  "pagination": { /* if applicable */ },
  "error": { /* if error */ }
}
```

This ensures seamless switching between mock and real data.

---

## Next Steps

1. Test all workflows with mock data
2. Verify UI/UX is acceptable
3. Deploy to Vercel when ready
4. Connect to real Spring Boot backend
5. Run integration tests

