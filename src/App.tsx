/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AdminLayout } from './layout/AdminLayout';
import { useAppSelector } from './store/hooks';

// Pages
import { Dashboard } from './pages/Dashboard';
import { UsersPage } from './pages/Users';
import { GroupsPage } from './pages/Groups';
// import { MonetizationPage } from './pages/Monetization';
import { AnalyticsPage } from './pages/Analytics';
import { RolesPage } from './pages/Roles';
import { SettingsPage } from './pages/Settings';
import { LogsPage } from './pages/Logs';
import { LoginPage } from './pages/Login';
import { Subscription } from './pages/Subscription';
import { Notifications } from './pages/Notifications';
import { EnquiryPage } from './pages/Enquiry';
import { SupportPage } from './pages/Support';
import { GroupDetails } from './pages/GroupDetails';
import { PlanForm } from './pages/PlanForm';
import { FeaturesPage } from './pages/Features';
import { TransactionsPage } from './pages/Transactions';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster />
        <Routes>
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          
          <Route path="/admin">
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="login" element={<LoginPage />} />
            <Route element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="groups" element={<GroupsPage />} />
              <Route path="groups/:id" element={<GroupDetails />} />
              {/* <Route path="monetization/*" element={<MonetizationPage />} /> */}
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="logs" element={<LogsPage />} />
              <Route path="roles" element={<RolesPage />} />
              <Route path="settings/*" element={<SettingsPage />} />
              <Route path="subscription" element={<Subscription />} />
              <Route path="subscription/:id" element={<PlanForm />} />
              <Route path="features" element={<FeaturesPage />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="enquiry" element={<EnquiryPage />} />
              <Route path="support" element={<SupportPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}