'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function MedicalRecordsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    recordType: 'REPORT',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    // Fetch medical records
    setIsLoading(false);
  }, [isAuthenticated, router]);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      toast({
        title: 'Success',
        description: 'Medical record added successfully',
      });
      setShowAddForm(false);
      setFormData({ title: '', description: '', recordType: 'REPORT' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add medical record',
        variant: 'destructive',
      });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Medical Records
              </h1>
              <p className="text-gray-600">Manage your medical documents and reports</p>
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus size={18} />
              Add Record
            </Button>
          </div>

          {/* Add Record Form */}
          {showAddForm && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <form onSubmit={handleAddRecord} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="block text-sm font-medium">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="e.g., Lab Report"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-medium">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Describe the record..."
                      className="w-full px-3 py-2 border rounded-md"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="recordType" className="block text-sm font-medium">
                      Record Type
                    </label>
                    <select
                      id="recordType"
                      value={formData.recordType}
                      onChange={(e) =>
                        setFormData({ ...formData, recordType: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="REPORT">Medical Report</option>
                      <option value="PRESCRIPTION">Prescription</option>
                      <option value="LAB_TEST">Lab Test</option>
                      <option value="IMAGING">Imaging</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Save Record
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Records List */}
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600">Loading medical records...</p>
              </CardContent>
            </Card>
          ) : records.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No medical records</h3>
                <p className="text-gray-600 mb-6">
                  You don&apos;t have any medical records yet. Add your first record now.
                </p>
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Add Medical Record
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {records.map((record: any) => (
                <Card key={record.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <FileText size={32} className="text-blue-600 mt-1" />
                        <div>
                          <h3 className="font-semibold text-lg">{record.title}</h3>
                          <p className="text-gray-600 text-sm mb-2">
                            {record.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded">
                              {record.recordType}
                            </span>
                            <span className="text-gray-500">
                              {new Date(record.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="gap-2">
                          <Download size={16} />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
