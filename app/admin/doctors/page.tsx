'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star } from 'lucide-react';
import { apiService } from '@/services/api';

export default function AdminDoctorsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isInitialized) return;
    const role = user?.role?.toUpperCase();
    if (!isAuthenticated || (role !== 'ADMIN' && role !== 'ROLE_ADMIN')) {
      return;
    }

    const fetchDoctors = async () => {
      try {
        const response = await apiService.getAllDoctors(page, 10);
        let docsList = [];
        if (Array.isArray(response)) docsList = response;
        else if (Array.isArray(response?.data)) docsList = response.data;
        else if (response?.data?.doctors) docsList = response.data.doctors;
        else if (response?.doctors) docsList = response.doctors;
        
        setDoctors(docsList);
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, [isAuthenticated, user?.role, router, page]);

  const handleStatusUpdate = async (doctorId: string, isActive: boolean) => {
    try {
      await apiService.updateDoctorStatus(doctorId, !isActive);
      setDoctors(
        doctors.map((d) =>
          d.id === doctorId ? { ...d, isAvailable: !isActive } : d
        )
      );
    } catch (error) {
      console.error('Failed to update doctor status:', error);
    }
  };

  const filteredDoctors = doctors.filter(
    (d) =>
      d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const role = user?.role?.toUpperCase();
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (!isAuthenticated || (role !== 'ADMIN' && role !== 'ROLE_ADMIN')) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Doctor Management
            </h1>
            <p className="text-gray-600">Manage doctor profiles and availability</p>
          </div>

          {/* Search */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Input
                  placeholder="Search by name or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline">Search</Button>
              </div>
            </CardContent>
          </Card>

          {/* Doctors Table */}
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600">Loading doctors...</p>
              </CardContent>
            </Card>
          ) : filteredDoctors.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600">No doctors found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredDoctors.map((doctor) => (
                <Card key={doctor.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold text-lg">
                            {doctor.fullName}
                          </h3>
                          <span className="text-blue-600 font-medium">
                            {doctor.specialization}
                          </span>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              doctor.isAvailable
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {doctor.isAvailable ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                          <div>
                            <p className="text-gray-600">Qualification</p>
                            <p className="font-medium">{doctor.qualification}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Experience</p>
                            <p className="font-medium">
                              {doctor.yearsOfExperience} years
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Fee</p>
                            <p className="font-medium">
                              ${doctor.consultationFee}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Rating</p>
                            <div className="flex items-center gap-1">
                              <Star size={16} className="fill-yellow-400 text-yellow-400" />
                              <p className="font-medium">{doctor.rating || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="outline">
                          View Profile
                        </Button>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            doctor.isAvailable ? 'destructive' : 'default'
                          }
                          onClick={() =>
                            handleStatusUpdate(doctor.id, doctor.isAvailable)
                          }
                        >
                          {doctor.isAvailable ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && doctors.length > 0 && (
            <div className="flex justify-between items-center mt-8">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-gray-600">Page {page}</span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
