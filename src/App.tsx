import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import TripsPage from './pages/TripsPage';
import TripDetailPage from './pages/TripDetailPage';
import keycloak from './auth';
import { useState, useEffect, useRef } from 'react';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: any }) => {
    // Keycloak is already initialized in App
    if (!keycloak.authenticated) {
        keycloak.login();
        return null; 
    }
    return children;
};

function App() {
  const [init, setInit] = useState(false);
  const isRun = useRef(false);

  useEffect(() => {
     if (isRun.current) return;
     isRun.current = true;

     console.log("Initializing Keycloak...");
     // Initialize Keycloak once at the root level
     keycloak.init({ onLoad: 'check-sso', checkLoginIframe: false }).then((authenticated) => {
         console.log("Keycloak init success. Authenticated:", authenticated);
         console.log("Keycloak instance:", keycloak);
         setInit(true);
     }).catch(err => {
         console.error("Keycloak init failed", err);
         setInit(true);
     });
  }, []);

  if (!init) return <div className="loading-screen">Starting TripTribe...</div>;

  return (
      <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/dashboard" 
            element={
                <ProtectedRoute>
                    <DashboardPage />
                </ProtectedRoute>
            } 
          />
          <Route 
            path="/trips" 
            element={
                <ProtectedRoute>
                    <TripsPage />
                </ProtectedRoute>
            } 
          />
          <Route 
            path="/trips/:tripId" 
            element={
                <ProtectedRoute>
                    <TripDetailPage />
                </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
                <ProtectedRoute>
                    <ProfilePage />
                </ProtectedRoute>
            } 
          />
      </Routes>
  );
}

export default App;
