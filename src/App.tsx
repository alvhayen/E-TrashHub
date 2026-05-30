/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';

function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(typeof window !== 'undefined' ? !navigator.onLine : false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;
  return (
    <div style={{ backgroundColor: '#ef4444', color: 'white', textAlign: 'center', padding: '0.5rem', fontWeight: 600, fontSize: '0.875rem', zIndex: 9999, position: 'fixed', top: 0, left: 0, right: 0 }}>
      Sedang offline — data terakhir ditampilkan
    </div>
  );
}
import Dashboard from './pages/Dashboard';
import AccessibilityHelp from './components/ui/AccessibilityHelp';

import HouseholdLayout from './pages/rumah_tangga/HouseholdLayout';
import Home from './pages/rumah_tangga/Home';
import RequestPickup from './pages/rumah_tangga/RequestPickup';
import History from './pages/rumah_tangga/History';
import Profile from './pages/rumah_tangga/Profile';
import PickupDetail from './pages/rumah_tangga/PickupDetail';

import DriverLayout from './pages/driver/DriverLayout';
import TaskDashboard from './pages/driver/TaskDashboard';
import RouteOverview from './pages/driver/RouteOverview';
import CompletedTasks from './pages/driver/CompletedTasks';
import DriverProfile from './pages/driver/DriverProfile';

import AdminLayout from './pages/admin_tps3r/AdminLayout';
import AdminDashboard from './pages/admin_tps3r/AdminDashboard';
import IncomingPickups from './pages/admin_tps3r/IncomingPickups';
import WeighingForm from './pages/admin_tps3r/WeighingForm';
import StockManager from './pages/admin_tps3r/StockManager';
import ShipmentManager from './pages/admin_tps3r/ShipmentManager';
import AdminReports from './pages/admin_tps3r/AdminReports';
import AdminFAQ from './pages/admin_tps3r/AdminFAQ';

import MitraLayout from './pages/mitra_b2b/MitraLayout';
import Catalog from './pages/mitra_b2b/Catalog';
import MaterialDetail from './pages/mitra_b2b/MaterialDetail';
import MitraProfile from './pages/mitra_b2b/MitraProfile';
import MitraFAQ from './pages/mitra_b2b/MitraFAQ';

import PemdaLayout from './pages/pemda/PemdaLayout';
import OverviewDashboard from './pages/pemda/OverviewDashboard';
import VolumeDetail from './pages/pemda/VolumeDetail';
import CompliancePage from './pages/pemda/CompliancePage';
import ReportsExport from './pages/pemda/ReportsExport';
import PemdaFAQ from './pages/pemda/PemdaFAQ';

import RoleOnboarding from './pages/RoleOnboarding';
import Unauthorized from './pages/Unauthorized';
import PendingApproval from './pages/PendingApproval';
import NotFound from './pages/NotFound';
import LandingPage from './pages/LandingPage';

// New Auth & Public Pages
import WasteCatalog from './pages/public/WasteCatalog';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import PendingVerification from './pages/auth/PendingVerification';
import OAuthCallback from './pages/auth/OAuthCallback';
import CompleteProfile from './pages/auth/CompleteProfile';

import ExpeditionList from './pages/driver/ExpeditionList';
import ExpeditionDetail from './pages/driver/ExpeditionDetail';

import SuperAdminLayout from './pages/superadmin/SuperAdminLayout';
import SuperAdminOverview from './pages/superadmin/SuperAdminOverview';
import VerificationQueue from './pages/superadmin/VerificationQueue';

import AdminDriverLayout from './pages/admin_driver/AdminDriverLayout';
import DriverDashboard from './pages/admin_driver/DriverDashboard';
import DriverList from './pages/admin_driver/DriverList';

import AdminPemdaLayout from './pages/admin_pemda/AdminPemdaLayout';
import PemdaDashboard from './pages/admin_pemda/PemdaDashboard';
import PemdaList from './pages/admin_pemda/PemdaList';



export default function App() {
  return (
    <ToastProvider>
      <NotificationProvider>
        <OfflineBanner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/catalog" element={<WasteCatalog />} />

            <Route path="/role-onboarding/:roleId" element={<RoleOnboarding />} />

            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register/:role" element={<Register />} />
            <Route path="/auth/pending-verification" element={<PendingVerification />} />
            <Route path="/auth/oauth-callback" element={<OAuthCallback />} />
            <Route path="/auth/complete-profile" element={<CompleteProfile />} />

            <Route path="/pending-approval" element={<PendingApproval />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route path="/household" element={
              <ProtectedRoute allowedRoles={['rumah_tangga']}>
                <HouseholdLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="home" replace />} />
              <Route path="home" element={<Home />} />
              <Route path="request" element={<RequestPickup />} />
              <Route path="history" element={<History />} />
              <Route path="history/:id" element={<PickupDetail />} />
              <Route path="profile" element={<Profile />} />
              <Route path="pickup/:id" element={<Navigate to="../history/:id" replace />} />
            </Route>

            <Route path="/driver" element={
              <ProtectedRoute allowedRoles={['driver']}>
                <DriverLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="tasks" replace />} />
              <Route path="tasks" element={<TaskDashboard />} />
              <Route path="route" element={<RouteOverview />} />
              <Route path="completed" element={<CompletedTasks />} />
              <Route path="expedition" element={<ExpeditionList />} />
              <Route path="expedition/:id" element={<ExpeditionDetail />} />
              <Route path="profile" element={<DriverProfile />} />
            </Route>

            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin_tps3r']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="incoming" element={<IncomingPickups />} />
              <Route path="weigh/:id" element={<WeighingForm />} />
              <Route path="stock" element={<StockManager />} />
              <Route path="inventory" element={<Navigate to="stock" replace />} />
              <Route path="shipment" element={<ShipmentManager />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="faq" element={<AdminFAQ />} />
            </Route>

            <Route path="/mitra" element={
              <ProtectedRoute allowedRoles={['mitra_b2b']}>
                <MitraLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="catalog" replace />} />
              <Route path="catalog" element={<Catalog />} />
              <Route path="detail/:id" element={<MaterialDetail />} />
              <Route path="profile" element={<MitraProfile />} />
              <Route path="faq" element={<MitraFAQ />} />
            </Route>

            <Route path="/pemda" element={
              <ProtectedRoute allowedRoles={['pemda']}>
                <PemdaLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<OverviewDashboard />} />
              <Route path="volume" element={<VolumeDetail />} />
              <Route path="compliance" element={<CompliancePage />} />
              <Route path="reports" element={<ReportsExport />} />
              <Route path="faq" element={<PemdaFAQ />} />
            </Route>

            <Route path="/superadmin" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <SuperAdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<SuperAdminOverview />} />
              <Route path="verification" element={<VerificationQueue />} />
              <Route path="users" element={<VerificationQueue />} />
              <Route path="settings" element={<SuperAdminOverview />} />
            </Route>

            <Route path="/admin-driver" element={
              <ProtectedRoute allowedRoles={['admin_driver']}>
                <AdminDriverLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DriverDashboard />} />
              <Route path="list" element={<DriverList />} />
              <Route path="activity" element={<DriverList />} />
            </Route>

            <Route path="/admin-pemda" element={
              <ProtectedRoute allowedRoles={['admin_pemda']}>
                <AdminPemdaLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<PemdaDashboard />} />
              <Route path="list" element={<PemdaList />} />
              <Route path="regions" element={<PemdaList />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          <AccessibilityHelp />
        </BrowserRouter>
      </AuthProvider>
      </NotificationProvider>
    </ToastProvider>
  );
}
