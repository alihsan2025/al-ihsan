import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ScrollToTop from './components/common/ScrollToTop';
import Layout from './components/layout/Layout';
import Home from './pages/public/Home';
import About from './pages/public/About';
import Donate from './pages/public/Donate';
import Apply from './pages/public/Apply';
import RequestHelp from './pages/public/RequestHelp';
import Gallery from './pages/public/Gallery';

// Admin Imports
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import { ThemeProvider } from './context/ThemeContext';

import Contact from './pages/public/Contact';
import Focus from './pages/public/Focus';
// ... existing imports
import ZakatPage from './pages/public/ZakatPage';

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <SiteSettingsProvider>
          <AuthProvider>
            <Router>
              <ScrollToTop />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/about" element={<Layout><About /></Layout>} />
              <Route path="/contact" element={<Layout><Contact /></Layout>} />
              <Route path="/donate" element={<Layout><Donate /></Layout>} />
              <Route path="/gallery" element={<Layout><Gallery /></Layout>} />
              <Route path="/focus" element={<Layout><Focus /></Layout>} />
              <Route path="/apply" element={<Layout><Apply /></Layout>} />
              <Route path="/zakat" element={<Layout><ZakatPage /></Layout>} />
              <Route path="/request-help" element={<Layout><RequestHelp /></Layout>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<Login />} />
              <Route
                path="/admin/dashboard/*"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </AuthProvider>
      </SiteSettingsProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;
