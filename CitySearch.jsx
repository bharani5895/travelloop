import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CITIES } from '../data/mockData';
import { Search, Star, Plus, Bookmark, BookmarkCheck, MapPin } from 'lucide-react';

const costColors = { low: 'bg-green-100 text-green-700', medium: 'bg-amber-100 text-amber-700', high: 'bg-red-100 text-red-700' };

export default function CitySearch() {
  const { state, dispatch, addToast } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [costFilter, setCostFilter] = useState('All');
  const [addedCities, setAddedCities] = useState({});

  const regions = ['All', ...Array.from(new Set(CITIES.map(c => c.region)))];

  const filtered = CITIES.filter(c => {
    const matchQ = c.name.toLowerCase().includes(query.toLowerCase()) || c.country.toLowerCase().includes(query.toLowerCase());
    const matchR = regionFilter === 'All' || c.region === regionFilter;
    const matchC = costFilter === 'All' || c.costIndex === costFilter;
    return matchQ && matchR && matchC;
  });

  const handleAddToTrip = (city) => {
    if (!state.activeTrip) {
      addToast('Please select a trip first from My Trips', 'error');
      return;
    }
    const exists = state.stops.find(s => s.tripId === state.activeTrip.id && s.cityId === city.id);
    if (exists) { addToast(`${city.name} is already in your trip`, 'info'); return; }
    const stop = {
      id: `s${Date.now()}`, tripId: state.activeTrip.id, cityId: city.id, cityName: city.name,
      arrivalDate: state.activeTrip.startDate, departureDate: state.activeTrip.endDate,
      order: state.stops.filter(s => s.tripId === state.activeTrip.id).length,
    };
    dispatch({ type: 'ADD_STOP', payload: stop });
    setAddedCities(prev => ({ ...prev, [city.id]: true }));
    addToast(`${city.name} added to ${state.activeTrip.name}!`);
  };

  const toggleSave = (cityId) => {
    dispatch({ type: 'TOGGLE_SAVED_DESTINATION', payload: cityId });
    const isSaved = state.currentUser?.savedDestinations?.includes(cityId);
    addToast(isSaved ? 'Removed from saved' : 'Saved to your destinations!');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Explore Cities</h1>
        {state.activeTrip ? (
          <p className="text-sm text-teal-600">Adding to: <span className="font-semibold">{state.activeTrip.name}</span></p>
        ) : (
          <p className="text-sm text-amber-600">No active trip — <button onClick={() => navigate('/trips')} className="underline">select one</button> to add cities.</p>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search cities or countries..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
        </div>
        <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white">
          {regions.map(r => <option key={r}>{r}</option>)}
        </select>
        <select value={costFilter} onChange={e => setCostFilter(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white">
          <option value="All">All Costs</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <p className="text-sm text-gray-400 mb-4">{filtered.length} cities found</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map(city => {
          const isSaved = state.currentUser?.savedDestinations?.includes(city.id);
          const isAdded = addedCities[city.id];
          return (
            <div key={city.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-36 overflow-hidden relative">
                <img src={city.image} alt={city.name} className="w-full h-full object-cover" />
                <button onClick={() => toggleSave(city.id)}
                  className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-white transition-colors">
                  {isSaved ? <BookmarkCheck size={16} className="text-teal-600" /> : <Bookmark size={16} className="text-gray-500" />}
                </button>
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">{city.name}</h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10} />{city.country} · {city.region}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${costColors[city.costIndex]}`}>{city.costIndex}</span>
                </div>
                <div className="flex items-center gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className={i < city.popularity ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                  ))}
                  <span className="text-xs text-gray-400 ml-1">{city.popularity}/5</span>
                </div>
                <button onClick={() => handleAddToTrip(city)}
                  className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isAdded ? 'bg-teal-50 text-teal-600 border border-teal-200' : 'bg-teal-600 hover:bg-teal-700 text-white'}`}>
                  <Plus size={14} />
                  {isAdded ? 'Added to Trip' : 'Add to Trip'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
