# MedBook Frontend - Setup Guide

## Quick Start

### Prerequisites
- Node.js 18+ and pnpm installed
- Backend Spring Boot API running on http://localhost:8080

### Installation Steps

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Configure Environment**
   - The `.env.local` file is already configured for local development
   - If your backend is on a different URL, update `NEXT_PUBLIC_API_BASE_URL` in `.env.local`

3. **Start Development Server**
   ```bash
   pnpm dev
   ```
   - Application will be available at http://localhost:3000

### Project Structure Overview

```
app/                          # Next.js App Router pages
├── (auth)                     # Authentication routes
│   ├── login/
│   ├── register/
│   └── ...
├── admin/                     # Admin dashboard pages
├── appointments/              # Appointment management
├── doctors/                   # Doctor listing and booking
├── medical-records/           # Medical records management
├── profile/                   # User profile
└── dashboard/                 # User dashboard

components/
├── layout/
│   └── Navbar.tsx            # Navigation component
├── providers/
│   ├── AuthProvider.tsx      # Auth context setup
│   └── ToastProvider.tsx     # Toast notifications setup
└── ui/                        # shadcn/ui components

services/
└── api.ts                    # API client with Axios

stores/
├── authStore.ts              # User auth state (Zustand)
├── appointmentStore.ts       # Appointments state
└── doctorStore.ts            # Doctors state
```

## Key Features Implemented

### ✅ User Authentication
- Register new account
- Login with email/password
- Automatic token refresh
- Logout functionality

### ✅ Doctor Management
- Search doctors by specialization
- Filter by minimum rating
- View doctor profile and details
- See available time slots

### ✅ Appointment Booking
- Multi-step booking process
- Select date and time slot
- Add symptoms/reason for visit
- Choose consultation type (Online/In-Person)

### ✅ Appointment Management
- View all appointments
- View appointment details
- Reschedule appointments
- Cancel appointments with reason
- Leave reviews for completed appointments

### ✅ User Profile
- View and edit personal information
- Update phone number, address, DOB
- Access medical records
- View account status

### ✅ Medical Records
- Add medical records
- Store documents and reports
- Organize by record type
- Download records

### ✅ Admin Dashboard
- View key statistics
- Manage users
- Manage doctors (activate/deactivate)
- View all appointments
- Filter appointments by status

## API Integration Points

The application connects to your Spring Boot backend through these main endpoints:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Doctors
- `GET /api/doctors/search?specialization=&minRating=&page=&limit=` - Search doctors
- `GET /api/doctors/{doctorId}` - Get doctor details
- `GET /api/doctors/{doctorId}/available-slots?date=` - Get available time slots
- `GET /api/doctors/{doctorId}/reviews` - Get doctor reviews

### Appointments
- `POST /api/appointments/book` - Book new appointment
- `GET /api/appointments` - Get user's appointments
- `GET /api/appointments/{appointmentId}` - Get appointment details
- `PUT /api/appointments/{appointmentId}/cancel` - Cancel appointment
- `PUT /api/appointments/{appointmentId}/reschedule` - Reschedule appointment
- `POST /api/appointments/{appointmentId}/review` - Submit review

### User
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/medical-records` - Get medical records
- `POST /api/users/medical-records` - Add medical record

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/users?page=&limit=` - Get all users
- `GET /api/admin/doctors?page=&limit=` - Get all doctors
- `PUT /api/admin/doctors/{doctorId}/status` - Update doctor availability
- `GET /api/admin/appointments?page=&limit=&status=` - Get all appointments
- `GET /api/admin/statistics` - Get detailed statistics

## State Management (Zustand)

### AuthStore
```typescript
import { useAuthStore } from '@/stores/authStore';

const { user, isAuthenticated, login, logout, register } = useAuthStore();
```

### AppointmentStore
```typescript
import { useAppointmentStore } from '@/stores/appointmentStore';

const { 
  appointments, 
  bookAppointment, 
  cancelAppointment,
  rescheduleAppointment 
} = useAppointmentStore();
```

### DoctorStore
```typescript
import { useDoctorStore } from '@/stores/doctorStore';

const { 
  doctors, 
  searchDoctors, 
  getAvailableSlots 
} = useDoctorStore();
```

## Styling & Components

### Color System
- **Primary**: Blue (#2563EB)
- **Success**: Green
- **Error**: Red
- **Neutral**: Gray shades

### UI Framework
- shadcn/ui components with Tailwind CSS
- Responsive design (mobile-first)
- Lucide React icons

### Available Components
- Button, Card, Input, Select
- Toast notifications
- Modal/Dialog support (easily added)
- Form components with validation

## Development Workflow

### Adding New Features

1. **Create API Method** in `services/api.ts`
   ```typescript
   async newFeature(data: any) {
     const response = await this.client.post('/api/endpoint', data);
     return response.data;
   }
   ```

2. **Create Zustand Store** (if needed)
   ```typescript
   // stores/featureStore.ts
   export const useFeatureStore = create((set) => ({
     // state and actions
   }));
   ```

3. **Create Components**
   ```typescript
   // components/FeatureComponent.tsx
   export function FeatureComponent() {
     const { data, fetchData } = useFeatureStore();
     // render UI
   }
   ```

4. **Create Page** (if new route needed)
   ```typescript
   // app/feature/page.tsx
   export default function FeaturePage() {
     // render page
   }
   ```

### Testing API Integration

1. Ensure backend is running on http://localhost:8080
2. Check browser console for API errors
3. Use browser DevTools Network tab to inspect requests
4. Verify token is included in Authorization header

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
kill -9 $(lsof -ti:3000)
```

### Backend Connection Issues
- Ensure backend is running on http://localhost:8080
- Check `.env.local` has correct `NEXT_PUBLIC_API_BASE_URL`
- Check browser console for CORS errors
- Backend may need CORS configuration for localhost:3000

### Build Errors
```bash
# Clear Next.js cache and rebuild
rm -rf .next
pnpm build
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Deployment

### Build for Production
```bash
pnpm build
pnpm start
```

### Environment Variables for Production
Update `.env.local` with production API URL before deploying:
```
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
```

### Deploy to Vercel
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

## Next Steps

1. **Integrate with your backend** - Update API endpoints in `services/api.ts`
2. **Test all features** - Register, search doctors, book appointments
3. **Customize branding** - Update colors and logo in components
4. **Add more features** - Payments, notifications, video consultations
5. **Performance optimization** - Add code splitting, image optimization
6. **Testing** - Add unit and integration tests

## Support Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Axios Documentation](https://axios-http.com/docs)
