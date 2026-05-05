'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppointmentStore } from '@/stores/appointmentStore';
import { useAuthStore } from '@/stores/authStore';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  FileText,
  Star,
  Check,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;
  const { isAuthenticated } = useAuthStore();
  const {
    currentAppointment,
    isLoading,
    getAppointmentById,
    cancelAppointment,
    rescheduleAppointment,
  } = useAppointmentStore();
  const { toast } = useToast();

  const [showCancelForm, setShowCancelForm] = useState(false);
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    getAppointmentById(appointmentId);
  }, [appointmentId, isAuthenticated, getAppointmentById, router]);

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a cancellation reason',
        variant: 'destructive',
      });
      return;
    }

    try {
      await cancelAppointment(appointmentId, cancelReason);
      toast({
        title: 'Success',
        description: 'Appointment cancelled successfully',
      });
      setShowCancelForm(false);
      getAppointmentById(appointmentId);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel appointment',
        variant: 'destructive',
      });
    }
  };

  const handleReschedule = async () => {
    if (!newDate || !newSlot) {
      toast({
        title: 'Error',
        description: 'Please select a date and time',
        variant: 'destructive',
      });
      return;
    }

    try {
      await rescheduleAppointment(appointmentId, newDate, newSlot);
      toast({
        title: 'Success',
        description: 'Appointment rescheduled successfully',
      });
      setShowRescheduleForm(false);
      getAppointmentById(appointmentId);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reschedule appointment',
        variant: 'destructive',
      });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Loading appointment details...</p>
        </div>
      </>
    );
  }

  if (!currentAppointment) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Appointment not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-6"
          >
            ← Back
          </Button>

          {/* Status Badge */}
          <div className="flex items-center gap-4 mb-8">
            <div>
              {currentAppointment.status === 'SCHEDULED' && (
                <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold">
                  Scheduled
                </span>
              )}
              {currentAppointment.status === 'COMPLETED' && (
                <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold">
                  Completed
                </span>
              )}
              {currentAppointment.status === 'CANCELLED' && (
                <span className="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-full font-semibold">
                  Cancelled
                </span>
              )}
            </div>
          </div>

          {/* Appointment Details */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Main Details */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Appointment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar size={24} className="text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-semibold">
                        {new Date(
                          currentAppointment.appointmentDate
                        ).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock size={24} className="text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-semibold">
                        {currentAppointment.appointmentTime}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Consultation Type */}
                <div className="flex items-start gap-3">
                  <MapPin size={24} className="text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Consultation Type</p>
                    <p className="font-semibold">
                      {currentAppointment.consultationType}
                    </p>
                  </div>
                </div>

                {/* Symptoms */}
                {currentAppointment.symptoms && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      Reason for Visit
                    </p>
                    <div className="bg-gray-50 p-4 rounded">
                      <p>{currentAppointment.symptoms}</p>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {currentAppointment.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      Doctor Notes
                    </p>
                    <div className="bg-gray-50 p-4 rounded">
                      <p>{currentAppointment.notes}</p>
                    </div>
                  </div>
                )}

                {/* Payment Status */}
                {currentAppointment.paymentStatus && (
                  <div className="flex items-center gap-2">
                    <Check size={20} className="text-green-600" />
                    <span>
                      <span className="font-medium">Payment Status:</span>{' '}
                      {currentAppointment.paymentStatus}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sidebar Actions */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentAppointment.status === 'SCHEDULED' && (
                    <>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowRescheduleForm(!showRescheduleForm)}
                      >
                        Reschedule
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full text-red-600 hover:text-red-700"
                        onClick={() => setShowCancelForm(!showCancelForm)}
                      >
                        Cancel
                      </Button>
                    </>
                  )}

                  {currentAppointment.status === 'COMPLETED' && (
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => setShowReviewForm(!showReviewForm)}
                    >
                      Leave Review
                    </Button>
                  )}

                  <Button variant="outline" className="w-full">
                    Download Receipt
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Cancel Form */}
          {showCancelForm && (
            <Card className="mb-8 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Cancel Appointment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please provide a reason for cancellation..."
                  className="w-full px-3 py-2 border rounded-md"
                  rows={4}
                />
                <div className="flex gap-4">
                  <Button
                    variant="destructive"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    Confirm Cancellation
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelForm(false)}
                    className="flex-1"
                  >
                    Keep Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reschedule Form */}
          {showRescheduleForm && (
            <Card className="mb-8 border-blue-200">
              <CardHeader>
                <CardTitle>Reschedule Appointment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">New Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">New Time</label>
                  <input
                    type="time"
                    value={newSlot}
                    onChange={(e) => setNewSlot(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={handleReschedule}
                  >
                    Confirm Reschedule
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowRescheduleForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Review Form */}
          {showReviewForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Leave a Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReview({ ...review, rating: star })}
                        className="focus:outline-none"
                      >
                        <Star
                          size={32}
                          className={
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Your Review
                  </label>
                  <textarea
                    value={review.comment}
                    onChange={(e) =>
                      setReview({ ...review, comment: e.target.value })
                    }
                    placeholder="Share your experience with this doctor..."
                    className="w-full px-3 py-2 border rounded-md"
                    rows={4}
                  />
                </div>

                <div className="flex gap-4">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Submit Review
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowReviewForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
