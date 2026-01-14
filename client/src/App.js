import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Route Guards
import AdminRoute from './components/AdminRoute';
import UserRoute from './components/UserRoute';

// Pages (Public)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerificationPending from './pages/VerificationPending';

// Pages (Dashboards)
import StudentDashboard from './pages/StudentDashboard';
import AlumniDashboard from './pages/AlumniDashboard';

// Pages (User)
import Profile from './pages/Profile';
import AlumniDirectory from './pages/AlumniDirectory';
import Events from './pages/Events';
import Mentorship from './pages/Mentorship';
import MentorshipCreate from './pages/MentorshipCreate';
import MentorshipApplications from './pages/MentorshipApplications';
import Jobs from './pages/Jobs';
import JobsMy from './pages/JobsMy';
import Donations from './pages/Donations';
import News from './pages/News';

// Pages (Admin)
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminEvents from './pages/admin/AdminEvents';
import AdminJobs from './pages/admin/AdminJobs';
import AdminNews from './pages/admin/AdminNews';
import AdminDonations from './pages/admin/AdminDonations';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />

          <main>
            <Routes>
              {/* ================= PUBLIC ROUTES ================= */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verification-pending" element={<VerificationPending />} />

              {/* ================= STUDENT ROUTES ================= */}
              <Route element={<UserRoute role="student" />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
              </Route>

              {/* ================= ALUMNI ROUTES ================= */}
              <Route element={<UserRoute role="alumni" />}>
                <Route path="/alumni/dashboard" element={<AlumniDashboard />} />
                <Route path="/mentorship/create" element={<MentorshipCreate />} />
                <Route path="/mentorship/:id/applications" element={<MentorshipApplications />} />
                <Route path="/jobs/my" element={<JobsMy />} />
              </Route>

              {/* ================= COMMON AUTHENTICATED ROUTES ================= */}
              <Route element={<UserRoute />}>
                <Route path="/dashboard" element={<RoleBasedDashboard />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* ================= PUBLIC (LOGIN-AWARE) ROUTES ================= */}
              <Route path="/alumni" element={<AlumniDirectory />} />
              <Route path="/events" element={<Events />} />
              <Route path="/mentorship" element={<Mentorship />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/donations" element={<Donations />} />
              <Route path="/news" element={<News />} />

              {/* ================= ADMIN ROUTES ================= */}
              <Route path="/admin" element={<AdminRoute />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="jobs" element={<AdminJobs />} />
                <Route path="news" element={<AdminNews />} />
                <Route path="donations" element={<AdminDonations />} />
              </Route>

              {/* ================= FALLBACK ================= */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
          <ToastContainer />
        </div>
      </Router>
    </AuthProvider>
  );
}

/**
 * Redirect /dashboard based on user role
 */
const RoleBasedDashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === 'student') return <StudentDashboard />;
  if (user.role === 'alumni') return <AlumniDashboard />;

  return <Navigate to="/" replace />;
};

export default App; 
