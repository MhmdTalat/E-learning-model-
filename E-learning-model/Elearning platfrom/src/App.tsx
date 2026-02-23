import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ChatBot } from "@/components/ChatBot";
import { ReactNode } from "react";

// Pages
import Index from "./pages/Index";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Overview from "./pages/Overview";
import Departments from "./pages/Departments";
import Courses from "./pages/Courses";
import Instructors from "./pages/Instructors";
import Students from "./pages/Students";
import Enrollments from "./pages/Enrollments";
import Analysis from "./pages/Analysis";
import UserProfile from "./pages/UserProfile";
import Settings from "./pages/Settings";
import Unauthorized from "./pages/Unauthorized";
import AssignInstructorPage from "./pages/AssignInstructorPage";
import AssignInstructorToStudent from "./pages/AssignInstructorToStudent";

const queryClient = new QueryClient();

function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="w-10 h-10 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/analytics" element={<Analytics />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={
          <PublicRoute><Login /></PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute><Register /></PublicRoute>
        } />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        }>
          <Route index element={<Overview />} />
          <Route path="departments" element={<Departments />} />
          <Route path="courses" element={<Courses />} />
          <Route path="instructors" element={<Instructors />} />
          <Route path="students" element={<Students />} />
          <Route path="enrollments" element={<Enrollments />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="assign-instructor" element={<AssignInstructorPage />} />
          <Route path="assign-instructor-to-students" element={<AssignInstructorToStudent />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ChatBot />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
