'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Shield, Users, Star, MapPin, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
        {/* Hero Section */}
        <section className="relative px-4 py-20 md:py-32">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div>
                  <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                    Healthcare at Your Fingertips
                  </h1>
                  <p className="text-xl text-foreground/70 leading-relaxed">
                    Book appointments with expert doctors instantly. No waiting, no hassle, just quality healthcare when you need it.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    onClick={() => router.push('/doctors')}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Find a Doctor
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => router.push('/register')}
                  >
                    Get Started
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-8 border-t">
                  <div>
                    <p className="text-2xl font-bold text-primary">500+</p>
                    <p className="text-sm text-foreground/60">Doctors</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">10K+</p>
                    <p className="text-sm text-foreground/60">Patients</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">50+</p>
                    <p className="text-sm text-foreground/60">Specialties</p>
                  </div>
                </div>
              </div>

              <div className="relative h-80 md:h-96">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-card rounded-3xl border p-8 h-full flex flex-col items-center justify-center shadow-lg">
                  <div className="text-center">
                    <Calendar size={80} className="mx-auto text-primary mb-4" />
                    <h3 className="text-2xl font-bold text-foreground mb-2">Easy Scheduling</h3>
                    <p className="text-foreground/60">Book in seconds, get confirmed instantly</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-20 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">Why Choose MedBook?</h2>
              <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
                We&apos;ve made healthcare booking simple, secure, and accessible to everyone
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="bg-primary/10 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Quick Booking</h3>
                  <p className="text-foreground/60">
                    Schedule appointments in minutes with our intuitive booking system
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="bg-secondary/10 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="w-7 h-7 text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Secure & Private</h3>
                  <p className="text-foreground/60">
                    Your health data is encrypted and protected with industry-standard security
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="bg-accent/10 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                    <Users className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Expert Doctors</h3>
                  <p className="text-foreground/60">
                    Choose from hundreds of qualified healthcare professionals
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-foreground text-center mb-16">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { icon: MapPin, title: 'Find', desc: 'Search doctors by specialty' },
                { icon: Star, title: 'Check', desc: 'View reviews and experience' },
                { icon: Calendar, title: 'Book', desc: 'Choose your preferred time' },
                { icon: Clock, title: 'Confirm', desc: 'Get instant confirmation' },
              ].map((step, i) => (
                <div key={i} className="relative">
                  <div className="text-center">
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-foreground/60">{step.desc}</p>
                  </div>
                  {i < 3 && (
                    <div className="hidden md:block absolute top-8 right-0 w-8 h-1 bg-primary/20 transform translate-x-16"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-20 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Ready to book your appointment?
            </h2>
            <p className="text-lg text-foreground/60 mb-8 max-w-2xl mx-auto">
              Join thousands of patients who trust MedBook for their healthcare needs. Start your journey to better health today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => router.push('/doctors')}
                className="bg-primary text-primary-foreground"
              >
                Browse Doctors
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push('/register')}
              >
                Create Account
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-primary/5 border-t px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-foreground mb-4">MedBook</h3>
                <p className="text-sm text-foreground/60">Your trusted healthcare companion</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4 text-sm">Product</h4>
                <ul className="space-y-2 text-sm text-foreground/60">
                  <li><a href="#" className="hover:text-primary">Features</a></li>
                  <li><a href="#" className="hover:text-primary">Pricing</a></li>
                  <li><a href="#" className="hover:text-primary">Security</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4 text-sm">Company</h4>
                <ul className="space-y-2 text-sm text-foreground/60">
                  <li><a href="#" className="hover:text-primary">About</a></li>
                  <li><a href="#" className="hover:text-primary">Blog</a></li>
                  <li><a href="#" className="hover:text-primary">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4 text-sm">Legal</h4>
                <ul className="space-y-2 text-sm text-foreground/60">
                  <li><a href="#" className="hover:text-primary">Privacy</a></li>
                  <li><a href="#" className="hover:text-primary">Terms</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t pt-8 text-center text-sm text-foreground/60">
              <p>&copy; 2024 MedBook. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
