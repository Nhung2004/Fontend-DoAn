'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
    dateOfBirth: user?.dateOfBirth || '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

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
      // Call API to update profile
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-foreground mb-3">My Profile</h1>
            <p className="text-lg text-foreground/60">Update and manage your personal information</p>
          </div>

          {/* Profile Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-secondary/5 p-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Personal Information</CardTitle>
                  <p className="text-foreground/60 text-sm mt-1">View and edit your details</p>
                </div>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`${isEditing ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'}`}
                >
                  {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-8 pb-8">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="fullName" className="block text-sm font-semibold text-foreground">
                        Full Name
                      </label>
                      <Input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="bg-muted/50 border-muted focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-semibold text-foreground">
                        Email (Read-Only)
                      </label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="bg-muted/50 border-muted"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="phoneNumber" className="block text-sm font-semibold text-foreground">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="bg-muted/50 border-muted focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-foreground">
                        Date of Birth
                      </label>
                      <Input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="bg-muted/50 border-muted focus:border-primary"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label htmlFor="address" className="block text-sm font-semibold text-foreground">
                        Address
                      </label>
                      <Input
                        type="text"
                        id="address"
                        name="address"
                        placeholder="Street address, city, state"
                        value={formData.address}
                        onChange={handleChange}
                        className="bg-muted/50 border-muted focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 border-t">
                    <Button
                      type="submit"
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="flex items-start gap-4 p-5 bg-primary/5 rounded-lg border border-primary/10">
                      <User size={24} className="text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-foreground/60 uppercase">Full Name</p>
                        <p className="text-lg font-bold text-foreground mt-1">{user.fullName}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-5 bg-secondary/5 rounded-lg border border-secondary/10">
                      <Mail size={24} className="text-secondary mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-foreground/60 uppercase">Email</p>
                        <p className="text-lg font-bold text-foreground mt-1">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-5 bg-accent/5 rounded-lg border border-accent/10">
                      <Phone size={24} className="text-accent mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-foreground/60 uppercase">Phone Number</p>
                        <p className="text-lg font-bold text-foreground mt-1">{user.phoneNumber || 'Not set'}</p>
                      </div>
                    </div>

                    {user.dateOfBirth && (
                      <div className="flex items-start gap-4 p-5 bg-primary/5 rounded-lg border border-primary/10">
                        <Calendar size={24} className="text-primary mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-foreground/60 uppercase">Date of Birth</p>
                          <p className="text-lg font-bold text-foreground mt-1">
                            {new Date(user.dateOfBirth).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {user.address && (
                      <div className="flex items-start gap-4 p-5 bg-secondary/5 rounded-lg border border-secondary/10 md:col-span-2">
                        <MapPin size={24} className="text-secondary mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-foreground/60 uppercase">Address</p>
                          <p className="text-lg font-bold text-foreground mt-1">{user.address}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-8 border-t">
                    <p className="text-xs font-semibold text-foreground/60 uppercase mb-3">Account Status</p>
                    <div className="flex items-center gap-3">
                      <span className="inline-block w-3 h-3 bg-secondary rounded-full animate-pulse"></span>
                      <span className="font-semibold text-foreground">Active and Verified</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medical Records Link */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow mt-8">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-foreground">Medical Records</h3>
                  <p className="text-foreground/60 mt-1">View and manage your medical documents</p>
                </div>
                <Link href="/medical-records">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">View Records</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
