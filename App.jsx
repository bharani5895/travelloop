import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Toast from './components/Toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip';
import MyTrips from './pages/MyTrips';
import ItineraryBuilder from './pages/ItineraryBuilder';
import ItineraryView from './pages/ItineraryView';
import CitySearch from './pages/CitySearch';
import ActivitySearch from './pages/ActivitySearch';
import Budget from './pages/Budget';
import Packing from './pages/Packing';
import SharedView from './pages/SharedView';
import Profile from './pages/Profile';
import Notes from './pages/Notes';
import Admin from './pages/Admin';

function ProtectedRoute({ children }) {
  const { state } = useApp();
  if (!state.currentUser) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { state } = useApp();
  return (
    <>
      <Toast />
      <Routes>
        <Route path="/login" element={state.currentUser ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/trips" element={<ProtectedRoute><MyTrips /></ProtectedRoute>} />
        <Route path="/create-trip" element={<ProtectedRoute><CreateTrip /></ProtectedRoute>} />
        <Route path="/itinerary-builder" element={<ProtectedRoute><ItineraryBuilder /></ProtectedRoute>} />
        <Route path="/itinerary-view" element={<ProtectedRoute><ItineraryView /></ProtectedRoute>} />
        <Route path="/city-search" element={<ProtectedRoute><CitySearch /></ProtectedRoute>} />
        <Route path="/activity-search" element={<ProtectedRoute><ActivitySearch /></ProtectedRoute>} />
        <Route path="/budget" element={<ProtectedRoute><Budget /></ProtectedRoute>} />
        <Route path="/packing" element={<ProtectedRoute><Packing /></ProtectedRoute>} />
        <Route path="/shared" element={<ProtectedRoute><SharedView /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={state.currentUser ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
