import axios, { AxiosInstance, AxiosError } from 'axios';
import Cookie from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

class ApiService {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      const token = Cookie.get('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;
        const isAuthRequest = originalRequest.url?.includes('/api/authenticate') || originalRequest.url?.includes('/api/auth/');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
          originalRequest._retry = true;
          if (!this.refreshTokenPromise) {
            this.refreshTokenPromise = this.refreshAccessToken();
          }
          try {
            const newToken = await this.refreshTokenPromise;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            Cookie.remove('accessToken');
            Cookie.remove('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          } finally {
            this.refreshTokenPromise = null;
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(): Promise<string> {
    const refreshToken = Cookie.get('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');
    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken });
    const { token } = response.data;
    Cookie.set('accessToken', token);
    return token;
  }

  async login(identifier: string, password: string) {
    try {
      const response = await this.client.post('/api/authenticate', {
        username: identifier,
        password: password,
        rememberMe: true
      });
      return this.handleLoginSuccess(response);
    } catch (error: any) {
      if (error.response?.status === 401) {
        try {
          const response = await this.client.post('/api/auth/login', {
            email: identifier,
            username: identifier,
            password: password
          });
          return this.handleLoginSuccess(response);
        } catch (error2: any) {
          throw error2;
        }
      }
      throw error;
    }
  }

  private handleLoginSuccess(response: any) {
    const data = response.data;
    let token = data.id_token || data.token || data.accessToken || data.idToken;
    if (!token && response.headers.authorization) {
      token = response.headers.authorization.replace('Bearer ', '');
    }
    if (token) Cookie.set('accessToken', token);
    if (data.refreshToken) Cookie.set('refreshToken', data.refreshToken);
    return data;
  }

  async logout() {
    Cookie.remove('accessToken');
    Cookie.remove('refreshToken');
    try {
      return await this.client.post('/api/auth/logout');
    } catch (e) {
      return { data: { success: true } };
    }
  }

  async register(data: any) {
    return (await this.client.post('/api/auth/register', {
      login: data.email.split('@')[0],
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      firstName: data.fullName.split(' ')[0],
      lastName: data.fullName.split(' ').slice(1).join(' '),
      langKey: 'vi',
      activated: true,
      authorities: ['ROLE_USER']
    })).data;
  }

  async getUserProfile() {
    const response = await this.client.get('/api/account');
    const data = response.data;
    console.log('Raw Account Data from Backend:', data);
    return {
      data: {
        ...data,
        fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        role: data.authorities?.includes('ROLE_ADMIN')
          ? 'ROLE_ADMIN'
          : (data.authorities && data.authorities.length > 0 ? data.authorities[0] : 'USER')
      }
    };
  }

  // Doctor & Schedule endpoints
  async searchDoctors(params: any) {
    return (await this.client.get('/api/doctors', { params })).data;
  }

  async getDoctorById(id: string) {
    return (await this.client.get(`/api/doctors/${id}`)).data;
  }

  async getDoctorSlots(doctorId: string, params: any) {
    const { date } = params; // Expecting YYYY-MM-DD

    try {
      console.log(`Fetching schedule for Doctor ID: ${doctorId} on Date: ${date}`);
      const schedulesRes = await this.client.get('/api/schedules', {
        params: { doctorId, workDate: date }
      });

      const schedules = Array.isArray(schedulesRes.data.data)
        ? schedulesRes.data.data
        : (Array.isArray(schedulesRes.data) ? schedulesRes.data : []);

      if (schedules.length === 0) {
        console.log('No schedules found for this doctor/date');
        return { data: [] };
      }

      const scheduleId = schedules[0].id;
      const slotsRes = await this.client.get('/api/time-slots', {
        params: { scheduleId }
      });

      const slots = Array.isArray(slotsRes.data.data)
        ? slotsRes.data.data
        : (Array.isArray(slotsRes.data) ? slotsRes.data : []);

      return {
        data: slots.map((slot: any) => ({
          id: slot.id,
          startTime: slot.slotTime,
          isAvailable: !(slot.booked === true || slot.isBooked === true || slot.is_booked === true)
        }))
      };
    } catch (error) {
      console.error('Error fetching slots:', error);
      return { data: [] };
    }
  }

  async getSpecialties() {
    return (await this.client.get('/api/specialties')).data;
  }

  async getHospitals() {
    return (await this.client.get('/api/hospitals')).data;
  }

  // Appointment endpoints
  async bookAppointment(data: any) {
    const formattedTime = data.appointmentTime?.length === 5
      ? `${data.appointmentTime}:00`
      : data.appointmentTime;

    return (await this.client.post('/api/appointments', {
      doctorId: Number(data.doctorId),
      timeSlotId: Number(data.timeSlotId),
      patientId: Number(data.patientId),
      appointmentDate: data.appointmentDate,
      appointmentTime: formattedTime,
      consultationType: data.consultationType,
      symptoms: data.symptoms
    })).data;
  }

  async getUserAppointments(params?: any) {
    return (await this.client.get('/api/appointments', { params })).data;
  }

  async getAllAppointments(page = 1, limit = 10, status = '') {
    try {
      return (await this.client.get('/api/admin/appointments', {
        params: { page, limit, status }
      })).data;
    } catch (e) {
      return (await this.client.get('/api/appointments', {
        params: { page, limit, status }
      })).data;
    }
  }

  async getAllUsers(page = 1, limit = 20) {
    return (await this.client.get('/api/admin/users', {
      params: { page: page - 1, limit }
    })).data;
  }

  async getAllDoctors(page = 1, limit = 20) {
    try {
      return (await this.client.get('/api/admin/doctors', {
        params: { page: page - 1, limit }
      })).data;
    } catch (e) {
      return (await this.client.get('/api/doctors', {
        params: { page: page - 1, limit }
      })).data;
    }
  }

  async updateDoctorStatus(id: string, isActive: boolean) {
    try {
      return (await this.client.put(`/api/admin/doctors/${id}/status`, { isActive })).data;
    } catch (error) {
      return (await this.client.put(`/api/admin/doctors/${id}`, { active: isActive })).data;
    }
  }

  async updateDoctor(id: string, data: any) {
    try {
      const mappedData = {
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        bio: data.bio,
        avatar: data.avatar,
        experience: data.yearsOfExperience || data.experience,
        license: data.license,
        price: data.consultationFee || data.price,
        rating: data.rating,
        reviewCount: data.reviewCount,
        specialtyId: data.specialtyId,
        hospitalId: data.hospitalId,
        active: data.active !== undefined ? data.active : true
      };
      return (await this.client.put(`/api/admin/doctors/${id}`, mappedData)).data;
    } catch (error: any) {
      return (await this.client.put(`/api/admin/doctors/${id}`, data)).data;
    }
  }

  async createDoctor(data: any) {
    const mappedData = {
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      bio: data.bio,
      avatar: data.avatar,
      experience: data.yearsOfExperience || data.experience,
      license: data.license,
      price: data.consultationFee || data.price,
      rating: data.rating,
      reviewCount: data.reviewCount,
      specialtyId: data.specialtyId,
      hospitalId: data.hospitalId,
      active: data.active !== undefined ? data.active : true
    };
    return (await this.client.post('/api/admin/doctors', mappedData)).data;
  }

  async deleteDoctor(id: string) {
    return (await this.client.delete(`/api/admin/doctors/${id}`)).data;
  }

  async getAppointmentById(id: string) {
    return (await this.client.get(`/api/appointments/${id}`)).data;
  }

  async updateAppointmentStatus(id: string, status: string) {
    try {
      return (await this.client.put(`/api/admin/appointments/${id}`, { status })).data;
    } catch (error: any) {
      try {
        const appointments = await this.getAllAppointments(1, 1000);
        const apps = Array.isArray(appointments) ? appointments : (appointments.data || appointments.content || []);
        const appointment = apps.find((a: any) => String(a.id) === String(id));
        if (appointment) {
          return (await this.client.put(`/api/admin/appointments/${id}`, { ...appointment, status })).data;
        }
        throw error;
      } catch (innerError) {
        throw innerError;
      }
    }
  }

  async getAdminDashboard() {
    try {
      const res = await this.client.get('/api/admin/dashboard');
      const statsObj = res.data?.statistics || res.data;
      if (!statsObj || !statsObj.trends) {
        return await this.calculateManualDashboardStats(statsObj || {});
      }
      return {
        totalDoctors: statsObj.totalDoctors || 0,
        totalAppointments: statsObj.totalAppointments || 0,
        totalUsers: statsObj.totalUsers || 0,
        totalRevenue: statsObj.totalRevenue || 0,
        monthlyRevenue: statsObj.monthlyRevenue || 0,
        monthlyAppointments: statsObj.monthlyAppointments || 0,
        trends: statsObj.trends || { users: '+0%', usersUp: true, appointments: '+0%', appointmentsUp: true, revenue: '+0%', revenueUp: true, doctors: '+0%', doctorsUp: true },
        appointmentStats: {
          pending: statsObj.appointmentStatuses?.PENDING || 0,
          scheduled: statsObj.appointmentStatuses?.CONFIRMED || statsObj.appointmentStatuses?.SCHEDULED || 0,
          completed: statsObj.appointmentStatuses?.COMPLETED || 0,
          cancelled: statsObj.appointmentStatuses?.CANCELLED || 0
        },
        revenueStats: statsObj.revenueStats || [],
        dailyStats: statsObj.dailyStats || []
      };
    } catch (error: any) {
      return await this.calculateManualDashboardStats();
    }
  }

  private async calculateManualDashboardStats(existingStats: any = {}) {
    try {
      const [doctorsRes, appointmentsRes, usersRes] = await Promise.all([
        this.client.get('/api/admin/doctors?limit=100').catch(() => this.client.get('/api/doctors?limit=100')).catch(() => ({ data: [] })),
        this.client.get('/api/admin/appointments?limit=100').catch(() => this.client.get('/api/appointments?limit=100')).catch(() => ({ data: [] })),
        this.client.get('/api/admin/users?limit=100').catch(() => this.client.get('/api/users?limit=100')).catch(() => ({ data: [] }))
      ]);

      const extract = (res: any) => {
        const body = res.data || res;
        if (Array.isArray(body)) return body;
        if (Array.isArray(body.content)) return body.content;
        if (Array.isArray(body.data)) return body.data;
        if (Array.isArray(body.data?.content)) return body.data.content;
        return [];
      };

      const doctors = extract(doctorsRes);
      const appointments = extract(appointmentsRes);
      const users = extract(usersRes);

      const calcTotalRevenue = (list: any[]) => list
        .filter((a: any) => (a.status || '').toUpperCase() === 'COMPLETED' || (a.status || '').toUpperCase() === 'SUCCESS')
        .reduce((sum: number, a: any) => sum + (Number(a.price) || Number(a.doctorPrice) || 50), 0);

      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dailyStats = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const count = appointments.filter((a: any) => (a.appointmentDate || a.createdAt || '').includes(dateStr)).length;
        dailyStats.push({ name: days[d.getDay()], appointments: count, fullDate: dateStr });
      }

      const now = new Date();
      const curMonth = now.getMonth();
      const curYear = now.getFullYear();
      const prevMonth = curMonth === 0 ? 11 : curMonth - 1;
      const prevYear = curMonth === 0 ? curYear - 1 : curYear;

      const isMatch = (dStr: string, m: number, y: number) => {
        if (!dStr) return false;
        const d = new Date(dStr);
        return d.getMonth() === m && d.getFullYear() === y;
      };

      const calcTrend = (list: any[], dateField: string) => {
        const cur = list.filter(item => isMatch(item[dateField] || item.createdAt, curMonth, curYear)).length;
        const prev = list.filter(item => isMatch(item[dateField] || item.createdAt, prevMonth, prevYear)).length;
        if (prev === 0) return cur > 0 ? '+100%' : '+0%';
        const pct = Math.round(((cur - prev) / prev) * 100);
        return pct >= 0 ? `+${pct}%` : `${pct}%`;
      };

      const getRevenueForMonth = (m: number, y: number) => appointments
        .filter(a => ((a.status || '').toUpperCase() === 'COMPLETED' || (a.status || '').toUpperCase() === 'SUCCESS') && isMatch(a.appointmentDate || a.createdAt, m, y))
        .reduce((sum, a) => sum + (Number(a.price) || Number(a.doctorPrice) || 50), 0);

      const curRevVal = getRevenueForMonth(curMonth, curYear);
      const prevRevVal = getRevenueForMonth(prevMonth, prevYear);
      const revenueTrendPct = prevRevVal === 0 ? (curRevVal > 0 ? '+100%' : '+0%') : `${Math.round(((curRevVal - prevRevVal) / prevRevVal) * 100)}%`;

      return {
        totalDoctors: existingStats.totalDoctors || doctors.length,
        totalAppointments: existingStats.totalAppointments || appointments.length,
        totalUsers: existingStats.totalUsers || users.length,
        totalRevenue: calcTotalRevenue(appointments),
        monthlyRevenue: curRevVal,
        monthlyAppointments: appointments.filter((a: any) => isMatch(a.appointmentDate || a.createdAt, curMonth, curYear)).length,
        trends: {
          users: calcTrend(users, 'createdAt'),
          usersUp: !calcTrend(users, 'createdAt').startsWith('-'),
          appointments: calcTrend(appointments, 'appointmentDate'),
          appointmentsUp: !calcTrend(appointments, 'appointmentDate').startsWith('-'),
          revenue: revenueTrendPct.startsWith('-') ? revenueTrendPct : `+${revenueTrendPct}`,
          revenueUp: !revenueTrendPct.startsWith('-'),
          doctors: calcTrend(doctors, 'createdAt'),
          doctorsUp: !calcTrend(doctors, 'createdAt').startsWith('-')
        },
        appointmentStats: {
          pending: appointments.filter((a: any) => (a.status || '').toUpperCase() === 'PENDING').length,
          scheduled: appointments.filter((a: any) => (a.status || '').toUpperCase() === 'CONFIRMED' || (a.status || '').toUpperCase() === 'SCHEDULED').length,
          completed: appointments.filter((a: any) => (a.status || '').toUpperCase() === 'COMPLETED').length,
          cancelled: appointments.filter((a: any) => (a.status || '').toUpperCase() === 'CANCELLED').length
        },
        revenueStats: [{ month: 'Last Month', revenue: prevRevVal }, { month: 'This Month', revenue: curRevVal }],
        dailyStats
      };
    } catch (e: any) {
      return { totalDoctors: 0, totalAppointments: 0, totalUsers: 0, totalRevenue: 0 };
    }
  }
}

export const apiService = new ApiService();
