'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoctorStore } from '@/stores/doctorStore';
import { useAppointmentStore } from '@/stores/appointmentStore';
import { useAuthStore } from '@/stores/authStore';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Calendar, Clock, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.id as string;
  const { isAuthenticated } = useAuthStore();
  const { selectedDoctor, isLoading, getDoctorById, getAvailableSlots, availableSlots } =
    useDoctorStore();
  const { bookAppointment, isLoading: isBooking } = useAppointmentStore();
  const { toast } = useToast();

  const [step, setStep] = useState(1); // 1: View, 2: Select Date/Slot, 3: Confirm
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [selectedSlotTime, setSelectedSlotTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [consultationType, setConsultationType] = useState('ONLINE');

  useEffect(() => {
    getDoctorById(doctorId);
  }, [doctorId, getDoctorById]);

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedSlotId('');
    setSelectedSlotTime('');
    if (date) {
      await getAvailableSlots(doctorId, date);
    }
  };

  const handleBookAppointment = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!selectedDate || !selectedSlotId) {
      toast({
        title: 'Error',
        description: 'Please select a date and time slot',
        variant: 'destructive',
      });
      return;
    }

    const user = useAuthStore.getState().user;

    try {
      await bookAppointment({
        timeSlotId: selectedSlotId,
        patientId: user?.id,
        consultationType,
        symptoms,
      });

      toast({
        title: 'Success',
        description: 'Appointment booked successfully!',
      });

      router.push('/appointments');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to book appointment',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Loading doctor information...</p>
        </div>
      </>
    );
  }

  if (!selectedDoctor) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Doctor not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {step === 1 ? (
            <>
              {/* Doctor Profile */}
              <Card className="mb-8">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-3 gap-8 items-start">
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 bg-blue-100 rounded-full mb-4 flex items-center justify-center">
                        <span className="text-6xl font-bold text-blue-600">
                          {selectedDoctor.fullName.charAt(0)}
                        </span>
                      </div>
                      <h1 className="text-2xl font-bold text-center">
                        {selectedDoctor.fullName}
                      </h1>
                      <p className="text-blue-600 font-medium text-lg">
                        {selectedDoctor.specialization}
                      </p>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded">
                          <p className="text-gray-600 text-sm">Qualification</p>
                          <p className="font-semibold">{selectedDoctor.qualification}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded">
                          <p className="text-gray-600 text-sm">Experience</p>
                          <p className="font-semibold">
                            {selectedDoctor.yearsOfExperience} Years
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded">
                          <p className="text-gray-600 text-sm">Consultation Fee</p>
                          <p className="font-semibold">
                            ${selectedDoctor.consultationFee}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded">
                          <p className="text-gray-600 text-sm">Status</p>
                          <p className="font-semibold">
                            {selectedDoctor.isAvailable ? (
                              <span className="text-green-600">Available</span>
                            ) : (
                              <span className="text-red-600">Unavailable</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {selectedDoctor.rating && (
                        <div>
                          <p className="text-gray-600 text-sm mb-2">Rating</p>
                          <div className="flex items-center gap-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={20}
                                className={
                                  i < Math.floor(selectedDoctor.rating!)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }
                              />
                            ))}
                            <span className="text-lg font-semibold ml-2">
                              {selectedDoctor.rating}
                            </span>
                          </div>
                        </div>
                      )}

                      {selectedDoctor.bio && (
                        <div>
                          <p className="text-gray-600 text-sm mb-2">About</p>
                          <p className="text-gray-700">{selectedDoctor.bio}</p>
                        </div>
                      )}

                      <Button
                        size="lg"
                        onClick={() => setStep(2)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={!selectedDoctor.isAvailable}
                      >
                        {selectedDoctor.isAvailable ? 'Book Appointment' : 'Doctor Not Available'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : step === 2 ? (
            <>
              {/* Booking Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Book Appointment with {selectedDoctor.fullName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Consultation Type
                    </label>
                    <select
                      value={consultationType}
                      onChange={(e) => setConsultationType(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="ONLINE">Online Consultation</option>
                      <option value="IN_PERSON">In-Person Visit</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="date" className="block text-sm font-medium">
                      Select Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      value={selectedDate}
                      onChange={handleDateChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>

                  {selectedDate && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        Available Time Slots
                      </label>
                      {availableSlots.length === 0 ? (
                        <p className="text-gray-600 text-sm">
                          No available slots for this date
                        </p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot.id}
                              onClick={() => {
                                setSelectedSlotId(slot.id);
                                setSelectedSlotTime(slot.startTime);
                              }}
                              className={`p-3 border rounded-md font-medium transition ${
                                selectedSlotId === slot.id
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white border-gray-300 hover:border-blue-600'
                              } ${!slot.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                              disabled={!slot.isAvailable}
                            >
                              {slot.startTime}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="symptoms" className="block text-sm font-medium">
                      Symptoms/Reason for Visit
                    </label>
                    <textarea
                      id="symptoms"
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="Describe your symptoms or reason for visiting"
                      className="w-full px-3 py-2 border rounded-md"
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      disabled={!selectedDate || !selectedSlotId}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Review Booking
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : step === 3 ? (
            <>
              {/* Step 3: Confirmation */}
              <Card>
                <CardHeader>
                  <CardTitle>Confirm Your Appointment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg space-y-4 border">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Doctor</p>
                        <p className="font-semibold">{selectedDoctor.fullName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Specialty</p>
                        <p className="font-semibold">{selectedDoctor.specialization}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date & Time</p>
                        <p className="font-semibold">{selectedDate} at {selectedSlotTime}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Consultation Type</p>
                        <p className="font-semibold">{consultationType === 'ONLINE' ? 'Online' : 'In-Person'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Consultation Fee</p>
                        <p className="font-semibold text-blue-600">${selectedDoctor.consultationFee}</p>
                      </div>
                    </div>
                    {symptoms && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-500">Symptoms</p>
                        <p className="text-sm mt-1">{symptoms}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="flex-1"
                      disabled={isBooking}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleBookAppointment}
                      disabled={isBooking}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {isBooking ? 'Processing...' : 'Confirm & Book Appointment'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </main>
    </>
  );
}
