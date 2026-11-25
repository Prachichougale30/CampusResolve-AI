import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ComplaintProvider } from './context/ComplaintContext';
import { NotificationProvider } from './context/NotificationContext';

// Layout & Route Guard
import DashboardLayout from './components/common/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import CreateComplaintPage from './pages/student/CreateComplaintPage';
import AIAssistantPage from './pages/student/AIAssistantPage';
import MyComplaintsPage from './pages/student/MyComplaintsPage';
import ComplaintDetailsPage from './pages/student/ComplaintDetailsPage';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import AssignedComplaintsPage from './pages/staff/AssignedComplaintsPage';
import WorkHistoryPage from './pages/staff/WorkHistoryPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminComplaintsPage from './pages/admin/AdminComplaintsPage';
import StaffManagementPage from './pages/admin/StaffManagementPage';
import StudentManagementPage from './pages/admin/StudentManagementPage';
import DepartmentsPage from './pages/admin/DepartmentsPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import ReportsPage from './pages/admin/ReportsPage';

// Common Pages
import ProfilePage from './pages/common/ProfilePage';
import NotFoundPage from './pages/common/NotFoundPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ComplaintProvider>
          <NotificationProvider>
            {/* Global Toaster for notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: '#0f172a',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: '600',
                  borderRadius: '14px',
                  padding: '12px 16px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#ffffff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#f43f5e',
                    secondary: '#ffffff',
                  },
                },
              }}
            />

            <Routes>
              {/* Public Routes - Accessible without login */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Student Portal Routes - Requires Student Role */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <DashboardLayout>
                      <StudentDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/complaints"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <DashboardLayout>
                      <MyComplaintsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/complaints/:id"
                element={
                  <ProtectedRoute allowedRoles={['student', 'staff', 'admin']}>
                    <DashboardLayout>
                      <ComplaintDetailsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/create"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <DashboardLayout>
                      <CreateComplaintPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/ai-assistant"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <DashboardLayout>
                      <AIAssistantPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Staff Portal Routes - Requires Staff Role */}
              <Route
                path="/staff/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['staff']}>
                    <DashboardLayout>
                      <StaffDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/assigned"
                element={
                  <ProtectedRoute allowedRoles={['staff']}>
                    <DashboardLayout>
                      <AssignedComplaintsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/complaints/:id"
                element={
                  <ProtectedRoute allowedRoles={['staff', 'admin']}>
                    <DashboardLayout>
                      <ComplaintDetailsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/history"
                element={
                  <ProtectedRoute allowedRoles={['staff']}>
                    <DashboardLayout>
                      <WorkHistoryPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Admin Portal Routes - Requires Admin Role */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <AdminDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/complaints"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <AdminComplaintsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/complaints/:id"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <ComplaintDetailsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/staff"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <StaffManagementPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <StudentManagementPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/departments"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <DepartmentsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <AnalyticsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <ReportsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Shared Profile Route - Requires Any Logged In Role */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['student', 'staff', 'admin']}>
                    <DashboardLayout>
                      <ProfilePage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Fallback & 404 */}
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </NotificationProvider>
        </ComplaintProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
