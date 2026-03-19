import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { AdminGuard } from "@/components/auth/AdminGuard";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AnamnesisPage from "./pages/AnamnesisPage";
import HomePage from "./pages/HomePage";
import WorkoutPage from "./pages/WorkoutPage";
import DietPage from "./pages/DietPage";
import CardioPage from "./pages/CardioPage";
import RankingPage from "./pages/RankingPage";
import ProfilePage from "./pages/ProfilePage";
import FriendsPage from "./pages/FriendsPage";
import PlaylistPage from "./pages/PlaylistPage";
import ProgressPage from "./pages/ProgressPage";
import SettingsPage from "./pages/SettingsPage";
import UpgradePage from "./pages/UpgradePage";
import SuccessPage from "./pages/SuccessPage";
import NotFound from "./pages/NotFound";
import MissionsPage from "./pages/MissionsPage";
import GuildsPage from "./pages/GuildsPage";
import UpdatesPage from "./pages/UpdatesPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import PublicProfilePage from "./pages/PublicProfilePage";
import FeedbackPage from "./pages/FeedbackPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminGiftCodesPage from "./pages/admin/AdminGiftCodesPage";
import AdminExercisesPage from "./pages/admin/AdminExercisesPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public auth pages */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected pages */}
            <Route path="/anamnesis" element={
              <ProtectedRoute><AnamnesisPage /></ProtectedRoute>
            } />
            <Route path="/upgrade" element={
              <ProtectedRoute><UpgradePage /></ProtectedRoute>
            } />
            <Route path="/success" element={
              <ProtectedRoute><SuccessPage /></ProtectedRoute>
            } />

            {/* Admin (protected + admin guard) */}
            <Route element={<ProtectedRoute><AdminGuard /></ProtectedRoute>}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/gift-codes" element={<AdminGiftCodesPage />} />
                <Route path="/admin/exercises" element={<AdminExercisesPage />} />
              </Route>
            </Route>

            {/* Dashboard (protected) */}
            <Route element={
              <ProtectedRoute><DashboardLayout /></ProtectedRoute>
            }>
              <Route path="/home" element={<HomePage />} />
              <Route path="/workout" element={<WorkoutPage />} />
              <Route path="/diet" element={<DietPage />} />
              <Route path="/cardio" element={<CardioPage />} />
              <Route path="/ranking" element={<RankingPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/:userId" element={<PublicProfilePage />} />
              <Route path="/friends" element={<FriendsPage />} />
              <Route path="/playlists" element={<PlaylistPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/missions" element={<MissionsPage />} />
              <Route path="/guilds" element={<GuildsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/updates" element={<UpdatesPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
            </Route>

            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
