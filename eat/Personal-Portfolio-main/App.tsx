import React, { useState, useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import DetailPage from './pages/DetailPage';
import Header from './components/Header';
import Footer from './components/Footer';
import ThemeToggle from './components/ThemeToggle';
import BackgroundEffect from './components/BackgroundEffect';
import { PageType } from './types';

// Wrapper to handle AnimatePresence location
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/me" element={<DetailPage type={PageType.Me} />} />
        <Route path="/projects" element={<DetailPage type={PageType.Projects} />} />
        <Route path="/skills" element={<DetailPage type={PageType.Skills} />} />
        <Route path="/fun" element={<DetailPage type={PageType.Fun} />} />
        <Route path="/contact" element={<DetailPage type={PageType.Contact} />} />
        {/* Catch all - Redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  // Initialize theme - Default to Light Mode
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      
      // Only enable dark mode if explicitly saved by user. 
      // Otherwise default to light mode (ignoring system preference to make white mode the main theme).
      if (savedTheme === 'dark') {
        setIsDark(true);
        document.documentElement.classList.add('dark');
      } else {
        setIsDark(false);
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.log('LocalStorage access denied or not available:', error);
      // Fallback to light mode
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
      try {
        localStorage.setItem('theme', 'light');
      } catch (e) {
        console.log('Could not save theme preference');
      }
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
      try {
        localStorage.setItem('theme', 'dark');
      } catch (e) {
        console.log('Could not save theme preference');
      }
    }
  };

  return (
    <Router>
      <div className="relative min-h-screen flex flex-col font-sans bg-transparent">
        <BackgroundEffect />
        <Header />
        <main className="flex-grow flex flex-col relative z-10">
          <AnimatedRoutes />
        </main>
        <Footer />
        <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
      </div>
    </Router>
  );
};

export default App;