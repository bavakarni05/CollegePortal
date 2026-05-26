import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AppProvider } from './context/AppContext';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';

import CollegeSearchPage from './pages/CollegeSearchPage';
import CollegeDetailPage from './pages/CollegeDetailPage';
import CollegeComparePage from './pages/CollegeComparePage';
import ApplicationPage from './pages/ApplicationPage';
import StudentRegisterPage from './pages/StudentRegisterPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import WishlistPage from './pages/WishlistPage'; // Keep WishlistPage
import CollegeDashboardPage from './pages/CollegeDashboardPage';
import CollegeProfilePage from './pages/CollegeProfilePage';
import CourseCatalogPage from './pages/CourseCatalogPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected route component for student-only routes
function StudentRoute({ element }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/" />; // Redirect to the main login/register page
  if (user.role === 'COLLEGE') return <Navigate to="/college-dashboard" />;
  return element;
}

// Protected route component for college-only routes
function CollegeRoute({ element }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/?login=true" />; // Redirect to unified login
  if (user.role === 'STUDENT') return <Navigate to="/dashboard" />;
  return element;
}

function AppRoutes() {
  const { user } = useApp();

  return (
    <Routes>
      <Route path="/" element={<StudentRegisterPage />} /> {/* This is now the landing page */}
      {/* Public routes */}
      <Route path="/search" element={user?.role === 'COLLEGE' ? <Navigate to="/college-dashboard" /> : <CollegeSearchPage />} />
      <Route path="/college/:id" element={user?.role === 'COLLEGE' ? <Navigate to="/college-dashboard" /> : <CollegeDetailPage />} />
      {/* Student routes */}
      <Route path="/compare" element={<StudentRoute element={<CollegeComparePage />} />} />
      <Route path="/apply/:collegeId" element={<StudentRoute element={<ApplicationPage />} />} />
      <Route path="/dashboard" element={<StudentRoute element={<StudentDashboardPage />} />} />
      <Route path="/wishlist" element={<StudentRoute element={<WishlistPage />} />} />
      {/* College routes */}
      {/* College login is now handled by the unified StudentRegisterPage */}
      <Route path="/college-dashboard" element={<CollegeRoute element={<CollegeDashboardPage />} />} />
      <Route path="/college-profile" element={<CollegeRoute element={<CollegeProfilePage />} />} />
      <Route path="/college-courses" element={<CollegeRoute element={<CourseCatalogPage />} />} />
      {/* Catch all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Navbar />
        <main className="page-wrapper">
          <AppRoutes />
        </main>
        <Toast />
      </Router>
    </AppProvider>
  );
}
