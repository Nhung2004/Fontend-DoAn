'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, MapPin, Calendar, Camera, ShieldCheck, Activity, Edit2, X, Save, HeartPulse, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { apiService } from '@/services/api';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    healthInsurance: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user.gender || '',
        healthInsurance: user.healthInsurance || '',
      });
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Call API to update user profile using the regular user endpoint
      await apiService.updateMyProfile({ ...user, ...formData });
      
      // Refresh user data in store to reflect changes on UI
      await useAuthStore.getState().getUserProfile();
      
      toast({
        title: 'Profile Updated',
        description: 'Your personal information has been saved successfully.',
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'There was an error saving your changes. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      {/* Premium Banner */}
      <div className="h-64 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Avatar & Quick Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden backdrop-blur-sm bg-white/95">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="relative group mb-6">
                  <div className="w-40 h-40 rounded-full border-4 border-white shadow-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-6xl font-black text-blue-600 tracking-tighter">
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                      </span>
                    )}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-2 right-2 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors">
                      <Camera size={18} />
                    </button>
                  )}
                </div>
                
                <h1 className="text-2xl font-black text-slate-900 mb-1">{user.fullName || 'User Name'}</h1>
                <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-6">
                  {user.role === 'ROLE_ADMIN' ? 'Administrator' : 'Patient Account'}
                </p>

                <div className="w-full h-px bg-slate-100 mb-6"></div>

                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full font-semibold text-sm">
                  <ShieldCheck size={16} />
                  Verified Account
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                    <Activity size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Medical Records</h3>
                    <p className="text-blue-100 text-sm">Access your history</p>
                  </div>
                </div>
                <Link href="/medical-records">
                  <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-xl mt-4">
                    View Records
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Detailed Info Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
              <div className="bg-white px-8 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Personal Details</h2>
                  <p className="text-slate-500 font-medium text-sm mt-1">Manage your contact and personal information</p>
                </div>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? 'outline' : 'default'}
                  className={`rounded-xl font-bold px-6 ${
                    isEditing 
                      ? 'border-rose-200 text-rose-600 hover:bg-rose-50' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200'
                  }`}
                >
                  {isEditing ? (
                    <><X size={16} className="mr-2" /> Cancel</>
                  ) : (
                    <><Edit2 size={16} className="mr-2" /> Edit Profile</>
                  )}
                </Button>
              </div>

              <CardContent className="p-8 bg-slate-50/50">
                <form onSubmit={handleSubmit}>
                  <div className="grid md:grid-cols-2 gap-8">
                    
                    {/* Full Name */}
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <User size={14} /> Full Name
                      </label>
                      {isEditing ? (
                        <Input
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          className="h-12 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-blue-600 font-medium"
                          placeholder="Enter your full name"
                        />
                      ) : (
                        <div className="h-12 flex items-center px-4 bg-white border border-slate-100 rounded-xl text-slate-900 font-semibold shadow-sm">
                          {user.fullName || 'Not provided'}
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Mail size={14} /> Email Address
                      </label>
                      {isEditing ? (
                        <Input
                          name="email"
                          value={formData.email}
                          disabled
                          className="h-12 rounded-xl border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed font-medium"
                        />
                      ) : (
                        <div className="h-12 flex items-center px-4 bg-white border border-slate-100 rounded-xl text-slate-900 font-semibold shadow-sm">
                          {user.email || 'Not provided'}
                        </div>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Phone size={14} /> Phone Number
                      </label>
                      {isEditing ? (
                        <Input
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          className="h-12 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-blue-600 font-medium"
                          placeholder="+1 (555) 000-0000"
                        />
                      ) : (
                        <div className="h-12 flex items-center px-4 bg-white border border-slate-100 rounded-xl text-slate-900 font-semibold shadow-sm">
                          {user.phoneNumber || 'Not provided'}
                        </div>
                      )}
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={14} /> Date of Birth
                      </label>
                      {isEditing ? (
                        <Input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          className="h-12 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-blue-600 font-medium"
                        />
                      ) : (
                        <div className="h-12 flex items-center px-4 bg-white border border-slate-100 rounded-xl text-slate-900 font-semibold shadow-sm">
                          {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not provided'}
                        </div>
                      )}
                    </div>

                    {/* Gender */}
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <UserCircle size={14} /> Gender
                      </label>
                      {isEditing ? (
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={(e: any) => handleChange(e)}
                          className="w-full h-12 px-3 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-blue-600 font-medium"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      ) : (
                        <div className="h-12 flex items-center px-4 bg-white border border-slate-100 rounded-xl text-slate-900 font-semibold shadow-sm capitalize">
                          {user.gender || 'Not provided'}
                        </div>
                      )}
                    </div>

                    {/* Health Insurance */}
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <HeartPulse size={14} /> Health Insurance
                      </label>
                      {isEditing ? (
                        <Input
                          name="healthInsurance"
                          value={formData.healthInsurance}
                          onChange={handleChange}
                          className="h-12 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-blue-600 font-medium"
                          placeholder="e.g. BH123456789"
                        />
                      ) : (
                        <div className="h-12 flex items-center px-4 bg-white border border-slate-100 rounded-xl text-slate-900 font-semibold shadow-sm">
                          {user.healthInsurance || 'Not provided'}
                        </div>
                      )}
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2 space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <MapPin size={14} /> Home Address
                      </label>
                      {isEditing ? (
                        <Input
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className="h-12 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-blue-600 font-medium"
                          placeholder="Street address, city, state, ZIP"
                        />
                      ) : (
                        <div className="min-h-12 flex items-center px-4 py-3 bg-white border border-slate-100 rounded-xl text-slate-900 font-semibold shadow-sm break-words">
                          {user.address || 'Not provided'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Save Actions */}
                  {isEditing && (
                    <div className="mt-10 flex items-center gap-4 pt-6 border-t border-slate-200">
                      <Button
                        type="submit"
                        className="flex-1 h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-200"
                      >
                        <Save className="mr-2" /> Save Changes
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
