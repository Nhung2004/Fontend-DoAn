'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useAppointmentStore } from '@/stores/appointmentStore';
import { BookingModal } from '@/components/BookingModal';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  ArrowRight, 
  Activity, 
  User as UserIcon, 
  Heart, 
  ChevronRight,
  PlusCircle,
  History,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { appointments, isLoading, fetchAppointments } = useAppointmentStore();
  const [greeting, setGreeting] = useState('');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const role = user?.role?.toUpperCase();
    console.log('Current User Role in Dashboard:', role);
    if (role === 'ADMIN' || role === 'ROLE_ADMIN' || role === 'DOCTOR' || role === 'ROLE_DOCTOR') {
      console.log('Redirecting to Admin...');
      router.push('/admin');
      return;
    }

    fetchAppointments();

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, [isAuthenticated, user?.role, fetchAppointments, router]);

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === 'SCHEDULED' || apt.status === 'PENDING'
  );

  const soonAppointments = appointments.filter((apt) => {
    // Skip finished or cancelled appointments
    if (apt.status === 'COMPLETED' || apt.status === 'CANCELLED') return false;

    try {
      const aptDate = new Date(`${apt.appointmentDate}T${apt.appointmentTime}`);
      const now = new Date();
      const diff = aptDate.getTime() - now.getTime();
      
      // Show reminder if appointment is in the next 48 hours
      return diff > 0 && diff < 48 * 60 * 60 * 1000;
    } catch (e) {
      return false;
    }
  });

  console.log('All appointments:', appointments);
  console.log('Soon appointments detected:', soonAppointments);
  
  const completedAppointments = appointments.filter(
    (apt) => apt.status === 'COMPLETED'
  );

  if (!isAuthenticated) return null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8FAFC]">
        {/* Hero Section with Glassmorphism */}
        <div className="relative overflow-hidden bg-slate-900 py-20 md:py-32">
          {/* Animated Background Gradients */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[100%] bg-blue-600/20 blur-[150px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[100%] bg-indigo-600/20 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
              <div className="space-y-6 max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  <span className="text-xs font-bold text-blue-100 uppercase tracking-widest">Sunrise Portal</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-[1.1]">
                  {greeting}, <br />
                  <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    {user?.fullName.split(' ')[0]}
                  </span>
                </h1>
                <p className="text-xl text-slate-300/90 leading-relaxed font-medium">
                  Welcome back to Sunrise Hospital. Your health journey is our priority. Track your wellness and manage care in one place.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Button 
                    onClick={() => setIsBookingModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white h-14 px-8 rounded-2xl font-black shadow-2xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
                  >
                    <PlusCircle className="mr-2 h-6 w-6" />
                    New Appointment
                  </Button>
                  <Link href="/profile">
                    <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 h-14 px-8 rounded-2xl font-black backdrop-blur-md transition-all">
                      <UserIcon className="mr-2 h-6 w-6" />
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Quick Stats Overlay Card */}
              <div className="hidden lg:block w-80 bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white">Health Status</h3>
                    <Activity className="text-blue-400" size={20} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Vitality Index</span>
                      <span className="text-blue-400 font-black">94%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 w-[94%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    </div>
                  </div>
                  <div className="pt-4 grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] uppercase font-black text-slate-500 mb-1">Upcoming</p>
                      <p className="text-2xl font-black text-white">{upcomingAppointments.length}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] uppercase font-black text-slate-500 mb-1">Records</p>
                      <p className="text-2xl font-black text-white">12</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 -mt-12 pb-24 relative z-20">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { label: 'Upcoming', value: upcomingAppointments.length, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100/50' },
              { label: 'Completed', value: completedAppointments.length, icon: History, color: 'text-emerald-600', bg: 'bg-emerald-100/50' },
              { label: 'Health Score', value: '92%', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-100/50' },
              { label: 'Saved Doctors', value: '4', icon: Heart, color: 'text-rose-600', bg: 'bg-rose-100/50' },
            ].map((stat, i) => (
              <Card key={i} className="border-0 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <CardContent className="p-8 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-4xl font-black text-slate-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500 rotate-3 group-hover:rotate-0`}>
                    <stat.icon size={28} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Column - Appointments */}
            <div className="lg:col-span-2 space-y-8">
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <TrendingUp className="text-primary w-6 h-6" />
                    Upcoming Appointments
                  </h2>
                  <Link href="/appointments" className="text-primary text-sm font-semibold hover:underline flex items-center">
                    View all <ChevronRight size={16} />
                  </Link>
                </div>

                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-slate-100 shadow-sm" />
                    ))}
                  </div>
                ) : upcomingAppointments.length === 0 ? (
                  <Card className="border-dashed border-2 bg-slate-50/50">
                    <CardContent className="py-12 text-center">
                      <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Calendar className="w-8 h-8 text-slate-300" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">No upcoming appointments</h3>
                      <p className="text-slate-500 mb-6 max-w-xs mx-auto">You don't have any appointments scheduled. Start by finding a specialist.</p>
                      <Link href="/doctors">
                        <Button className="rounded-xl">Find a Doctor</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map((apt) => (
                      <Card key={apt.id} className="border-0 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row">
                            <div className="p-6 md:p-8 flex-1">
                              <div className="flex items-center justify-between mb-4">
                                <Badge variant={apt.status === 'PENDING' ? 'secondary' : 'default'} className="rounded-full px-3">
                                  {apt.status}
                                </Badge>
                                <span className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                                  <Clock size={14} /> Booked {new Date(apt.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <h3 className="text-xl font-bold text-foreground mb-4">
                                Consultation with {apt.doctorName || 'Specialist'}
                              </h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg">
                                  <Calendar size={16} className="text-primary" />
                                  <span className="text-sm font-medium">
                                    {new Date(apt.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg">
                                  <Clock size={16} className="text-primary" />
                                  <span className="text-sm font-medium">{apt.appointmentTime}</span>
                                </div>
                              </div>
                            </div>
                            <div className="bg-slate-50/50 p-6 md:p-8 border-t md:border-t-0 md:border-l border-slate-100 flex items-center justify-center md:min-w-[200px]">
                              <Link href={`/appointments/${apt.id}`} className="w-full">
                                <Button className="w-full rounded-xl shadow-sm hover:shadow-md transition-all group">
                                  Details
                                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </section>

              {/* Quick Services Section */}
              <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <h2 className="text-2xl font-bold text-foreground mb-6">Quick Services</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {[
                    { name: 'Pharmacy', icon: '💊', color: 'bg-orange-50' },
                    { name: 'Lab Tests', icon: '🧪', color: 'bg-blue-50' },
                    { name: 'Vaccines', icon: '💉', color: 'bg-green-50' },
                    { name: 'Ambulance', icon: '🚑', color: 'bg-red-50' },
                  ].map((service, i) => (
                    <div key={i} className="text-center group cursor-pointer">
                      <div className={`${service.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-all border border-transparent group-hover:border-slate-100`}>
                        <span className="text-3xl">{service.icon}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-700">{service.name}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-8">
              {/* Health Metrics Card */}
              <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-600 to-violet-700 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <CardHeader>
                  <CardTitle className="text-white">Health Summary</CardTitle>
                  <CardDescription className="text-indigo-100">Updates from your last checkup</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-indigo-100">Profile Completion</span>
                      <span className="font-bold">85%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white w-[85%] rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]"></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-xl p-3 backdrop-blur-md">
                      <p className="text-xs text-indigo-100 mb-1">Blood Type</p>
                      <p className="text-xl font-bold">O Positive</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 backdrop-blur-md">
                      <p className="text-xs text-indigo-100 mb-1">BMI</p>
                      <p className="text-xl font-bold">22.4</p>
                    </div>
                  </div>
                  
                  <Button variant="secondary" className="w-full bg-white text-indigo-600 hover:bg-indigo-50 border-0 rounded-xl font-bold">
                    Update Metrics
                  </Button>
                </CardContent>
              </Card>

              {/* Records Section */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl">Medical Records</CardTitle>
                  <FileText className="text-primary w-5 h-5" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">Access your diagnoses, treatments and visit history from your doctors.</p>
                  <Link href="/medical-records" className="block w-full">
                    <Button variant="outline" className="w-full rounded-xl mt-2">View All Records</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => {
          setIsBookingModalOpen(false);
          fetchAppointments(); // Refresh list after booking
        }} 
      />
    </>
  );
}
