import { useAuth, User as UserType } from '@/context/AuthContext';
import { useState, ChangeEvent, FormEvent, useEffect, useRef } from 'react';
import client from '@/api/client';
import { User, Mail, Shield, Camera, Save, Phone, MapPin, Calendar, Briefcase, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import * as authAPI from '@/api/auth';

const UserProfile = () => {
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
    company: user?.company || '',
    dateOfBirth: user?.dateOfBirth || '',
    bio: user?.bio || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const apiBase = (client.defaults.baseURL || '').toString().replace(/\/$/, '');
  const normalizeUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${apiBase}/${url.replace(/^\/+/, '')}`;
  };

  // Fetch fresh user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        await refreshUser();
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        toast.error('Failed to load user data');
      }
    };

    fetchUserData();
  }, [refreshUser]);

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        company: user.company || '',
        dateOfBirth: user.dateOfBirth || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        toast.error('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        toast.error('Please select a valid image file');
        return;
      }

      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
        setImageError(false);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    setProfileImagePreview(null);
    setImageError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        userName: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        company: formData.company,
        dateOfBirth: formData.dateOfBirth,
        bio: formData.bio,
      };

      // Add profile image if selected
      if (profileImage) {
        payload.profileImage = profileImage;
      }

      await authAPI.updateProfile(payload);

      // Refresh user data to get updated profile
      await refreshUser();

      // reset any previous image error so new server URL can be loaded
      setImageError(false);

      toast.success('Profile updated successfully');

      // Clear image preview after successful upload
      if (profileImage) {
        removeProfileImage();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Profile Settings</h2>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      {/* Avatar Section */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              {profileImagePreview ? (
                <img
                  src={profileImagePreview}
                  alt="Profile preview"
                  className="w-24 h-24 rounded-full object-cover border-2 border-border"
                />
              ) : user?.profilePhotoUrl && !imageError ? (
                <img
                  src={normalizeUrl(user.profilePhotoUrl)}
                  alt={user.name || 'Profile'}
                  onError={() => setImageError(true)}
                  className="w-24 h-24 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center border-2 border-border">
                  <span className="text-3xl font-bold text-accent-foreground">
                    {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={triggerFileInput}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-background hover:bg-primary/90 transition-colors"
              >
                <Camera className="w-4 h-4 text-primary-foreground" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-foreground">{user?.name || 'User'}</h3>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Shield className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">{user?.role}</span>
              </div>
              {profileImagePreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeProfileImage}
                  className="mt-2"
                >
                  <X className="w-4 h-4 mr-1" />
                  Remove new image
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="Your phone number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="Your address"
                  value={formData.address}
                  onChange={handleChange}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company/Organization</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="company"
                  name="company"
                  type="text"
                  placeholder="Your company or organization"
                  value={formData.company}
                  onChange={handleChange}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={handleChange}
                  maxLength={500}
                  rows={3}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2 bg-input border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none disabled:opacity-50"
                />
                <p className="text-xs text-muted-foreground mt-1">{formData.bio.length}/500</p>
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Profile Information */}
      {user && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.role && (
                <div>
                  <Label className="text-sm text-muted-foreground">Role</Label>
                  <p className="text-foreground mt-1">{user.role}</p>
                </div>
              )}
              {user.department && (
                <div>
                  <Label className="text-sm text-muted-foreground">Department</Label>
                  <p className="text-foreground mt-1">{user.department}</p>
                </div>
              )}
              {user.enrollmentDate && (
                <div>
                  <Label className="text-sm text-muted-foreground">Member Since</Label>
                  <p className="text-foreground mt-1">
                    {new Date(user.enrollmentDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button variant="destructive">Delete Account</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
