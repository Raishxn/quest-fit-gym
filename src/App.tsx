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
import { lazy, Suspense } from 'react';

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const AnamnesisPage = lazy(() => import("./pages/AnamnesisPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const WorkoutPage = lazy(() => import("./pages/WorkoutPage"));
const DietPage = lazy(() => import("./pages/DietPage"));
const CardioPage = lazy(() => import("./pages/CardioPage"));
const RankingPage = lazy(() => import("./pages/RankingPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const FriendsPage = lazy(() => import("./pages/FriendsPage"));
const PlaylistPage = lazy(() => import("./pages/PlaylistPage"));
const ProgressPage = lazy(() => import("./pages/ProgressPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ShopPage = lazy(() => import("./pages/ShopPage"));
const UpgradePage = lazy(() => import("./pages/UpgradePage"));
const SuccessPage = lazy(() => import("./pages/SuccessPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MissionsPage = lazy(() => import("./pages/MissionsPage"));
const GuildsPage = lazy(() => import("./pages/GuildsPage"));
const UpdatesPage = lazy(() => import("./pages/UpdatesPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const PublicProfilePage = lazy(() => import("./pages/PublicProfilePage"));
const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminGiftCodesPage = lazy(() => import("./pages/admin/AdminGiftCodesPage"));
const AdminExercisesPage = lazy(() => import("./pages/admin/AdminExercisesPage"));
const AdminShopItemsPage = lazy(() => import("./pages/admin/AdminShopItemsPage"));
const AdminRPGBalancingPage = lazy(() => import("./pages/admin/AdminRPGBalancingPage"));
const AdminPatchNotesPage = lazy(() => import("./pages/admin/AdminPatchNotesPage"));


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          }>
            <Routes>
              {/* Public root and auth pages */}
              <Route path="/" element={<Index />} />
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
                  <Route path="/admin/shop" element={<AdminShopItemsPage />} />
                  <Route path="/admin/rpg" element={<AdminRPGBalancingPage />} />
                  <Route path="/admin/patch-notes" element={<AdminPatchNotesPage />} />
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
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/updates" element={<UpdatesPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
