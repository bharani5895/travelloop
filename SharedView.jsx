import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Share2, Copy, MessageCircle, MapPin, Calendar, Clock, DollarSign, CheckCircle } from 'lucide-react';

// Twitter/X icon as inline SVG since lucide-react renamed it
const TwitterIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export default function SharedView() {
  const { state, dispatch, addToast } = useApp();
  const navigate = useNavigate();
  const [selectedTripId, setSelectedTripId] = useState(state.activeTrip?.id || '');
  const [copied, setCopied] = useState(false);

  const publicTrips = state.trips.filter(t => t.isPublic);
  const trip = state.trips.find(t => t.id === selectedTripId) || publicTrips[0];

  const stops = trip ? state.stops.filter(s => s.tripId === trip.id).sort((a, b) => a.order - b.order) : [];
  const shareUrl = `https://traveloop.app/share/${trip?.id || 'demo'}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    setCopied(true);
    addToast('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyTrip = () => {
    if (!trip) return;
    const newTripId = `t${Date.now()}`;
    const newTrip = { ...trip, id: newTripId, userId: state.currentUser.id, name: `${trip.name} (Copy)`, isPublic: false, createdAt: new Date().toISOString().split('T')[0] };
    const newStops = stops.map((s, i) => ({ ...s, id: `s${Date.now()}${i}`, tripId: newTripId }));
    const newActivities = state.activities
      .filter(a => a.tripId === trip.id)
      .map((a, i) => {
        const origStop = stops.find(s => s.id === a.stopId);
        const newStop = newStops[stops.indexOf(origStop)];
        return { ...a, id: `act${Date.now()}${i}`, tripId: newTripId, stopId: newStop?.id || a.stopId };
      });
    dispatch({ type: 'COPY_TRIP', payload: { trip: newTrip, stops: newStops, activities: newActivities } });
    addToast('Trip copied to your trips!');
    navigate('/trips');
  };

  const togglePublic = () => {
    if (!trip) return;
    dispatch({ type: 'UPDATE_TRIP', payload: { ...trip, isPublic: !trip.isPublic } });
    addToast(trip.isPublic ? 'Trip set to private' : 'Trip is now public!');
  };

  const categoryColors = { Sightseeing: 'bg-blue-100 text-blue-700', Food: 'bg-orange-100 text-orange-700', Adventure: 'bg-green-100 text-green-700', Culture: 'bg-purple-100 text-purple-700', Other: 'bg-gray-100 text-gray-700' };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Share Itinerary</h1>
        <p className="text-sm text-gray-500">Share your trip plans with friends and family.</p>
      </div>

      {/* Trip Selector */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Trip to Share</label>
        <select value={selectedTripId} onChange={e => setSelectedTripId(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white">
          <option value="">-- Select a trip --</option>
          {state.trips.filter(t => t.userId === state.currentUser?.id).map(t => (
            <option key={t.id} value={t.id}>{t.name} {t.isPublic ? '(Public)' : '(Private)'}</option>
          ))}
        </select>
      </div>

      {trip && (
        <>
          {/* Share Controls */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Visibility</p>
                <p className="text-xs text-gray-400">{trip.isPublic ? 'Anyone with the link can view' : 'Only you can see this trip'}</p>
              </div>
              <button onClick={togglePublic}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${trip.isPublic ? 'bg-teal-500' : 'bg-gray-200'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${trip.isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 mb-4">
              <span className="text-xs text-gray-500 flex-1 truncate">{shareUrl}</span>
              <button onClick={handleCopyUrl}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex-shrink-0
                  ${copied ? 'bg-teal-100 text-teal-700' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                {copied ? <CheckCircle size={13} /> : <Copy size={13} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="flex gap-3">
              <a href={`https://twitter.com/intent/tweet?text=Check out my trip: ${trip.name}&url=${shareUrl}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm px-4 py-2 rounded-lg transition-colors">
                <TwitterIcon size={15} /> Twitter / X
              </a>
              <a href={`https://wa.me/?text=Check out my trip: ${trip.name} ${shareUrl}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-lg transition-colors">
                <MessageCircle size={15} /> WhatsApp
              </a>
              <button onClick={handleCopyTrip}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm px-4 py-2 rounded-lg transition-colors ml-auto">
                <Copy size={15} /> Copy Trip
              </button>
            </div>
          </div>

          {/* Read-only Itinerary Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white">
              <h2 className="text-xl font-bold">{trip.name}</h2>
              <div className="flex items-center gap-4 mt-1 text-teal-100 text-sm">
                <span className="flex items-center gap-1"><Calendar size={13} />{trip.startDate} → {trip.endDate}</span>
                <span className="flex items-center gap-1"><MapPin size={13} />{stops.length} stops</span>
              </div>
              {trip.description && <p className="text-teal-100 text-sm mt-2">{trip.description}</p>}
            </div>
            <div className="p-4 space-y-4">
              {stops.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No stops in this itinerary.</p>
              ) : stops.map((stop, idx) => {
                const activities = state.activities.filter(a => a.stopId === stop.id).sort((a, b) => a.time.localeCompare(b.time));
                return (
                  <div key={stop.id} className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <div className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">{idx + 1}</div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{stop.cityName}</h3>
                        <p className="text-xs text-gray-500">{stop.arrivalDate} → {stop.departureDate}</p>
                      </div>
                    </div>
                    {activities.length > 0 && (
                      <div className="divide-y divide-gray-50">
                        {activities.map(act => (
                          <div key={act.id} className="flex items-center gap-3 px-4 py-2.5">
                            <span className="text-xs text-gray-400 w-12 flex-shrink-0">{act.time}</span>
                            <span className="text-sm text-gray-700 flex-1">{act.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[act.category] || categoryColors.Other}`}>{act.category}</span>
                            <span className="text-xs text-gray-500 flex items-center gap-0.5"><DollarSign size={10} />{act.cost}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
