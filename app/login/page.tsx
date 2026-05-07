'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    if (!formData.email) errors.email = 'Email or username is required';
    if (!formData.password) errors.password = 'Password is required';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      console.log('Attempting login with:', formData.email);
      // Clear any existing session before logging in
      await useAuthStore.getState().logout();
      
      await login(formData.email, formData.password);
      console.log('Login successful');

      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });
      const currentUser = useAuthStore.getState().user;
      const role = currentUser?.role?.toUpperCase();
      console.log('Redirecting based on role:', role);
      
      if (role === 'ADMIN' || role === 'ROLE_ADMIN') {
        router.push('/admin');
      } else if (role === 'DOCTOR' || role === 'ROLE_DOCTOR') {
        router.push('/doctor-dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error detail:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Please check your credentials';
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-blue-400/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10 px-4">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl text-primary shadow-2xl shadow-primary/20 rotate-3 hover:rotate-0 transition-transform duration-500 group">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-4xl">
              S
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Sunrise <span className="text-primary">Hospital</span>
          </h1>
          <p className="text-slate-500 font-medium">Welcome back to your health companion</p>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl rounded-[2rem] overflow-hidden">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-2xl font-black text-slate-900">Sign In</CardTitle>
            <CardDescription className="text-slate-500 font-medium">Enter your credentials to access your portal</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-bold text-slate-700 ml-1">
                  Username or Email
                </label>
                <Input
                  type="text"
                  id="email"
                  name="email"
                  placeholder="name@example.com"
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
                <div className="flex items-center justify-between ml-1">
                  <label htmlFor="password" className="text-sm font-bold text-slate-700">
                    Password
                  </label>
                  <Link href="#" className="text-xs text-primary font-bold hover:underline">
                    Forgot?
                  </Link>
                </div>
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

              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold animate-in fade-in slide-in-from-top-1">
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
                    Signing in...
                  </div>
                ) : 'Continue'}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black text-slate-400">
                  <span className="bg-white px-3">New to Sunrise?</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-slate-200 h-12 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
                onClick={() => router.push('/register')}
              >
                Create an account
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm">
          <p className="text-slate-500 font-medium">
            By signing in, you agree to our{' '}
            <Link href="#" className="font-bold text-slate-900 hover:underline">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
