import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import TripsPage from './pages/TripsPage';
import TripDetailPage from './pages/TripDetailPage';
import MyItinerariesPage from './pages/MyItinerariesPage';
import ItineraryEditorPage from './pages/ItineraryEditorPage';
import TripItineraryPage from './pages/TripItineraryPage';
import TripExpensesPage from './pages/TripExpensesPage';
import ExpensesPage from './pages/ExpensesPage';
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
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            zIndex: 9999,
          },
          success: {
            style: {
              background: 'rgba(16, 185, 129, 0.9)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            },
          },
          error: {
            style: {
              background: 'rgba(239, 68, 68, 0.9)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            },
          },
        }}
      />
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
          <Route 
            path="/itineraries" 
            element={
                <ProtectedRoute>
                    <MyItinerariesPage />
                </ProtectedRoute>
            } 
          />
          <Route 
            path="/itineraries/:templateId" 
            element={
                <ProtectedRoute>
                    <ItineraryEditorPage />
                </ProtectedRoute>
            } 
          />
          <Route 
            path="/trips/:tripId/itinerary" 
            element={
                <ProtectedRoute>
                    <TripItineraryPage />
                </ProtectedRoute>
            } 
          />
          <Route 
            path="/trips/:tripId/expenses" 
            element={
                <ProtectedRoute>
                    <TripExpensesPage />
                </ProtectedRoute>
            } 
          />
          <Route 
            path="/expenses" 
            element={
                <ProtectedRoute>
                    <ExpensesPage />
                </ProtectedRoute>
            } 
          />
      </Routes>
    </>
  );
}

export default App;
