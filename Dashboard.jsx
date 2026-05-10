import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CITIES } from '../data/mockData';
import { PlusCircle, MapPin, Calendar, DollarSign, Star } from 'lucide-react';
import { SkeletonCard } from '../components/Skeleton';

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => { setTimeout(() => setLoading(false), 600); }, []);

  const userTrips = state.trips
    .filter(t => t.userId === state.currentUser?.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  const totalBudget = state.budgetItems
    .filter(b => state.trips.filter(t => t.userId === state.currentUser?.id).map(t => t.id).includes(b.tripId))
    .reduce((sum, b) => sum + b.amount, 0);

  const activityCosts = state.activities
    .filter(a => state.trips.filter(t => t.userId === state.currentUser?.id).map(t => t.id).includes(a.tripId))
    .reduce((sum, a) => sum + (a.cost || 0), 0);

  const totalEstimated = totalBudget + activityCosts;

  const getStopCount = (tripId) => state.stops.filter(s => s.tripId === tripId).length;

  const recommended = CITIES.filter(c => c.popularity >= 4).slice(0, 4);

  const handleTripClick = (trip) => {
    dispatch({ type: 'SET_ACTIVE_TRIP', payload: trip });
    navigate('/itinerary-view');
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, <span className="text-amber-500">{state.currentUser?.name?.split(' ')[0]}</span> ✈️
        </h1>
        <p className="text-gray-500 text-sm mt-1">Ready to plan your next adventure?</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Active Trips</p>
          <p className="text-2xl font-bold text-teal-600">{state.trips.filter(t => t.userId === state.currentUser?.id).length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Total Estimated Spend</p>
          <p className="text-2xl font-bold text-amber-500">${totalEstimated.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 col-span-2 md:col-span-1">
          <p className="text-xs text-gray-500 mb-1">Destinations Saved</p>
          <p className="text-2xl font-bold text-purple-500">{state.currentUser?.savedDestinations?.length || 0}</p>
        </div>
      </div>

      {/* CTA */}
      <button onClick={() => navigate('/create-trip')}
        className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all mb-8">
        <PlusCircle size={20} />
        Plan a New Trip
      </button>

      {/* Recent Trips */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Trips</h2>
          <button onClick={() => navigate('/trips')} className="text-sm text-teal-600 hover:underline">View all</button>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : userTrips.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-dashed border-gray-200">
            <MapPin size={32} className="mx-auto mb-2 opacity-40" />
            <p>No trips yet. Start planning!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {userTrips.map(trip => (
              <div key={trip.id} onClick={() => handleTripClick(trip)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                <div className="h-28 bg-gradient-to-br from-teal-400 to-teal-600 relative">
                  {trip.coverPhoto && <img src={trip.coverPhoto} alt="" className="w-full h-full object-cover" />}
                  <div className="absolute inset-0 bg-black/20 flex items-end p-3">
                    <h3 className="text-white font-semibold text-sm">{trip.name}</h3>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <Calendar size={12} />
                    {trip.startDate} → {trip.endDate}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin size={12} />
                    {getStopCount(trip.id)} destination{getStopCount(trip.id) !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recommended Destinations */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recommended Destinations</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recommended.map(city => (
            <div key={city.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="h-24 overflow-hidden">
                <img src={city.image} alt={city.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm text-gray-800">{city.name}</p>
                <p className="text-xs text-gray-400">{city.country}</p>
                <div className="flex items-center gap-0.5 mt-1">
                  {Array.from({ length: city.popularity }).map((_, i) => (
                    <Star key={i} size={10} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
