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
import Login from './pages/Login';
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
import InventoryManager from './pages/admin_tps3r/InventoryManager';
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
import RoleSelector from './pages/RoleSelector';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import RoleOnboarding from './pages/RoleOnboarding';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <ToastProvider>
      <NotificationProvider>
        <OfflineBanner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/role-onboarding/:roleId" element={<RoleOnboarding />} />
            <Route path="/roles" element={<RoleSelector />} />
            
            <Route path="/rumah_tangga" element={<ProtectedRoute allowedRoles={['rumah_tangga']}><HouseholdLayout /></ProtectedRoute>}>
              <Route index element={<Home />} />
              <Route path="request" element={<RequestPickup />} />
              <Route path="history" element={<History />} />
              <Route path="profile" element={<Profile />} />
              <Route path="pickup/:id" element={<PickupDetail />} />
            </Route>

            <Route path="/driver" element={<ProtectedRoute allowedRoles={['driver']}><DriverLayout /></ProtectedRoute>}>
              <Route index element={<TaskDashboard />} />
              <Route path="route" element={<RouteOverview />} />
              <Route path="completed" element={<CompletedTasks />} />
              <Route path="profile" element={<DriverProfile />} />
            </Route>

            <Route path="/admin_tps3r" element={<ProtectedRoute allowedRoles={['admin_tps3r']}><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="incoming" element={<IncomingPickups />} />
              <Route path="weigh/:id" element={<WeighingForm />} />
              <Route path="inventory" element={<InventoryManager />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="faq" element={<AdminFAQ />} />
            </Route>

            <Route path="/mitra_b2b" element={<ProtectedRoute allowedRoles={['mitra_b2b']}><MitraLayout /></ProtectedRoute>}>
              <Route index element={<Catalog />} />
              <Route path="material/:id" element={<MaterialDetail />} />
              <Route path="profile" element={<MitraProfile />} />
              <Route path="faq" element={<MitraFAQ />} />
            </Route>

            <Route path="/pemda" element={<ProtectedRoute allowedRoles={['pemda']}><PemdaLayout /></ProtectedRoute>}>
              <Route index element={<OverviewDashboard />} />
              <Route path="volume" element={<VolumeDetail />} />
              <Route path="compliance" element={<CompliancePage />} />
              <Route path="reports" element={<ReportsExport />} />
              <Route path="faq" element={<PemdaFAQ />} />
            </Route>

            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/" element={<Navigate to="/onboarding" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <AccessibilityHelp />
        </BrowserRouter>
      </AuthProvider>
      </NotificationProvider>
    </ToastProvider>
  );
}

