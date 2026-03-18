import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
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
import SettingsPage from "./pages/SettingsPage";
import UpgradePage from "./pages/UpgradePage";
import NotFound from "./pages/NotFound";

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

            {/* Protected pages */}
            <Route path="/anamnesis" element={
              <ProtectedRoute><AnamnesisPage /></ProtectedRoute>
            } />
            <Route path="/upgrade" element={
              <ProtectedRoute><UpgradePage /></ProtectedRoute>
            } />

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
              <Route path="/friends" element={<FriendsPage />} />
              <Route path="/playlists" element={<PlaylistPage />} />
              <Route path="/settings" element={<SettingsPage />} />
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
