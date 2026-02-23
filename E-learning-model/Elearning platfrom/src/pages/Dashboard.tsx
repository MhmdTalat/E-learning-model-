import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import client from '@/api/client';
import { useTheme } from '@/context/ThemeContext';
import DashboardOverview from './DashboardOverview';
import { 
  LayoutDashboard, 
  Building2, 
  BookOpen, 
  Users, 
  UserCheck,
  ClipboardList,
  Briefcase,
  BarChart3,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  end?: boolean;
}

const Dashboard = () => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const apiBase = (client.defaults.baseURL || '').toString().replace(/\/$/, '');
  const normalizeUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${apiBase}/${url.replace(/^\/+/, '')}`;
  };
  
  const canViewAnalysis = user?.role === 'Instructor' || user?.role === 'Admin';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const mainNav: NavItem[] = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
    { to: '/dashboard/departments', icon: Building2, label: 'Departments' },
    { to: '/dashboard/courses', icon: BookOpen, label: 'Courses' },
    { to: '/dashboard/instructors', icon: UserCheck, label: 'Instructors' },
    { to: '/dashboard/students', icon: Users, label: 'Students' },
    { to: '/dashboard/enrollments', icon: ClipboardList, label: 'Enrollments' },
    { to: '/dashboard/assign-instructor', icon: Briefcase, label: 'Assign Instructor to Course' },
    { to: '/dashboard/assign-instructor-to-students', icon: UserCheck, label: 'Assign by Course' },
  ];

  const secondaryNav: NavItem[] = [
    ...(canViewAnalysis ? [{ to: '/dashboard/analysis', icon: BarChart3, label: 'Analysis' }] : []),
    { to: '/dashboard/profile', icon: User, label: 'Profile' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const NavLinkItem = ({ item }: { item: NavItem }) => (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={() => setSidebarOpen(false)}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group',
          isActive
            ? 'bg-accent text-accent-foreground shadow-md'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        )
      }
    >
      <item.icon className="w-5 h-5" />
      <span>{item.label}</span>
      <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:static inset-y-0 left-0 z-50 w-72 bg-card border-r border-border flex flex-col transition-transform duration-300 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-muted-foreground hover:text-foreground ml-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 mx-4 mt-4 bg-muted/50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              {user?.profilePhotoUrl && !imageError ? (
                <img
                  src={normalizeUrl(user.profilePhotoUrl)}
                  alt={user?.name || 'User'}
                  onError={() => setImageError(true)}
                  className="w-10 h-10 rounded-full object-cover border-2 border-border shadow-sm transform transition-transform hover:scale-105"
                />
              ) : (
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-accent-foreground font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-foreground truncate">{user?.name}</div>
              <div className="text-xs text-muted-foreground">{user?.role}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="mb-4">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4">
              Main Menu
            </span>
          </div>
          {mainNav.map((item) => (
            <NavLinkItem key={item.to} item={item} />
          ))}

          <div className="pt-6 pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4">
              Settings
            </span>
          </div>
          {secondaryNav.map((item) => (
            <NavLinkItem key={item.to} item={item} />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-5 h-5" />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-5 h-5" />
                <span>Light Mode</span>
              </>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                {location.pathname === '/dashboard' ? 'Dashboard' : 
                 location.pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="hidden lg:flex"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
            <NavLink to="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Site
            </NavLink>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {location.pathname === '/dashboard' ? <DashboardOverview /> : <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
