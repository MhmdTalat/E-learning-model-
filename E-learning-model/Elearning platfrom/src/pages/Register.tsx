import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, User, Shield, Building2, FileText, MapPin, Calendar, Briefcase, Image, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as departmentsAPI from '@/api/departments';
import type { Department } from '@/api/departments';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [secondName, setSecondName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Student');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Array<{ id: number; name: string }>>([]);
  const [departmentId, setDepartmentId] = useState<string>('');
  const [loadingDepts, setLoadingDepts] = useState(false);
  // Profile fields (optional)
  const [bio, setBio] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [company, setCompany] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Fetch departments when component mounts
  useEffect(() => {
    interface DepartmentResponse {
      id?: number;
      departmentID?: number;
      DepartmentID?: number;
      name?: string;
      departmentName?: string;
      DepartmentName?: string;
    }

    const fetchDepartments = async () => {
      try {
        setLoadingDepts(true);
        const data = await departmentsAPI.getDepartments();
        console.log('[Departments Raw Data]', data);
        
        // Handle both direct array and wrapped response formats
        const departmentArray = Array.isArray(data) ? data : (data as { data?: DepartmentResponse[] | Department[] })?.data || [];
        console.log('[Departments Array]', departmentArray);
        
        // Map the API response to match the expected format
        const mapped = (departmentArray as DepartmentResponse[]).map((dept: DepartmentResponse) => {
          // Handle both naming conventions
          const id = dept.id || dept.departmentID || parseInt(dept.DepartmentID?.toString() || '0');
          const name = dept.name || dept.departmentName || dept.DepartmentName;
          console.log(`[Mapping Dept] ID: ${id}, Name: ${name}`);
          return {
            id: parseInt(id?.toString() || '0'),
            name: name || 'Unknown Department',
          };
        });
        
        console.log('[Mapped Departments]', mapped);
        setDepartments(mapped);
        
        if (mapped.length === 0) {
          console.warn('[Warning] No departments loaded');
        }
      } catch (err) {
        console.error('[Error Loading Departments]', err);
      } finally {
        setLoadingDepts(false);
      }
    };

    fetchDepartments();
  }, []);

  // Handle profile image upload
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    setProfileImagePreview(null);
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (role === 'Instructor' && !departmentId) {
      setError('Department is required for instructors');
      return;
    }

    setLoading(true);
    try {
      const fullName = `${firstName} ${secondName}`.trim();
      await register(fullName, email, password, confirmPassword, role, departmentId ? parseInt(departmentId) : undefined, {
        bio: bio || undefined,
        address: address || undefined,
        dateOfBirth: dateOfBirth || undefined,
        company: company || undefined,
        profileImage: profileImage || undefined,
      });
      navigate('/dashboard');
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-accent/60" />
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 mx-auto border border-white/20">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Join Elearning Platform</h1>
            <p className="text-xl text-white/80 max-w-md">
              Start your learning journey with thousands of courses
            </p>
          </div>
          
          <div className="space-y-4 mt-8 text-left max-w-md">
            {[
              'Access to 500+ premium courses',
              'Learn from expert instructors',
              'Get certified upon completion',
              'Join a community of learners',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90">
                <div className="w-6 h-6 rounded-full bg-accent/30 flex items-center justify-center">
                  <span className="text-accent text-sm">✓</span>
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/5 rounded-full" />
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-fade-up">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Elearning Platform</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Create account</h2>
            <p className="text-muted-foreground">Start your learning adventure today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm animate-fade-in">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Enter your first name"
                  value={firstName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                  required
                  autoComplete="given-name"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondName">Last Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="secondName"
                  type="text"
                  placeholder="Enter your last name"
                  value={secondName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSecondName(e.target.value)}
                  required
                  autoComplete="family-name"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <select
                  id="role"
                  value={role}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                    setRole(e.target.value);
                    // Reset department when role changes
                    if (e.target.value !== 'Instructor') {
                      setDepartmentId('');
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-input border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                >
                  <option value="Student">Student</option>
                  <option value="Instructor">Instructor</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            {role === 'Instructor' && (
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select
                    id="department"
                    value={departmentId}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setDepartmentId(e.target.value)}
                    required={role === 'Instructor'}
                    disabled={loadingDepts}
                    className="w-full pl-10 pr-4 py-2 bg-input border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select a department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Optional Profile Fields */}
            <div className="my-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">Profile Information (Optional)</p>
              
              <div className="space-y-2 mb-4">
                <Label htmlFor="profileImage">Profile Photo</Label>
                <div className="relative">
                  <Input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="pl-10"
                  />
                  <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                </div>
                
                {profileImagePreview && (
                  <div className="relative mt-3">
                    <img 
                      src={profileImagePreview} 
                      alt="Profile preview" 
                      className="w-32 h-32 rounded-lg object-cover border border-border"
                    />
                    <button
                      type="button"
                      onClick={removeProfileImage}
                      className="absolute -top-2 -right-2 bg-destructive rounded-full p-1 hover:bg-destructive/90 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setDateOfBirth(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="address"
                    type="text"
                    placeholder="Your address"
                    value={address}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company/Organization</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="company"
                    type="text"
                    placeholder="Your company or organization"
                    value={company}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCompany(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={bio}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
                    maxLength={500}
                    rows={3}
                    className="w-full pl-10 pr-4 py-2 bg-input border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{bio.length}/500</p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-semibold group"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center mt-8 text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-accent font-semibold hover:underline">
              Sign in
            </Link>
          </p>

          <div className="mt-8 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
