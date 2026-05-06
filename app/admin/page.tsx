'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
  Stethoscope,
  Activity,
  ArrowRight,
  Search,
  Bell,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { apiService } from '@/services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAppeared, setHasAppeared] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAppeared(true);
          observer.disconnect(); // Only animate once
        }
      },
      { threshold: 0.2 }
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const role = user?.role?.toUpperCase();
    const hasAccess = role === 'ADMIN' || role === 'ROLE_ADMIN' || role === 'DOCTOR' || role === 'ROLE_DOCTOR';

    if (!isInitialized) return;

    if (!isAuthenticated || !hasAccess) {
      router.push('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await apiService.getAdminDashboard();
        setStats(response?.data || response);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated, user?.role, router]);

  const role = user?.role?.toUpperCase();
  const hasAccess = role === 'ADMIN' || role === 'ROLE_ADMIN' || role === 'DOCTOR' || role === 'ROLE_DOCTOR';

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !hasAccess) {
    return null;
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  const appointmentPieData = stats?.appointmentStats ? [
    { name: 'Pending', value: stats.appointmentStats.pending },
    { name: 'Scheduled', value: stats.appointmentStats.scheduled },
    { name: 'Completed', value: stats.appointmentStats.completed },
    { name: 'Cancelled', value: stats.appointmentStats.cancelled },
  ] : [];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F1F5F9]">
        <div className="max-w-[1600px] mx-auto px-4 py-8 md:py-12">
          {/* Admin Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black">S</div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 font-bold uppercase tracking-widest text-[10px]">Administrator</Badge>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                Command <span className="text-blue-600">Center</span>
              </h1>
              <p className="text-slate-500 font-medium">Monitoring Sunrise Hospital performance and operations</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <Input placeholder="Search everything..." className="pl-10 w-64 rounded-2xl bg-white border-slate-200 h-12 focus:ring-blue-600 transition-all shadow-sm" />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="rounded-2xl bg-white border-slate-200 h-12 w-12 shadow-sm hover:bg-slate-50">
                  <Bell className="w-5 h-5 text-slate-600" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-2xl bg-white border-slate-200 h-12 w-12 shadow-sm hover:bg-slate-50">
                  <Settings className="w-5 h-5 text-slate-600" />
                </Button>
              </div>
              <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden md:block" />
              <Button className="rounded-2xl h-12 px-6 shadow-xl shadow-blue-600/20 bg-blue-600 hover:bg-blue-700 font-bold">
                <TrendingUp className="w-4 h-4 mr-2" /> Export Analytics
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { label: 'Total Patients', value: stats?.totalUsers || 0, icon: Users, trend: '+12%', isUp: true, color: 'blue' },
              { label: 'Total Appointments', value: stats?.totalAppointments || 0, icon: Calendar, trend: '+8%', isUp: true, color: 'emerald' },
              { label: 'Platform Revenue', value: `$${((stats?.totalRevenue || 0) / 1000).toFixed(1)}K`, icon: DollarSign, trend: '-2%', isUp: false, color: 'amber' },
              { label: 'Doctor Availability', value: stats?.totalDoctors || 0, icon: Stethoscope, trend: '+5%', isUp: true, color: 'violet' },
            ].map((metric, i) => (
              <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-all overflow-hidden relative group">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl bg-${metric.color}-50 text-${metric.color}-600 group-hover:scale-110 transition-transform`}>
                      <metric.icon size={24} />
                    </div>
                    <Badge variant="outline" className={`border-none ${metric.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} flex items-center gap-1`}>
                      {metric.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {metric.trend}
                    </Badge>
                  </div>
                  <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{metric.label}</h3>
                  <p className="text-3xl font-black text-slate-900">{metric.value}</p>
                </CardContent>
                <div className={`absolute bottom-0 left-0 w-full h-1 bg-${metric.color}-500/20`} />
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-10">
            {/* Revenue Chart */}
            <Card className="lg:col-span-2 border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Revenue Analytics</CardTitle>
                  <CardDescription>Monthly revenue growth and projections</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-blue-100 text-blue-700 border-0">Monthly</Badge>
                  <Badge variant="outline" className="text-slate-400">Yearly</Badge>
                </div>
              </CardHeader>
              <CardContent className="h-[350px]">
                {isLoading ? (
                  <div className="w-full h-full bg-slate-50 rounded-xl animate-pulse" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.revenueStats || []}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        cursor={{ stroke: '#3B82F6', strokeWidth: 2 }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Appointment Distribution */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Appointment Status</CardTitle>
                <CardDescription>Distribution by current state</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isLoading ? (
                  <div className="w-full h-full bg-slate-50 rounded-xl animate-pulse" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={appointmentPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {appointmentPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4">
                  {appointmentPieData.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-xs font-bold text-slate-600">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div ref={chartRef}>
            <Card className="border-0 shadow-sm mb-10 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-1.5 w-full" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl font-black">Weekly Engagement</CardTitle>
                <CardDescription>Daily appointment volume for the current week</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                  <Activity size={14} /> Peak: Friday
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[350px] pt-6">
              {isLoading ? (
                <div className="w-full h-full bg-slate-50 rounded-xl animate-pulse" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.dailyStats || []}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#6366F1" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748B', fontSize: 12, fontWeight: 700}} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748B', fontSize: 12, fontWeight: 700}} 
                    />
                    <Tooltip 
                      contentStyle={{
                        borderRadius: '16px', 
                        border: 'none', 
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                        padding: '12px'
                      }}
                      cursor={{fill: '#F8FAFC', radius: 12}}
                    />
                    <Bar 
                      dataKey="appointments" 
                      fill="url(#barGradient)" 
                      radius={[10, 10, 0, 0]} 
                      barSize={45}
                      isAnimationActive={hasAppeared}
                      animationDuration={1500}
                      animationBegin={200}
                    >
                      {(stats?.dailyStats || []).map((entry: any, index: number) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fillOpacity={0.8 + (index * 0.03)} 
                          className="hover:fill-opacity-100 transition-all duration-300 cursor-pointer"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

          {/* Operational Management */}
          <h2 className="text-2xl font-black text-slate-900 mb-6">Operations Management</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'User Base', desc: 'Patients and medical staff', link: '/admin/users', icon: UserCheck, color: 'blue' },
              { title: 'Specialists', desc: 'Doctor profiles & schedules', link: '/admin/doctors', icon: Stethoscope, color: 'emerald' },
              { title: 'Appointments', desc: 'Booking logs & status', link: '/admin/appointments', icon: Calendar, color: 'amber' },
              { title: 'Analytics', desc: 'Detailed business reports', link: '/admin/statistics', icon: Activity, color: 'rose' },
            ].map((item, i) => (
              <Card key={i} className="border-0 shadow-sm hover:translate-y-[-4px] transition-all group cursor-pointer">
                <Link href={item.link}>
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 rounded-2xl bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform`}>
                      <item.icon size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-500 mb-4">{item.desc}</p>
                    <div className="flex items-center text-primary font-bold text-sm">
                      Access Module <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
