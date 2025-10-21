
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';
import VisualIntelligencePage from './pages/VisualIntelligencePage';
import GenerateImagePage from './pages/GenerateImagePage';
import EnhanceEditPage from './pages/EnhanceEditPage';
import AppIntelligencePage from './pages/AppIntelligencePage';
import RealTimePredictionsPage from './pages/RealTimePredictionsPage';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Protected Pages */}
          <Route 
            path="/visual-intelligence" 
            element={
              <ProtectedRoute>
                <VisualIntelligencePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/generate" 
            element={
              <ProtectedRoute>
                <GenerateImagePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/enhance-edit" 
            element={
              <ProtectedRoute>
                <EnhanceEditPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/app-intelligence" 
            element={
              <ProtectedRoute>
                <AppIntelligencePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/predictions" 
            element={
              <ProtectedRoute>
                <RealTimePredictionsPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
