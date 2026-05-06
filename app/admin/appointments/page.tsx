'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, CheckCircle, XCircle, Filter, User, Stethoscope, FileText, X, Save, Loader2 } from 'lucide-react';
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

  // Medical Record Modal State
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isSubmittingRecord, setIsSubmittingRecord] = useState(false);
  const [recordForm, setRecordForm] = useState({
    diagnosis: '',
    treatment: '',
    notes: '',
  });

  const role = user?.role?.toUpperCase();
  const hasAccess = role === 'ADMIN' || role === 'ROLE_ADMIN' || role === 'DOCTOR' || role === 'ROLE_DOCTOR';

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getAllAppointments(page, 10, statusFilter);
      let apps: any[] = [];
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

  // Open the Medical Record modal when "Mark Completed" is clicked
  const handleMarkCompleted = (apt: any) => {
    setSelectedAppointment(apt);
    setRecordForm({ diagnosis: '', treatment: '', notes: '' });
    setIsRecordModalOpen(true);
  };

  // Submit: Create Medical Record + Mark as Completed
  const handleSubmitRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    setIsSubmittingRecord(true);
    try {
      // 1. Create the medical record
      // Backend auto-resolves patient from appointmentId
      await apiService.createMedicalRecord({
        appointmentId: Number(selectedAppointment.id),
        doctorId: Number(selectedAppointment.doctorId),
        diagnosis: recordForm.diagnosis,
        treatment: recordForm.treatment,
        notes: recordForm.notes,
      });

      // 2. Mark appointment as COMPLETED
      await apiService.updateAppointmentStatus(selectedAppointment.id, 'COMPLETED');

      toast({
        title: 'Completed Successfully',
        description: 'Medical record has been created and appointment marked as completed.',
      });

      setIsRecordModalOpen(false);
      setSelectedAppointment(null);
      fetchAppointments(); // Refresh
    } catch (error: any) {
      console.error('Failed to create medical record:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to create medical record. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingRecord(false);
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
                            onClick={() => handleMarkCompleted(apt)}
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

      {/* ========== Medical Record Modal ========== */}
      {isRecordModalOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsRecordModalOpen(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black">Create Medical Record</h2>
                    <p className="text-emerald-100 text-sm font-medium">Add diagnosis before completing</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsRecordModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Patient Info Summary */}
            <div className="px-8 py-4 bg-slate-50 border-b border-slate-100">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</p>
                  <p className="font-bold text-slate-900">{selectedAppointment.patientName || 'Anonymous'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctor</p>
                  <p className="font-bold text-slate-900">{selectedAppointment.doctorName || 'Specialist'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                  <p className="font-bold text-slate-900">{new Date(selectedAppointment.appointmentDate).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</p>
                  <p className="font-bold text-slate-900">{selectedAppointment.appointmentTime}</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitRecord} className="px-8 py-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  Diagnosis <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={recordForm.diagnosis}
                  onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                  placeholder="e.g. Viêm họng cấp, Viêm xoang..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium resize-none transition-all"
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  Treatment <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={recordForm.treatment}
                  onChange={(e) => setRecordForm({ ...recordForm, treatment: e.target.value })}
                  placeholder="e.g. Uống thuốc kháng sinh trong 5 ngày..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium resize-none transition-all"
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  Notes
                </label>
                <textarea
                  value={recordForm.notes}
                  onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                  placeholder="e.g. Tái khám sau 1 tuần, nghỉ ngơi..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium resize-none transition-all"
                  rows={2}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="flex-1 rounded-xl font-bold h-12"
                  disabled={isSubmittingRecord}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingRecord || !recordForm.diagnosis || !recordForm.treatment}
                  className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold h-12 shadow-lg shadow-emerald-200"
                >
                  {isSubmittingRecord ? (
                    <><Loader2 size={18} className="mr-2 animate-spin" /> Saving...</>
                  ) : (
                    <><Save size={18} className="mr-2" /> Complete & Save Record</>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
