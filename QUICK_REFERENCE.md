# MedBook Frontend - Quick Reference Guide

## Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## File Structure at a Glance

| Path | Purpose |
|------|---------|
| `app/` | Next.js pages and routes |
| `components/` | React components |
| `services/` | API integration |
| `stores/` | Zustand state management |
| `public/` | Static assets |

## Key Routes

| Route | Purpose | Auth Required |
|-------|---------|---------------|
| `/` | Home page | No |
| `/login` | Login | No |
| `/register` | Register | No |
| `/dashboard` | User dashboard | Yes |
| `/doctors` | Doctor search | No |
| `/doctors/[id]` | Doctor detail & booking | No |
| `/appointments` | My appointments | Yes |
| `/appointments/[id]` | Appointment detail | Yes |
| `/profile` | User profile | Yes |
| `/medical-records` | Medical records | Yes |
| `/admin` | Admin dashboard | Yes (Admin only) |
| `/admin/users` | User management | Yes (Admin only) |
| `/admin/doctors` | Doctor management | Yes (Admin only) |
| `/admin/appointments` | Appointment management | Yes (Admin only) |

## Using Stores

### AuthStore
```typescript
import { useAuthStore } from '@/stores/authStore';

const { user, isAuthenticated, login, logout } = useAuthStore();
```

### AppointmentStore
```typescript
import { useAppointmentStore } from '@/stores/appointmentStore';

const { appointments, bookAppointment } = useAppointmentStore();
```

### DoctorStore
```typescript
import { useDoctorStore } from '@/stores/doctorStore';

const { doctors, searchDoctors } = useDoctorStore();
```

## Using API Service

```typescript
import { apiService } from '@/services/api';

// Search doctors
await apiService.searchDoctors({ specialization: 'Cardiology' });

// Book appointment
await apiService.bookAppointment({
  doctorId: '123',
  appointmentDate: '2024-05-15',
  appointmentTime: '10:00',
  symptoms: 'Headache',
  consultationType: 'ONLINE'
});

// Get user profile
await apiService.getUserProfile();
```

## Using Toast Notifications

```typescript
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

// Success toast
toast({
  title: 'Success',
  description: 'Operation completed',
});

// Error toast
toast({
  title: 'Error',
  description: 'Something went wrong',
  variant: 'destructive',
});
```

## Common Patterns

### Protected Route with Auth Check
```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function ProtectedPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  return <div>Protected Content</div>;
}
```

### Fetch Data in useEffect
```typescript
'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/services/api';

export function MyComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.getDoctorById('123');
        setData(response.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>{JSON.stringify(data)}</div>;
}
```

### Form with Validation
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export function MyForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast({
        title: 'Error',
        description: 'Please fill all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      // API call
      toast({ title: 'Success', description: 'Done!' });
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Name"
      />
      <Input
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

## Common Components

```typescript
// Button
import { Button } from '@/components/ui/button';
<Button>Click me</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Delete</Button>

// Input
import { Input } from '@/components/ui/input';
<Input type="text" placeholder="Enter text" />

// Card
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

## Environment Variables

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

## API Response Format

```typescript
{
  "status": "SUCCESS" | "ERROR",
  "message": "Human readable message",
  "data": { /* response data */ },
  "errorCode": "ERROR_CODE" // only on error
}
```

## Error Handling

```typescript
try {
  await apiService.login(email, password);
} catch (error: any) {
  const errorMessage = error.response?.data?.message || 'Unknown error';
  toast({
    title: 'Error',
    description: errorMessage,
    variant: 'destructive',
  });
}
```

## Debugging Tips

1. **Check Console**: Browser DevTools Console for errors
2. **Network Tab**: DevTools Network tab to inspect API calls
3. **React DevTools**: Check component state and props
4. **Console Logs**: Use `console.log()` to debug
5. **Storage**: Check Cookies for accessToken/refreshToken

## TypeScript Tips

```typescript
// Define props type
interface ComponentProps {
  title: string;
  isActive?: boolean;
}

export function Component({ title, isActive = false }: ComponentProps) {
  return <div>{title}</div>;
}

// Define state type
const [user, setUser] = useState<User | null>(null);

// API response type
interface ApiResponse<T> {
  status: string;
  data: T;
  message: string;
}
```

## Performance Tips

1. Use `'use client'` directive only when needed
2. Memoize expensive components with `memo()`
3. Use `useCallback` for event handlers in lists
4. Lazy load components with `dynamic()`
5. Optimize images and assets

## Mobile Responsive Utilities

```typescript
// Tailwind responsive prefixes
<div className="
  grid grid-cols-1     // Mobile: 1 column
  md:grid-cols-2       // Tablet: 2 columns
  lg:grid-cols-3       // Desktop: 3 columns
">
</div>

// Responsive text size
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Heading
</h1>

// Hide/Show on certain screens
<div className="hidden md:block">Tablet and up only</div>
<div className="md:hidden">Mobile only</div>
```

## Common Tailwind Classes

| Class | Purpose |
|-------|---------|
| `flex` | Display flex |
| `gap-4` | Gap between items |
| `items-center` | Vertical center align |
| `justify-between` | Space between items |
| `w-full` | 100% width |
| `px-4` | Horizontal padding |
| `py-6` | Vertical padding |
| `rounded` | Rounded corners |
| `bg-blue-600` | Blue background |
| `text-gray-600` | Gray text |
| `hover:bg-blue-700` | Hover state |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 in use | Kill process: `kill -9 $(lsof -ti:3000)` |
| Module not found | Run `pnpm install` again |
| Build errors | Delete `.next` folder and rebuild |
| Styles not showing | Check Tailwind CSS is configured |
| API 401 error | Check token in cookies |
| CORS error | Backend needs CORS config for localhost:3000 |

## Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Axios](https://axios-http.com)

## Quick Checklist

- [ ] Dependencies installed: `pnpm install`
- [ ] Backend running on http://localhost:8080
- [ ] `.env.local` configured
- [ ] Dev server running: `pnpm dev`
- [ ] App accessible at http://localhost:3000
- [ ] Login functionality works
- [ ] Doctor search works
- [ ] Appointment booking works
- [ ] Admin panel accessible (if admin user)

## Getting Help

1. Check the documentation files:
   - `README.md` - Complete overview
   - `SETUP_GUIDE.md` - Setup instructions
   - `API_INTEGRATION.md` - API details
   - `PROJECT_SUMMARY.md` - Project structure

2. Check console for errors
3. Use browser DevTools
4. Review code comments
5. Check API responses in Network tab

---

Last Updated: 2024
Version: 1.0
