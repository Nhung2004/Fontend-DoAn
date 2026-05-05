'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Download, 
  Filter,
  ArrowUpRight,
  Users,
  Activity
} from 'lucide-react';
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
  Legend,
  LineChart,
  Line
} from 'recharts';

export default function AdminStatisticsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('MONTH'); // DAY, MONTH, YEAR

  useEffect(() => {
    if (!isInitialized) return;
    const role = user?.role?.toUpperCase();
    if (!isAuthenticated || (role !== 'ADMIN' && role !== 'ROLE_ADMIN')) {
      router.push('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await apiService.getAdminDashboard();
        setData(response?.data || response);
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated, user?.role, router]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const role = user?.role?.toUpperCase();
  if (!isAuthenticated || (role !== 'ADMIN' && role !== 'ROLE_ADMIN')) {
    return null;
  }

  // Mock data for comparison if backend data is sparse
  const dailyData = data?.dailyStats || [
    { name: 'Mon', appointments: 12, previous: 10 },
    { name: 'Tue', appointments: 19, previous: 15 },
    { name: 'Wed', appointments: 15, previous: 18 },
    { name: 'Thu', appointments: 22, previous: 20 },
    { name: 'Fri', appointments: 30, previous: 25 },
    { name: 'Sat', appointments: 25, previous: 30 },
    { name: 'Sun', appointments: 10, previous: 12 },
  ];

  const monthlyData = data?.revenueStats?.map((item: any) => ({
    name: item.month,
    appointments: Math.round(item.revenue / 10000), // Approximate appointments for visual
    revenue: item.revenue
  })) || [
    { name: 'Jan', appointments: 120, revenue: 4500 },
    { name: 'Feb', appointments: 150, revenue: 5200 },
    { name: 'Mar', appointments: 200, revenue: 7800 },
    { name: 'Apr', appointments: 180, revenue: 6500 },
    { name: 'May', appointments: 250, revenue: 9000 },
    { name: 'Jun', appointments: 300, revenue: 12000 },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <BarChart3 className="text-primary w-10 h-10" />
                Advanced Analytics
              </h1>
              <p className="text-slate-500 font-medium mt-2">Comprehensive comparison of hospital performance across time</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-xl border-slate-200 bg-white">
                <Download className="w-4 h-4 mr-2" /> Export JSON
              </Button>
              <Button className="rounded-xl shadow-lg shadow-primary/20">
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </Button>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex justify-center mb-10">
            <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 flex gap-1">
              {[
                { id: 'DAY', label: 'Daily View', icon: Activity },
                { id: 'MONTH', label: 'Monthly Trend', icon: Calendar },
                { id: 'YEAR', label: 'Yearly Overview', icon: TrendingUp }
              ].map((range) => (
                <button
                  key={range.id}
                  onClick={() => setTimeRange(range.id)}
                  className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                    timeRange === range.id 
                      ? 'bg-primary text-white shadow-lg' 
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <range.icon size={18} />
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Comparison Chart */}
            <Card className="lg:col-span-2 border-0 shadow-sm overflow-hidden">
              <div className="bg-blue-600 h-1.5 w-full" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-2xl font-black">Performance Comparison</CardTitle>
                  <CardDescription>Appointments: Current Period vs Previous Period</CardDescription>
                </div>
                <Badge className="bg-blue-100 text-blue-600 border-0 font-black">+18.5% Growth</Badge>
              </CardHeader>
              <CardContent className="h-[450px] pt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeRange === 'DAY' ? dailyData : monthlyData}>
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
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px'}}
                    />
                    <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                    <Bar 
                      name="Current Period" 
                      dataKey="appointments" 
                      fill="#3B82F6" 
                      radius={[6, 6, 0, 0]} 
                      barSize={timeRange === 'DAY' ? 40 : 60} 
                    />
                    <Bar 
                      name="Previous Period" 
                      dataKey={timeRange === 'DAY' ? "previous" : "revenue"} 
                      fill="#E2E8F0" 
                      radius={[6, 6, 0, 0]} 
                      barSize={timeRange === 'DAY' ? 40 : 60} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Side Stats */}
            <div className="space-y-6">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Quick Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <Users size={20} className="text-blue-400" />
                      </div>
                      <span className="font-bold">New Patients</span>
                    </div>
                    <span className="text-xl font-black">+42</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <Calendar size={20} className="text-emerald-400" />
                      </div>
                      <span className="font-bold">Conversion Rate</span>
                    </div>
                    <span className="text-xl font-black">78%</span>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-xs text-slate-400 uppercase font-black mb-4 tracking-widest">Growth Progress</p>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[78%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Trend */}
              <Card className="border-0 shadow-sm overflow-hidden">
                <div className="bg-emerald-500 h-1.5 w-full" />
                <CardHeader>
                  <CardTitle className="text-lg">Revenue Growth</CardTitle>
                </CardHeader>
                <CardContent className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorGreen)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Detailed Summary Table */}
          <Card className="mt-8 border-0 shadow-sm overflow-hidden">
            <div className="bg-slate-200 h-1 w-full" />
            <CardHeader>
              <CardTitle>Detailed Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-4 font-black text-slate-400 uppercase text-xs tracking-widest">Time Period</th>
                      <th className="pb-4 font-black text-slate-400 uppercase text-xs tracking-widest">Appointments</th>
                      <th className="pb-4 font-black text-slate-400 uppercase text-xs tracking-widest">Revenue</th>
                      <th className="pb-4 font-black text-slate-400 uppercase text-xs tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((row, i) => (
                      <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 font-bold text-slate-900">{row.name} 2026</td>
                        <td className="py-4 font-black text-blue-600">{row.appointments}</td>
                        <td className="py-4 font-black text-slate-900">${row.revenue.toLocaleString()}</td>
                        <td className="py-4">
                          <Badge className="bg-emerald-50 text-emerald-600 border-0">High Growth</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
