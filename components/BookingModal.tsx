'use client';

import { useState, useEffect } from 'react';
import { useDoctorStore } from '@/stores/doctorStore';
import { useAppointmentStore } from '@/stores/appointmentStore';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User as UserIcon, FileText, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated } = useAuthStore();
  const {
    doctors,
    searchDoctors,
    getAvailableSlots,
    availableSlots,
    isLoading: isDoctorLoading,
  } = useDoctorStore();
  const { bookAppointment, isLoading: isBooking } = useAppointmentStore();

  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [selectedSlotTime, setSelectedSlotTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [consultationType, setConsultationType] = useState('ONLINE');

  useEffect(() => {
    if (isOpen) {
      setSelectedDoctorId('');
      setSelectedDate('');
      setSelectedSlotId('');
      setSelectedSlotTime('');
      setSymptoms('');
      setConsultationType('ONLINE');
      searchDoctors({ limit: 50 });
    }
  }, [isOpen, searchDoctors]);

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedSlotId('');
    setSelectedSlotTime('');
    if (date && selectedDoctorId) {
      await getAvailableSlots(selectedDoctorId, date);
    }
  };

  const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const docId = e.target.value;
    setSelectedDoctorId(docId);
    setSelectedDate('');
    setSelectedSlotId('');
    setSelectedSlotTime('');
  };

  const handleBookAppointment = async () => {
    if (!isAuthenticated) {
      onClose();
      router.push('/login');
      return;
    }

    if (!selectedSlotId) {
      toast({
        title: 'Error',
        description: 'Please select a time slot',
        variant: 'destructive',
      });
      return;
    }

    const user = useAuthStore.getState().user;
    const payload = {
      doctorId: selectedDoctorId,
      timeSlotId: selectedSlotId,
      patientId: user?.id,
      appointmentDate: selectedDate,
      appointmentTime: selectedSlotTime,
      symptoms,
      consultationType,
    };

    console.log('Booking payload:', payload);

    try {
      await bookAppointment(payload);

      toast({
        title: 'Success',
        description: 'Appointment booked successfully!',
      });

      onClose();
      router.push('/appointments');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to book appointment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const selectedDoctor = doctors.find((d) => String(d.id) === String(selectedDoctorId));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-white max-h-[95vh] overflow-y-auto rounded-3xl shadow-2xl border-none">
        <DialogHeader className="pb-4 border-b border-slate-100">
          <DialogTitle className="text-3xl font-extrabold text-center bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Schedule Your Visit
          </DialogTitle>
          <DialogDescription className="text-center font-medium text-slate-500">
            Choose your preferred doctor and a convenient time.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-8">
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2 px-1">
              <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                <UserIcon size={18} />
              </div> 
              Select Your Doctor
            </label>
            <select
              value={selectedDoctorId}
              onChange={handleDoctorChange}
              className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none bg-slate-50/50 appearance-none transition-all cursor-pointer font-medium text-slate-800"
              disabled={isDoctorLoading}
            >
              <option value="">-- Choose a doctor --</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={String(doctor.id)}>
                  {doctor.fullName} ({doctor.specialization || doctor.specialty})
                </option>
              ))}
            </select>
          </div>

          {selectedDoctor && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-3xl border border-blue-100 flex justify-between items-center shadow-sm">
              <div>
                <p className="font-black text-slate-900 text-lg">{selectedDoctor.fullName}</p>
                <p className="text-sm font-bold text-primary/80 uppercase tracking-wider">{selectedDoctor.specialization || selectedDoctor.specialty}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Fee</p>
                <p className="text-2xl font-black text-primary">${selectedDoctor.consultationFee || 0}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2 px-1">
              <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                <Calendar size={18} />
              </div> 
              Select Appointment Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none bg-slate-50/50 font-medium"
            />
          </div>

          {selectedDate && (
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2 px-1">
                <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                  <Clock size={18} />
                </div> 
                Available Time Slots
              </label>
              
              {availableSlots.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-500 font-bold">No slots available for this date.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {availableSlots.map((slot: any) => (
                    <button
                      key={slot.id}
                      onClick={() => {
                        setSelectedSlotId(slot.id);
                        setSelectedSlotTime(slot.startTime);
                      }}
                      disabled={!slot.isAvailable}
                      className={`py-3 rounded-xl text-sm font-black border transition-all ${
                        selectedSlotId === slot.id
                          ? 'bg-primary text-white border-primary shadow-lg scale-105'
                          : slot.isAvailable
                          ? 'bg-white border-slate-200 text-slate-700 hover:border-primary'
                          : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed line-through'
                      }`}
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2 px-1">
              <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                <FileText size={18} />
              </div> 
              Symptoms
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Tell us what's wrong..."
              className="w-full px-6 py-4 border-2 border-slate-100 rounded-3xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none resize-none h-24 bg-slate-50/50 font-medium"
            />
          </div>

          <Button
            className="w-full h-16 text-xl font-black rounded-3xl shadow-xl shadow-primary/30"
            onClick={handleBookAppointment}
            disabled={!selectedSlotId || isBooking}
          >
            {isBooking ? 'Processing...' : 'Confirm Appointment'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
