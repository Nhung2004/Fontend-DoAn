'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, XCircle, MoreVertical, Filter, User, Stethoscope } from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export default function AdminAppointmentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const role = user?.role?.toUpperCase();
  const hasAccess = role === 'ADMIN' || role === 'ROLE_ADMIN' || role === 'DOCTOR' || role === 'ROLE_DOCTOR';

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getAllAppointments(page, 10, statusFilter);
      let apps = [];
      // Handle various response structures
      if (Array.isArray(response)) apps = response;
      else if (Array.isArray(response?.data)) apps = response.data;
      else if (response?.data?.appointments) apps = response.data.appointments;
      else if (response?.appointments) apps = response.appointments;
      
      setAppointments(apps);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      toast({
        title: 'Error',
        description: 'Could not load appointments.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated || !hasAccess) {
      router.push('/');
      return;
    }
    fetchAppointments();
  }, [isAuthenticated, hasAccess, router, page, statusFilter]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await apiService.updateAppointmentStatus(id, newStatus);
      toast({
        title: 'Success',
        description: `Appointment marked as ${newStatus.toLowerCase()}.`,
      });
      fetchAppointments(); // Refresh list
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status.',
        variant: 'destructive',
      });
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !hasAccess) return null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Admin Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                Appointment Management
              </h1>
              <p className="text-slate-500 font-medium">Review, confirm, and manage patient consultations</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={fetchAppointments} variant="outline" className="rounded-xl bg-white">
                Refresh Data
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          <Card className="mb-8 border-0 shadow-sm overflow-hidden">
            <div className="bg-primary h-1 w-full" />
            <CardContent className="p-6">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 mr-4 text-slate-400">
                  <Filter size={18} />
                  <span className="text-sm font-bold uppercase tracking-wider">Filter By Status:</span>
                </div>
                {['', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'ghost'}
                    onClick={() => {
                      setStatusFilter(status);
                      setPage(1);
                    }}
                    className={`rounded-xl font-bold ${statusFilter === status ? 'shadow-md' : 'text-slate-500'}`}
                  >
                    {status || 'All Appointments'}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Appointments List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-white rounded-3xl animate-pulse shadow-sm" />
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <Card className="border-dashed border-2 bg-slate-50/50">
              <CardContent className="py-20 text-center">
                <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900">No records found</h3>
                <p className="text-slate-500">Try adjusting your filters or check back later.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {appointments.map((apt) => (
                <Card key={apt.id} className="border-0 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row">
                      {/* Left: Info */}
                      <div className="p-8 flex-1">
                        <div className="flex items-center gap-3 mb-6">
                          <Badge 
                            className={`px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest ${
                              apt.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                              (apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED') ? 'bg-blue-100 text-blue-700' :
                              apt.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {apt.status}
                          </Badge>
                          <span className="text-xs font-bold text-slate-400">ID: #{String(apt.id).slice(0, 8)}</span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                              <User size={24} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase">Patient</p>
                              <p className="text-lg font-black text-slate-900">{apt.patientName || 'Anonymous'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                              <Stethoscope size={24} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase">Doctor</p>
                              <p className="text-lg font-black text-slate-900">{apt.doctorName || 'Specialist'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-6 border-t border-slate-50 pt-6">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Calendar size={18} className="text-primary" />
                            <span className="font-bold">{new Date(apt.appointmentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clock size={18} className="text-primary" />
                            <span className="font-bold">{apt.appointmentTime}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="bg-slate-50/50 p-8 border-t lg:border-t-0 lg:border-l border-slate-100 flex flex-col justify-center gap-3 min-w-[240px]">
                        {apt.status === 'PENDING' && (
                          <Button 
                            onClick={() => handleUpdateStatus(apt.id, 'CONFIRMED')}
                            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-200"
                          >
                            <CheckCircle size={18} className="mr-2" /> Confirm Appointment
                          </Button>
                        )}
                        {(apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED') && (
                          <Button 
                            onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-200"
                          >
                            <CheckCircle size={18} className="mr-2" /> Mark Completed
                          </Button>
                        )}
                        {(apt.status === 'PENDING' || apt.status === 'SCHEDULED') && (
                          <Button 
                            onClick={() => handleUpdateStatus(apt.id, 'CANCELLED')}
                            variant="outline" 
                            className="w-full rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 font-bold"
                          >
                            <XCircle size={18} className="mr-2" /> Cancel Visit
                          </Button>
                        )}
                        <Button 
                          onClick={() => router.push(`/admin/users?search=${apt.patientName}`)}
                          variant="ghost" 
                          className="w-full rounded-xl font-bold text-slate-400"
                        >
                          View History
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && appointments.length > 0 && (
            <div className="flex justify-between items-center mt-12 bg-white p-4 rounded-2xl shadow-sm">
              <Button
                variant="ghost"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="font-bold"
              >
                Previous Page
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Page</span>
                <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-black">{page}</span>
              </div>
              <Button
                variant="ghost"
                onClick={() => setPage(page + 1)}
                className="font-bold"
              >
                Next Page
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
