'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const errors: { [key: string]: string } = {};
    if (!formData.fullName) errors.fullName = 'Full name is required';
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!formData.phoneNumber) errors.phoneNumber = 'Phone number is required';
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phoneNumber: formData.phoneNumber,
      });
      toast({
        title: 'Success',
        description: 'Registration successful! Please login.',
      });
      router.push('/login');
    } catch (err) {
      toast({
        title: 'Registration Failed',
        description: error || 'Please try again',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] relative overflow-hidden py-12">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10 px-4">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl text-primary shadow-2xl shadow-primary/20 -rotate-3 hover:rotate-0 transition-transform duration-500 group">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-4xl">
              S
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Join <span className="text-primary">Sunrise</span>
          </h1>
          <p className="text-slate-500 font-medium">Create your premium health account</p>
        </div>

        {/* Register Card */}
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl rounded-[2rem] overflow-hidden">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-2xl font-black text-slate-900">Sign Up</CardTitle>
            <CardDescription className="text-slate-500 font-medium">Fill in your details to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="fullName" className="block text-sm font-bold text-slate-700 ml-1">
                  Full Name
                </label>
                <Input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`bg-slate-50/50 border-slate-100 focus:border-primary h-12 rounded-xl transition-all ${
                    fieldErrors.fullName ? 'border-rose-300 bg-rose-50/30 focus:border-rose-400' : ''
                  }`}
                />
                {fieldErrors.fullName && (
                  <p className="text-xs font-bold text-rose-500 ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
                    {fieldErrors.fullName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-bold text-slate-700 ml-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`bg-slate-50/50 border-slate-100 focus:border-primary h-12 rounded-xl transition-all ${
                    fieldErrors.email ? 'border-rose-300 bg-rose-50/30 focus:border-rose-400' : ''
                  }`}
                />
                {fieldErrors.email && (
                  <p className="text-xs font-bold text-rose-500 ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="phoneNumber" className="block text-sm font-bold text-slate-700 ml-1">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`bg-slate-50/50 border-slate-100 focus:border-primary h-12 rounded-xl transition-all ${
                    fieldErrors.phoneNumber ? 'border-rose-300 bg-rose-50/30 focus:border-rose-400' : ''
                  }`}
                />
                {fieldErrors.phoneNumber && (
                  <p className="text-xs font-bold text-rose-500 ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
                    {fieldErrors.phoneNumber}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-bold text-slate-700 ml-1">
                    Password
                  </label>
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`bg-slate-50/50 border-slate-100 focus:border-primary h-12 rounded-xl transition-all ${
                      fieldErrors.password ? 'border-rose-300 bg-rose-50/30 focus:border-rose-400' : ''
                    }`}
                  />
                  {fieldErrors.password && (
                    <p className="text-xs font-bold text-rose-500 ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-700 ml-1">
                    Confirm
                  </label>
                  <Input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`bg-slate-50/50 border-slate-100 focus:border-primary h-12 rounded-xl transition-all ${
                      fieldErrors.confirmPassword ? 'border-rose-300 bg-rose-50/30 focus:border-rose-400' : ''
                    }`}
                  />
                  {fieldErrors.confirmPassword && (
                    <p className="text-xs font-bold text-rose-500 ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-black py-6 rounded-2xl shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating account...
                  </div>
                ) : 'Create Account'}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black text-slate-400">
                  <span className="bg-white px-3">Already a member?</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-slate-200 h-12 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
                onClick={() => router.push('/login')}
              >
                Sign In instead
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm">
          <p className="text-slate-500 font-medium">
            By joining, you agree to our{' '}
            <Link href="#" className="font-bold text-slate-900 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
