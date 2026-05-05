# MedBook - Healthcare Appointment Booking System

A comprehensive ReactJS frontend for a healthcare appointment booking system built with Next.js, TypeScript, Zustand, and shadcn/ui.

## Features

### User Features
- **Authentication**: User registration and login with JWT token management
- **Doctor Search & Filtering**: Search doctors by specialization and rating
- **Appointment Booking**: Multi-step appointment booking with date/time selection
- **Appointment Management**: View, reschedule, and cancel appointments
- **Medical Records**: Upload and manage medical documents
- **User Profile**: Update personal information and view account details
- **Reviews & Ratings**: Leave reviews for completed appointments
- **Payment Integration**: Track appointment payment status

### Admin Features
- **Dashboard**: View key statistics and metrics
- **User Management**: Manage patient accounts
- **Doctor Management**: Manage doctor profiles and availability
- **Appointment Management**: View and manage all appointments
- **Statistics & Analytics**: Track platform performance

## Tech Stack

- **Framework**: Next.js 15+
- **Language**: TypeScript
- **State Management**: Zustand
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Zod
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Cookie Management**: js-cookie

## Project Structure

```
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page
│   ├── login/page.tsx             # Login page
│   ├── register/page.tsx          # Registration page
│   ├── dashboard/page.tsx         # User dashboard
│   ├── doctors/
│   │   ├── page.tsx               # Doctor search
│   │   └── [id]/page.tsx          # Doctor detail & booking
│   ├── appointments/
│   │   ├── page.tsx               # Appointment list
│   │   └── [id]/page.tsx          # Appointment detail
│   ├── profile/page.tsx           # User profile
│   ├── medical-records/page.tsx   # Medical records
│   └── admin/
│       ├── page.tsx               # Admin dashboard
│       ├── users/page.tsx         # User management
│       ├── doctors/page.tsx       # Doctor management
│       └── appointments/page.tsx  # Appointment management
├── components/
│   ├── layout/
│   │   └── Navbar.tsx             # Navigation bar
│   ├── providers/
│   │   ├── AuthProvider.tsx       # Auth context provider
│   │   └── ToastProvider.tsx      # Toast notifications
│   └── ui/                        # shadcn/ui components
├── services/
│   └── api.ts                     # API service layer
├── stores/
│   ├── authStore.ts               # Authentication state
│   ├── appointmentStore.ts        # Appointment state
│   └── doctorStore.ts             # Doctor state
└── hooks/
    └── use-toast.ts               # Toast hook
```

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd medbook-frontend
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Configuration
Create a `.env.local` file based on `.env.local.example`:

```bash
cp .env.local.example .env.local
```

Update the API base URL in `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### 4. Run Development Server
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## API Integration

The frontend integrates with a Spring Boot backend API. All API calls are made through the `ApiService` class in `/services/api.ts`.

### API Endpoints Used

**Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Token refresh

**User Management**
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/medical-records` - Get medical records
- `POST /api/users/medical-records` - Add medical record

**Doctors**
- `GET /api/doctors/search` - Search doctors with filters
- `GET /api/doctors/{id}` - Get doctor details
- `GET /api/doctors/{id}/available-slots` - Get available time slots
- `GET /api/doctors/{id}/reviews` - Get doctor reviews

**Appointments**
- `POST /api/appointments/book` - Book new appointment
- `GET /api/appointments` - Get user appointments
- `GET /api/appointments/{id}` - Get appointment details
- `PUT /api/appointments/{id}/cancel` - Cancel appointment
- `PUT /api/appointments/{id}/reschedule` - Reschedule appointment
- `POST /api/appointments/{id}/review` - Submit review

**Payments**
- `POST /api/payments/initiate` - Initiate payment
- `GET /api/payments/{id}/status` - Get payment status

**Admin**
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/users` - Get all users (paginated)
- `GET /api/admin/doctors` - Get all doctors (paginated)
- `PUT /api/admin/doctors/{id}/status` - Update doctor status
- `GET /api/admin/appointments` - Get all appointments (paginated)
- `GET /api/admin/statistics` - Get detailed statistics

## State Management

### Zustand Stores

**AuthStore** (`stores/authStore.ts`)
- User authentication state
- Login/Register/Logout actions
- Token management

**AppointmentStore** (`stores/appointmentStore.ts`)
- User appointments list
- Appointment CRUD operations
- Reschedule and cancel functionality

**DoctorStore** (`stores/doctorStore.ts`)
- Doctor search results
- Selected doctor details
- Available time slots
- Doctor reviews

## API Service

The `ApiService` class in `/services/api.ts` provides:
- Request interceptors for token management
- Response interceptors for automatic token refresh
- Automatic logout on 401 errors
- Centralized error handling
- Type-safe API methods

### Usage Example

```typescript
import { apiService } from '@/services/api';

// Search doctors
const response = await apiService.searchDoctors({
  specialization: 'Cardiology',
  minRating: 4
});

// Book appointment
await apiService.bookAppointment({
  doctorId: '123',
  appointmentDate: '2024-05-15',
  appointmentTime: '10:00',
  symptoms: 'Chest pain',
  consultationType: 'ONLINE'
});
```

## Components

### Navbar Component
Navigation component with:
- Logo and branding
- Desktop and mobile responsive menus
- Authentication-based menu items
- Admin panel access for admin users
- Logout functionality

### Auth Components
- **Login Page**: Email and password login
- **Register Page**: User registration with validation
- **Auth Provider**: Checks authentication status on app load

### Dashboard Components
- Quick action cards
- Upcoming appointments list
- Completed appointments history

### Doctor Components
- Doctor search with filtering
- Doctor detail page with profile
- Time slot selection
- Booking confirmation

### Appointment Components
- Appointment list with status filtering
- Appointment detail view
- Reschedule functionality
- Cancellation with reason
- Review submission

### Admin Components
- Dashboard with statistics
- User management list
- Doctor management with activation/deactivation
- Appointment management with filtering

## Authentication Flow

1. User registers/logs in via `/login` or `/register`
2. Backend returns `accessToken` and `refreshToken`
3. Tokens stored in HTTP-only cookies
4. Axios interceptors add token to requests
5. On 401 response, automatically refresh token
6. Logout clears both tokens

## Responsive Design

The application is fully responsive with:
- Mobile-first design approach
- Breakpoints for tablet (md: 768px) and desktop (lg: 1024px)
- Touch-friendly buttons and inputs
- Mobile navigation menu with hamburger icon
- Responsive grid layouts

## Styling

- **Color Scheme**: Blue (#2563EB) primary, gray neutrals, green/red accents
- **Typography**: System fonts via Tailwind
- **Spacing**: Tailwind spacing scale (4px base unit)
- **Components**: shadcn/ui with custom configurations

## Toast Notifications

The app uses shadcn/ui Toast for notifications:

```typescript
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

toast({
  title: 'Success',
  description: 'Operation completed successfully',
});

toast({
  title: 'Error',
  description: 'Something went wrong',
  variant: 'destructive',
});
```

## Error Handling

- API errors are caught and displayed as toast notifications
- Form validation errors are shown inline
- Network errors trigger automatic logout if unauthorized
- User-friendly error messages

## Building for Production

```bash
pnpm build
pnpm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `http://localhost:8080` |

## Contributing

1. Follow the existing code structure and patterns
2. Use TypeScript for all new code
3. Use Tailwind CSS for styling
4. Use shadcn/ui components when possible
5. Keep components small and focused
6. Use Zustand stores for shared state

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For issues and feature requests, please open an issue in the repository.
