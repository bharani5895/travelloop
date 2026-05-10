import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ACTIVITIES_CATALOG } from '../data/mockData';
import { Search, Plus, Minus, X, Clock, DollarSign, Tag } from 'lucide-react';

const categoryColors = {
  Sightseeing: 'bg-blue-100 text-blue-700',
  Food: 'bg-orange-100 text-orange-700',
  Adventure: 'bg-green-100 text-green-700',
  Culture: 'bg-purple-100 text-purple-700',
};

export default function ActivitySearch() {
  const { state, dispatch, addToast } = useApp();
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [costFilter, setCostFilter] = useState('All');
  const [durationFilter, setDurationFilter] = useState('All');
  const [quickView, setQuickView] = useState(null);

  const trip = state.activeTrip;
  const stops = trip ? state.stops.filter(s => s.tripId === trip.id) : [];

  const addedActivityNames = state.activities
    .filter(a => a.tripId === trip?.id)
    .map(a => a.name);

  const filtered = ACTIVITIES_CATALOG.filter(a => {
    const matchQ = a.name.toLowerCase().includes(query.toLowerCase()) || a.city.toLowerCase().includes(query.toLowerCase()) || a.description.toLowerCase().includes(query.toLowerCase());
    const matchC = catFilter === 'All' || a.category === catFilter;
    const matchCost = costFilter === 'All' ||
      (costFilter === 'Free' && a.cost === 0) ||
      (costFilter === 'Under $30' && a.cost < 30) ||
      (costFilter === '$30-$80' && a.cost >= 30 && a.cost <= 80) ||
      (costFilter === 'Over $80' && a.cost > 80);
    const matchDur = durationFilter === 'All' ||
      (durationFilter === 'Under 2h' && parseFloat(a.duration) < 2) ||
      (durationFilter === '2-4h' && parseFloat(a.duration) >= 2 && parseFloat(a.duration) <= 4) ||
      (durationFilter === 'Over 4h' && parseFloat(a.duration) > 4);
    return matchQ && matchC && matchCost && matchDur;
  });

  const handleToggle = (activity) => {
    if (!trip) { addToast('Select a trip first from My Trips', 'error'); return; }
    const isAdded = addedActivityNames.includes(activity.name);
    if (isAdded) {
      const existing = state.activities.find(a => a.tripId === trip.id && a.name === activity.name);
      if (existing) { dispatch({ type: 'DELETE_ACTIVITY', payload: existing.id }); addToast('Activity removed', 'error'); }
    } else {
      const stop = stops[0];
      if (!stop) { addToast('Add a stop to your trip first', 'error'); return; }
      const act = {
        id: `act${Date.now()}`, stopId: stop.id, tripId: trip.id,
        name: activity.name, time: '10:00', cost: activity.cost,
        category: activity.category, duration: activity.duration,
      };
      dispatch({ type: 'ADD_ACTIVITY', payload: act });
      addToast(`${activity.name} added!`);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Activity Search</h1>
        {trip ? (
          <p className="text-sm text-teal-600">Adding to: <span className="font-semibold">{trip.name}</span></p>
        ) : (
          <p className="text-sm text-amber-600">No active trip selected.</p>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search activities..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white">
          {['All', 'Sightseeing', 'Food', 'Adventure', 'Culture'].map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={costFilter} onChange={e => setCostFilter(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white">
          {['All', 'Free', 'Under $30', '$30-$80', 'Over $80'].map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={durationFilter} onChange={e => setDurationFilter(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white">
          {['All', 'Under 2h', '2-4h', 'Over 4h'].map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      <p className="text-sm text-gray-400 mb-4">{filtered.length} activities found</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map(act => {
          const isAdded = addedActivityNames.includes(act.name);
          return (
            <div key={act.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-32 overflow-hidden cursor-pointer" onClick={() => setQuickView(act)}>
                <img src={act.image} alt={act.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-800 text-sm leading-tight cursor-pointer hover:text-teal-600" onClick={() => setQuickView(act)}>{act.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${categoryColors[act.category] || 'bg-gray-100 text-gray-700'}`}>{act.category}</span>
                </div>
                <p className="text-xs text-gray-400 mb-2 line-clamp-2">{act.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><DollarSign size={11} />{act.cost === 0 ? 'Free' : `$${act.cost}`}</span>
                  <span className="flex items-center gap-1"><Clock size={11} />{act.duration}</span>
                  <span className="flex items-center gap-1"><Tag size={11} />{act.city}</span>
                </div>
                <button onClick={() => handleToggle(act)}
                  className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isAdded ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-teal-600 hover:bg-teal-700 text-white'}`}>
                  {isAdded ? <><Minus size={14} /> Remove</> : <><Plus size={14} /> Add</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick View Modal */}
      {quickView && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="h-48 overflow-hidden relative">
              <img src={quickView.image} alt={quickView.name} className="w-full h-full object-cover" />
              <button onClick={() => setQuickView(null)} className="absolute top-3 right-3 bg-white/80 rounded-full p-1.5 hover:bg-white transition-colors">
                <X size={18} className="text-gray-700" />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-lg text-gray-800">{quickView.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryColors[quickView.category] || 'bg-gray-100 text-gray-700'}`}>{quickView.category}</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">{quickView.description}</p>
              <div className="flex gap-4 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1.5"><DollarSign size={14} className="text-teal-500" />{quickView.cost === 0 ? 'Free' : `$${quickView.cost}`}</span>
                <span className="flex items-center gap-1.5"><Clock size={14} className="text-teal-500" />{quickView.duration}</span>
                <span className="flex items-center gap-1.5"><Tag size={14} className="text-teal-500" />{quickView.city}</span>
              </div>
              <button onClick={() => { handleToggle(quickView); setQuickView(null); }}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors
                  ${addedActivityNames.includes(quickView.name) ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-teal-600 hover:bg-teal-700 text-white'}`}>
                {addedActivityNames.includes(quickView.name) ? 'Remove from Trip' : 'Add to Trip'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
