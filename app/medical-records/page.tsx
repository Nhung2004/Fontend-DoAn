'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Stethoscope, Calendar, Pill, StickyNote, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { apiService } from '@/services/api';

export default function MedicalRecordsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchRecords = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await apiService.getMedicalRecords(page, pagination.limit);
      const data = res.data || res.content || res || [];
      const records = Array.isArray(data) ? data : [];
      setRecords(records);
      if (res.pagination) {
        setPagination(res.pagination);
      } else {
        setPagination(prev => ({ ...prev, page, total: records.length, totalPages: 1 }));
      }
    } catch (error) {
      console.error('Failed to fetch medical records:', error);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchRecords();
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                <FileText size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900">Medical Records</h1>
                <p className="text-slate-500 font-medium">Your diagnoses, treatments and visit history</p>
              </div>
            </div>
          </div>

          {/* Records List */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={40} className="text-blue-600 animate-spin mb-4" />
              <p className="text-slate-500 font-medium">Loading medical records...</p>
            </div>
          ) : records.length === 0 ? (
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardContent className="py-16 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText size={36} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No medical records found</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  Your medical records will appear here after your doctor completes a visit and adds a diagnosis.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-5">
              {records.map((record: any) => (
                <Card key={record.id} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-0">
                    <div className="p-6 md:p-8">
                      {/* Top row: Doctor + Date */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Stethoscope size={20} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-lg">{record.doctorName || 'Unknown Doctor'}</p>
                            <p className="text-xs text-slate-400 font-medium">Appointment #{record.appointmentId}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full font-semibold">
                          <Calendar size={14} />
                          {record.visitDate
                            ? new Date(record.visitDate).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })
                            : 'N/A'}
                        </div>
                      </div>

                      {/* Diagnosis */}
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4">
                        <p className="text-xs font-black text-amber-600 uppercase tracking-widest mb-1">Diagnosis</p>
                        <p className="text-slate-900 font-semibold">{record.diagnosis || 'N/A'}</p>
                      </div>

                      {/* Treatment + Notes */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Pill size={14} className="text-emerald-600" />
                            <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Treatment</p>
                          </div>
                          <p className="text-slate-800 font-medium text-sm">{record.treatment || 'N/A'}</p>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <StickyNote size={14} className="text-blue-600" />
                            <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Notes</p>
                          </div>
                          <p className="text-slate-800 font-medium text-sm">{record.notes || 'No notes'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => fetchRecords(pagination.page - 1)}
                    className="rounded-xl"
                  >
                    <ChevronLeft size={16} className="mr-1" /> Previous
                  </Button>
                  <span className="text-sm font-bold text-slate-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => fetchRecords(pagination.page + 1)}
                    className="rounded-xl"
                  >
                    Next <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
