'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Phone, User as UserIcon, Shield, CheckCircle, Save, Trash2 } from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle } from 'lucide-react';

export default function AdminUsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Error Alert State
  const [isErrorAlertOpen, setIsErrorAlertOpen] = useState(false);
  const [errorAlertMessage, setErrorAlertMessage] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getAllUsers(page, 10);
      let usersList = [];
      if (Array.isArray(response)) usersList = response;
      else if (Array.isArray(response?.data)) usersList = response.data;
      else if (response?.data?.users) usersList = response.data.users;
      else if (response?.users) usersList = response.users;
      
      setUsers(usersList);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users list.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isInitialized) return;
    const role = user?.role?.toUpperCase();
    if (!isAuthenticated || (role !== 'ADMIN' && role !== 'ROLE_ADMIN')) {
      router.push('/');
      return;
    }

    fetchUsers();
  }, [isAuthenticated, user?.role, router, page, isInitialized]);

  const filteredUsers = users.filter(
    (u) =>
      (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = async (u: any) => {
    try {
      const fullUser = await apiService.getUserById(u.login || u.email);
      setSelectedUser(fullUser);
      setIsEditMode(false);
      setIsModalOpen(true);
    } catch (error) {
      setSelectedUser(u);
      setIsEditMode(false);
      setIsModalOpen(true);
    }
  };

  const handleEdit = async (u: any) => {
    try {
      // Fetch full user details to get correct login and other fields
      const fullUser = await apiService.getUserById(u.login || u.email);
      setSelectedUser({ ...fullUser });
    } catch (error) {
      setSelectedUser({ ...u });
    }
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    try {
      const nameParts = (selectedUser.fullName || '').trim().split(' ');
      const firstName = nameParts[0] || selectedUser.firstName || '';
      const lastName = nameParts.slice(1).join(' ') || selectedUser.lastName || '';

      const updateData = {
        ...selectedUser,
        firstName,
        lastName,
        // CRITICAL: Keep original login if present, don't just use email
        login: selectedUser.login || selectedUser.email,
      };

      const updatedUser = await apiService.updateUser(updateData);
      
      toast({
        title: 'Success',
        description: 'User information updated successfully.',
      });
      
      // Update local state immediately for instant feedback
      setUsers(prev => prev.map(u => {
        const isMatch = (u.id && u.id === selectedUser.id) || (u.login && u.login === selectedUser.login);
        if (isMatch) {
          return { 
            ...u, 
            ...updatedUser, 
            phoneNumber: updateData.phoneNumber, // Force frontend value to stay
            fullName: selectedUser.fullName 
          };
        }
        return u;
      }));
      
      setIsModalOpen(false);
      await fetchUsers(); // Refresh list from server to be sure
    } catch (error) {
      console.error('Failed to update user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user information.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (u: any) => {
    const identifier = u.id || u.login || u.email;
    try {
      await apiService.deleteUser(identifier);
      toast({
        title: 'User Deleted',
        description: 'The user account has been removed.',
      });
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      
      // Hiển thị dialog thông báo lỗi đẹp mắt
      if (error.response?.status === 500 || error.response?.status === 400) {
        setErrorAlertMessage('Người dùng này đang có lịch hẹn hoặc dữ liệu liên quan, không thể xóa trực tiếp!');
      } else {
        setErrorAlertMessage('Đã có lỗi xảy ra trong quá trình xóa người dùng. Vui lòng thử lại sau.');
      }
      setIsErrorAlertOpen(true);
    }
  };

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
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                User Management
              </h1>
              <p className="text-gray-600">Manage patient and staff accounts</p>
            </div>
            <Button onClick={() => fetchUsers()} variant="outline" size="sm">
              Refresh List
            </Button>
          </div>

          {/* Search */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline">Search</Button>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <p className="text-gray-600">Loading users...</p>
                </div>
              </CardContent>
            </Card>
          ) : filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600">No users found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((u) => (
                <Card key={u.id || u.email} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserIcon size={24} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{u.fullName}</h3>
                            {u.authorities?.includes('ROLE_ADMIN') && (
                              <Shield size={16} className="text-amber-500" title="Admin" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-gray-600 text-sm">
                            <div className="flex items-center gap-1">
                              <Mail size={16} />
                              {u.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone size={16} />
                              {u.phoneNumber || u.phone || u.mobile || 'No phone'}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            Joined:{' '}
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewDetails(u)}>
                          View Details
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(u)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(u)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && users.length > 0 && (
            <div className="flex justify-between items-center mt-8">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-gray-600 font-medium">Page {page}</span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={users.length < 10}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* User Detail/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit User' : 'User Details'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update user information below.' : 'Detailed information about the user account.'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Full Name</Label>
                <Input
                  id="name"
                  value={selectedUser.fullName || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, fullName: e.target.value })}
                  disabled={!isEditMode}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input
                  id="email"
                  value={selectedUser.email || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  disabled={!isEditMode}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Phone</Label>
                <Input
                  id="phone"
                  value={selectedUser.phoneNumber || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, phoneNumber: e.target.value })}
                  disabled={!isEditMode}
                  className="col-span-3"
                />
              </div>
              {!isEditMode && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Status</Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-500" />
                      <span className="text-sm font-medium">Active Account</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Authorities</Label>
                    <div className="col-span-3 flex flex-wrap gap-1">
                      {selectedUser.authorities?.map((auth: string) => (
                        <span key={auth} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold border border-blue-100">
                          {auth}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {isEditMode ? 'Cancel' : 'Close'}
            </Button>
            {isEditMode && (
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
                {!isSaving && <Save size={16} className="ml-2" />}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Beautiful Error Alert Dialog */}
      <AlertDialog open={isErrorAlertOpen} onOpenChange={setIsErrorAlertOpen}>
        <AlertDialogContent className="max-w-[400px] border-red-100 shadow-xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 text-red-600 mb-2">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle size={24} />
              </div>
              <AlertDialogTitle className="text-xl">Không thể xóa</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-600 py-2 text-base">
              {errorAlertMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white font-semibold">
              Đã hiểu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
