import { create } from 'zustand';
import { apiService } from '@/services/api';

export interface Doctor {
  id: string;
  fullName: string;
  specialization: string;
  qualification: string;
  yearsOfExperience: number;
  rating?: number;
  consultationFee: number;
  profilePicture?: string;
  bio?: string;
  isAvailable: boolean;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface DaySchedule {
  date: string;
  slots: any[];
}

interface DoctorStore {
  doctors: Doctor[];
  selectedDoctor: Doctor | null;
  availableSlots: DaySchedule[];
  isLoading: boolean;
  error: string | null;
  totalDoctors: number;
  currentPage: number;

  searchDoctors: (filters: {
    keyword?: string;
    specialization?: string;
    minRating?: number;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  getDoctorById: (id: string) => Promise<void>;
  getAvailableSlots: (doctorId: string, startDate: string, endDate: string) => Promise<void>;
  getDoctorReviews: (doctorId: string) => Promise<any>;
  clearError: () => void;
}

export const useDoctorStore = create<DoctorStore>((set) => ({
  doctors: [],
  selectedDoctor: null,
  availableSlots: [],
  isLoading: false,
  error: null,
  totalDoctors: 0,
  currentPage: 1,

  searchDoctors: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.searchDoctors(filters);
      let doctorsList = [];
      let total = 0;

      if (Array.isArray(response)) {
        doctorsList = response;
        total = response.length;
      } else if (response?.data) {
        if (Array.isArray(response.data)) {
          doctorsList = response.data;
          total = response.pagination?.total || response.data.length;
        } else if (response.data.doctors) {
          doctorsList = response.data.doctors;
          total = response.data.totalDoctors || response.data.doctors.length;
        }
      }

      set({
        isLoading: false,
        doctors: doctorsList,
        totalDoctors: total,
        currentPage: filters.page || 1,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to search doctors',
      });
    }
  },

  getDoctorById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getDoctorById(id);
      set({
        isLoading: false,
        selectedDoctor: response?.data || response,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch doctor',
      });
    }
  },

  getAvailableSlots: async (doctorId, startDate, endDate) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getDoctorSlots(doctorId, startDate, endDate);
      
      // Handle the multi-day structure from real API
      let schedule = [];
      if (response?.availableSlots) {
        schedule = response.availableSlots;
      } else if (response?.data?.availableSlots) {
        schedule = response.data.availableSlots;
      } else if (Array.isArray(response)) {
        schedule = response;
      } else if (Array.isArray(response?.data)) {
        schedule = response.data;
      }

      set({
        isLoading: false,
        availableSlots: schedule,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch time slots',
      });
    }
  },

  getDoctorReviews: async (doctorId) => {
    try {
      const response = await apiService.getDoctorReviews(doctorId);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
