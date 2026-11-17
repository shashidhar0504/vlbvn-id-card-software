import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';

// Public Pages
import { HomePage } from './pages/HomePage.js';
import { ApplyPage } from './pages/ApplyPage.js';
import { ApplySuccessPage } from './pages/ApplySuccessPage.js';
import { StatusPage } from './pages/StatusPage.js';
import { ContactPage } from './pages/ContactPage.js';

// Admin Pages
import { AdminLayout } from './components/AdminLayout.js';
import { AdminLogin } from './pages/admin/AdminLogin.js';
import { AdminDashboard } from './pages/admin/AdminDashboard.js';
import { AdminApplications } from './pages/admin/AdminApplications.js';
import { AdminApplicationDetail } from './pages/admin/AdminApplicationDetail.js';
import { AdminMembers } from './pages/admin/AdminMembers.js';
import { AdminTemplateDesigner } from './pages/admin/AdminTemplateDesigner.js';
import { AdminEmailLogs } from './pages/admin/AdminEmailLogs.js';
import { AdminSettings } from './pages/admin/AdminSettings.js';

// Public Layout Wrapper
const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-cream-50 text-charcoal-900 selection:bg-gold-200">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* Public / Member Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/apply" element={<ApplyPage />} />
          <Route path="/apply/success" element={<ApplySuccessPage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* Admin Login Route */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="applications/:id" element={<AdminApplicationDetail />} />
          <Route path="members" element={<AdminMembers />} />
          <Route path="templates" element={<AdminTemplateDesigner />} />
          <Route path="emails" element={<AdminEmailLogs />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
