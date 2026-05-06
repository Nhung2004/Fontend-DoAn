'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useAppointmentStore } from '@/stores/appointmentStore';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut, Bell, Calendar, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { appointments, fetchAppointments } = useAppointmentStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
    }
  }, [isAuthenticated, fetchAppointments]);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    setIsNotifyOpen(false);
    router.push('/');
  };

  const notifications = appointments.filter((apt) => {
    if (apt.status === 'COMPLETED' || apt.status === 'CANCELLED') return false;
    try {
      const aptDate = new Date(`${apt.appointmentDate}T${apt.appointmentTime}`);
      const now = new Date();
      const diff = aptDate.getTime() - now.getTime();
      return diff > 0 && diff < 48 * 60 * 60 * 1000; // Within 48h
    } catch (e) { return false; }
  });

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            S
          </div>
          <span className="text-xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
            Sunrise
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="text-foreground/70 hover:text-primary font-medium transition-colors">
                Dashboard
              </Link>
              <Link href="/appointments" className="text-foreground/70 hover:text-primary font-medium transition-colors">
                Appointments
              </Link>
              <Link href="/profile" className="text-foreground/70 hover:text-primary font-medium transition-colors">
                Profile
              </Link>
              {(user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'ROLE_ADMIN' || user?.role?.toUpperCase() === 'DOCTOR' || user?.role?.toUpperCase() === 'ROLE_DOCTOR') && (
                <Link href="/admin" className="text-foreground/70 hover:text-primary font-medium transition-colors">
                  Admin Panel
                </Link>
              )}

              {/* Notification Bell */}
              <div className="relative">
                <button 
                  onClick={() => setIsNotifyOpen(!isNotifyOpen)}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors relative"
                >
                  <Bell size={22} className={notifications.length > 0 ? "text-rose-500 animate-swing" : "text-slate-600"} />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 bg-rose-600 text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {isNotifyOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 animate-in fade-in slide-in-from-top-2">
                    <h4 className="font-black text-slate-900 mb-4 px-2">Reminders</h4>
                    {notifications.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-6">No upcoming appointments</p>
                    ) : (
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                        {notifications.map((n) => (
                          <div key={n.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 group cursor-pointer hover:bg-slate-100 transition-colors">
                            <p className="text-sm font-bold text-slate-800">Appointment with {n.doctorName}</p>
                            <div className="flex items-center gap-3 mt-1 text-[11px] font-bold text-slate-500">
                              <span className="flex items-center gap-1"><Calendar size={12} /> {n.appointmentDate}</span>
                              <span className="flex items-center gap-1"><Clock size={12} /> {n.appointmentTime}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 pl-8 border-l">
                <div>
                  <p className="text-sm font-bold text-slate-900">{user?.fullName}</p>
                  <p className="text-xs text-slate-500 font-medium">{user?.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-destructive hover:text-destructive"
                >
                  <LogOut size={18} />
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link href="/doctors" className="text-foreground/70 hover:text-primary font-medium transition-colors">
                Find Doctors
              </Link>
              <Button variant="outline" onClick={() => router.push('/login')}>
                Login
              </Button>
              <Button onClick={() => router.push('/register')} className="bg-primary hover:bg-primary/90">
                Register
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground hover:text-primary transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-card/95 p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
          {isAuthenticated ? (
            <>
              <div className="px-4 py-3 bg-slate-50 rounded-xl mb-4 border border-slate-100">
                <p className="text-sm font-bold text-slate-900">{user?.fullName}</p>
                <p className="text-xs text-slate-500 font-medium">{user?.email}</p>
              </div>
              <Link href="/dashboard" className="block px-4 py-2 text-foreground hover:bg-primary/10 rounded transition-colors">
                Dashboard
              </Link>
              <Link href="/appointments" className="block px-4 py-2 text-foreground hover:bg-primary/10 rounded transition-colors">
                My Appointments
              </Link>
              <Link href="/profile" className="block px-4 py-2 text-foreground hover:bg-primary/10 rounded transition-colors">
                Profile
              </Link>
              {(user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'ROLE_ADMIN' || user?.role?.toUpperCase() === 'DOCTOR' || user?.role?.toUpperCase() === 'ROLE_DOCTOR') && (
                <Link href="/admin" className="block px-4 py-2 text-foreground hover:bg-primary/10 rounded transition-colors">
                  Admin Panel
                </Link>
              )}
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full text-destructive hover:text-destructive mt-4"
              >
                <LogOut size={18} className="mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/doctors" className="block px-4 py-2 text-foreground hover:bg-primary/10 rounded transition-colors">
                Find Doctors
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  router.push('/login');
                  setIsMenuOpen(false);
                }}
                className="w-full"
              >
                Login
              </Button>
              <Button
                onClick={() => {
                  router.push('/register');
                  setIsMenuOpen(false);
                }}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Register
              </Button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
