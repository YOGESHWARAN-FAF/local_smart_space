import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SmartSpaceProvider } from './context/SmartSpaceContext';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/ToastContainer';
import HomePage from './pages/HomePage';
import ConnectPage from './pages/ConnectPage';
import VenuePage from './pages/VenuePage';
import DocsPage from './pages/DocsPage';
import { AnimatePresence, motion } from 'framer-motion';

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    style={{ width: '100%' }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/connect" element={<PageTransition><ConnectPage /></PageTransition>} />
        <Route path="/venue/:venueId" element={<PageTransition><VenuePage /></PageTransition>} />
        <Route path="/docs" element={<PageTransition><DocsPage /></PageTransition>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

import { Geolocation } from "@capacitor/geolocation";

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await Geolocation.requestPermissions();
      } catch (e) {
        console.log("Location permission error", e);
      }
    })();
  }, []);

  return (
    <SmartSpaceProvider>
      <Router>
        <div className="app">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="main-content">
            <AnimatedRoutes />
          </main>
          <ToastContainer />
        </div>
      </Router>
    </SmartSpaceProvider>
  );
}

export default App;
