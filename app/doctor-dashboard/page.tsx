'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  Activity, 
  TrendingUp,
  FileText
} from 'lucide-react';
import Link from 'next/link';

export default function DoctorDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { toast } = useToast();
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const role = user?.role?.toUpperCase();
    const isDoctor = role === 'DOCTOR' || role === 'ROLE_DOCTOR';
    
    if (!isAuthenticated || !isDoctor) {
      router.push('/login');
      return;
    }

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    fetchAppointments();
  }, [isAuthenticated, user?.role, router]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getUserAppointments();
      // In a real app, backend would filter by doctor. For mock, we filter manually.
      const allAppointments = Array.isArray(res) ? res : res?.data || [];
      const doctorAppointments = allAppointments.filter((apt: any) => apt.doctorId === user?.id);
      setAppointments(doctorAppointments);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your schedule',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await apiService.updateAppointmentStatus(id, newStatus);
      toast({
        title: 'Status Updated',
        description: `Appointment marked as ${newStatus}`,
      });
      fetchAppointments();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  if (!isAuthenticated || user?.role !== 'DOCTOR') return null;

  const pendingAppointments = appointments.filter(a => a.status === 'PENDING');
  const scheduledAppointments = appointments.filter(a => a.status === 'SCHEDULED');
  const completedAppointments = appointments.filter(a => a.status === 'COMPLETED');

  // Simple stats for mock
  const uniquePatients = new Set(appointments.map(a => a.patientId || a.id)).size;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8FAFC]">
        {/* Doctor Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-800 py-16">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[120%] bg-white blur-[100px] rounded-full"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[120%] bg-indigo-300 blur-[100px] rounded-full"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-4">
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md px-3 py-1 text-sm">
                  Doctor Workspace
                </Badge>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                  {greeting}, <span className="text-blue-200">{user?.fullName}</span>
                </h1>
                <p className="text-lg text-blue-100 max-w-2xl font-medium">
                  Manage your schedule, review patient records, and provide care efficiently.
                </p>
              </div>
              <div className="flex gap-4">
                <Button className="bg-white text-blue-700 hover:bg-blue-50 h-12 px-6 rounded-xl font-bold shadow-lg">
                  <Calendar className="mr-2 h-5 w-5" /> View Calendar
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 -mt-8 pb-20 relative z-20">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { label: 'Pending Requests', value: pendingAppointments.length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Upcoming Today', value: scheduledAppointments.length, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Patients Treated', value: completedAppointments.length, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Performance', value: '4.8★', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            ].map((stat, i) => (
              <Card key={i} className="border-0 shadow-md hover:shadow-lg transition-all group rounded-2xl overflow-hidden">
                <CardContent className="p-6 flex items-center justify-between bg-white">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1">{stat.label}</p>
                    <p className="text-3xl font-black text-slate-800">{stat.value}</p>
                  </div>
                  <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform shadow-sm`}>
                    <stat.icon size={26} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content - Schedule */}
            <div className="lg:col-span-2 space-y-8">
              {/* Pending Appointments Section */}
              {pendingAppointments.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <Activity className="text-amber-500 w-6 h-6" />
                    <h2 className="text-2xl font-bold text-slate-800">Pending Approvals</h2>
                    <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800">{pendingAppointments.length}</Badge>
                  </div>
                  <div className="space-y-4">
                    {pendingAppointments.map(apt => (
                      <Card key={apt.id} className="border border-amber-100 shadow-sm hover:shadow-md transition-all overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400" />
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                              <h3 className="text-lg font-bold text-slate-800 mb-1">Patient #{apt.id.split('-')[1]}</h3>
                              <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-600 mb-2">
                                <span className="flex items-center gap-1"><Calendar size={14} className="text-slate-400" /> {new Date(apt.appointmentDate).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1"><Clock size={14} className="text-slate-400" /> {apt.appointmentTime}</span>
                              </div>
                              <p className="text-sm text-slate-500"><span className="font-semibold text-slate-700">Reason:</span> {apt.reason || 'N/A'}</p>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                              <Button 
                                variant="outline" 
                                className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50"
                                onClick={() => handleUpdateStatus(apt.id, 'CANCELLED')}
                              >
                                Decline
                              </Button>
                              <Button 
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                                onClick={() => handleUpdateStatus(apt.id, 'SCHEDULED')}
                              >
                                Approve
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* Scheduled Appointments */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-blue-600 w-6 h-6" />
                    <h2 className="text-2xl font-bold text-slate-800">Upcoming Consultations</h2>
                  </div>
                </div>

                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-2xl" />)}
                  </div>
                ) : scheduledAppointments.length === 0 ? (
                  <Card className="border-dashed border-2 bg-slate-50">
                    <CardContent className="py-12 text-center">
                      <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Clock className="w-8 h-8 text-slate-300" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-700">No scheduled appointments</h3>
                      <p className="text-slate-500">Your schedule is clear for now.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {scheduledAppointments.map(apt => (
                      <Card key={apt.id} className="border-0 shadow-sm hover:shadow-md transition-all overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row">
                            <div className="p-6 flex-1">
                              <div className="flex justify-between items-start mb-3">
                                <h3 className="text-xl font-bold text-slate-800">Patient #{apt.id.split('-')[1]}</h3>
                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">{apt.consultationType || 'Consultation'}</Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-slate-50 p-2.5 rounded-lg flex items-center gap-2">
                                  <Calendar size={16} className="text-blue-500" />
                                  <span className="text-sm font-semibold text-slate-700">{new Date(apt.appointmentDate).toLocaleDateString()}</span>
                                </div>
                                <div className="bg-slate-50 p-2.5 rounded-lg flex items-center gap-2">
                                  <Clock size={16} className="text-blue-500" />
                                  <span className="text-sm font-semibold text-slate-700">{apt.appointmentTime}</span>
                                </div>
                              </div>
                              <p className="text-sm text-slate-600 line-clamp-1"><span className="font-semibold text-slate-800">Reason:</span> {apt.reason || apt.notes}</p>
                            </div>
                            
                            <div className="bg-slate-50 p-6 flex flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 md:min-w-[220px]">
                              <Button 
                                className="w-full bg-slate-800 hover:bg-slate-900 shadow-md"
                              >
                                <FileText size={16} className="mr-2" /> View Records
                              </Button>
                              <Button 
                                variant="outline"
                                className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                              >
                                <CheckCircle size={16} className="mr-2" /> Mark Complete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-8">
              <Card className="border-0 shadow-sm bg-white rounded-2xl">
                <CardHeader>
                  <CardTitle>Schedule Overview</CardTitle>
                  <CardDescription>Your availability today</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm">
                        <Clock size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Working Hours</p>
                        <p className="font-bold text-slate-800">08:00 AM - 05:00 PM</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Next Appointments</h4>
                      <div className="space-y-3">
                        {scheduledAppointments.slice(0, 3).map((apt, i) => (
                          <div key={i} className="flex gap-3 relative">
                            <div className="flex flex-col items-center">
                              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full z-10" />
                              {i !== 2 && <div className="w-0.5 h-full bg-blue-100 absolute top-2.5" />}
                            </div>
                            <div className="pb-3">
                              <p className="text-sm font-bold text-slate-800">{apt.appointmentTime}</p>
                              <p className="text-xs text-slate-500">Patient #{apt.id.split('-')[1]} • {apt.consultationType || 'Visit'}</p>
                            </div>
                          </div>
                        ))}
                        {scheduledAppointments.length === 0 && (
                          <p className="text-sm text-slate-500 italic">No more appointments today.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold mb-2">Need a break?</h3>
                  <p className="text-slate-300 text-sm mb-6">Manage your availability or block specific time slots.</p>
                  <Button className="w-full bg-white text-slate-900 hover:bg-slate-100">
                    Update Schedule Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
