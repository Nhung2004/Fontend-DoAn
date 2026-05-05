'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useAppointmentStore } from '@/stores/appointmentStore';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, User, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function AppointmentsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { appointments, isLoading, fetchAppointments } = useAppointmentStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchAppointments();
  }, [isAuthenticated, fetchAppointments, router]);

  if (!isAuthenticated) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'COMPLETED':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'CANCELLED':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return <AlertCircle className="w-4 h-4" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12">
            <div>
              <h1 className="text-5xl font-bold text-foreground mb-2">
                My Appointments
              </h1>
              <p className="text-lg text-foreground/60">Manage and track your healthcare visits</p>
            </div>
            <Link href="/doctors">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2">
                Book New Appointment
              </Button>
            </Link>
          </div>

          {/* Appointments List */}
          {isLoading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-foreground/60 mt-4 text-lg">Loading your appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <Card className="border-0 shadow-lg bg-muted/30">
              <CardContent className="p-16 text-center">
                <Calendar className="w-20 h-20 mx-auto text-muted-foreground mb-6 opacity-40" />
                <h3 className="text-2xl font-bold text-foreground mb-3">No Appointments Yet</h3>
                <p className="text-foreground/60 mb-8 text-lg">
                  You don&apos;t have any appointments yet. Book your first appointment with a healthcare professional now!
                </p>
                <Link href="/doctors">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3">
                    Browse Doctors
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="border-0 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-4 gap-6 p-8">
                      {/* Status */}
                      <div className="space-y-2">
                        <p className="text-sm text-foreground/60 font-semibold uppercase">Status</p>
                        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          <span>{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1).toLowerCase()}</span>
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="space-y-2">
                        <p className="text-sm text-foreground/60 font-semibold uppercase">Date & Time</p>
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                          <div>
                            <p className="font-semibold text-foreground">
                              {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                            <p className="text-sm text-foreground/60 flex items-center gap-1 mt-1">
                              <Clock className="w-4 h-4" />
                              {appointment.appointmentTime}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Doctor Info */}
                      <div className="space-y-2">
                        <p className="text-sm text-foreground/60 font-semibold uppercase">Doctor</p>
                        <div className="flex items-start gap-3">
                          <User className="w-5 h-5 text-secondary flex-shrink-0 mt-1" />
                          <div>
                            <p className="font-semibold text-foreground">{appointment.doctorName}</p>
                            <p className="text-sm text-foreground/60">{appointment.consultationType}</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2">
                        <p className="text-sm text-foreground/60 font-semibold uppercase">Actions</p>
                        <Link href={`/appointments/${appointment.id}`} className="block">
                          <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/10">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
