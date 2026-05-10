import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { List, Calendar, MapPin, Clock, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';

const categoryColors = {
  Sightseeing: 'bg-blue-100 text-blue-700 border-blue-200',
  Food: 'bg-orange-100 text-orange-700 border-orange-200',
  Adventure: 'bg-green-100 text-green-700 border-green-200',
  Culture: 'bg-purple-100 text-purple-700 border-purple-200',
  Other: 'bg-gray-100 text-gray-700 border-gray-200',
};

function getDatesInRange(start, end) {
  const dates = [];
  let cur = new Date(start);
  const endDate = new Date(end);
  while (cur <= endDate) {
    dates.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export default function ItineraryView() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('list');
  const [calMonth, setCalMonth] = useState(() => {
    const trip = state.activeTrip;
    return trip ? new Date(trip.startDate) : new Date();
  });

  const trip = state.activeTrip;
  if (!trip) {
    return (
      <div className="text-center py-16">
        <MapPin size={48} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500 mb-4">No trip selected.</p>
        <button onClick={() => navigate('/trips')} className="bg-teal-600 text-white px-6 py-2 rounded-lg text-sm">Go to My Trips</button>
      </div>
    );
  }

  const stops = state.stops.filter(s => s.tripId === trip.id).sort((a, b) => a.order - b.order);

  // Build a map of date → stop for calendar
  const dateStopMap = {};
  stops.forEach(stop => {
    getDatesInRange(stop.arrivalDate, stop.departureDate).forEach(d => {
      dateStopMap[d] = stop;
    });
  });

  // Calendar helpers
  const year = calMonth.getFullYear();
  const month = calMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = calMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const stopColors = ['bg-teal-100 text-teal-700', 'bg-amber-100 text-amber-700', 'bg-purple-100 text-purple-700', 'bg-pink-100 text-pink-700', 'bg-blue-100 text-blue-700'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{trip.name}</h1>
          <p className="text-sm text-gray-500">{trip.startDate} → {trip.endDate} · {stops.length} stops</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
          <button onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white shadow text-teal-600' : 'text-gray-500'}`}>
            <List size={15} /> List
          </button>
          <button onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'calendar' ? 'bg-white shadow text-teal-600' : 'text-gray-500'}`}>
            <Calendar size={15} /> Calendar
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-6">
          {stops.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
              <p className="text-gray-400">No stops added yet.</p>
            </div>
          ) : stops.map((stop, idx) => {
            const activities = state.activities.filter(a => a.stopId === stop.id).sort((a, b) => a.time.localeCompare(b.time));
            const totalCost = activities.reduce((s, a) => s + (a.cost || 0), 0);
            return (
              <div key={stop.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className={`px-5 py-4 flex items-center justify-between ${stopColors[idx % stopColors.length]} border-b`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center font-bold text-sm">{idx + 1}</div>
                    <div>
                      <h3 className="font-bold text-lg">{stop.cityName}</h3>
                      <p className="text-xs opacity-75">{stop.arrivalDate} → {stop.departureDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-75">Est. Activities</p>
                    <p className="font-bold">${totalCost}</p>
                  </div>
                </div>
                <div className="p-4">
                  {activities.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No activities planned for this stop.</p>
                  ) : (
                    <div className="space-y-2">
                      {activities.map(act => (
                        <div key={act.id} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 border ${categoryColors[act.category] || categoryColors.Other}`}>
                          <span className="text-xs font-semibold w-12 flex-shrink-0">{act.time}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{act.name}</p>
                            {act.duration && <p className="text-xs opacity-70">{act.duration}</p>}
                          </div>
                          <span className="text-xs font-semibold">${act.cost}</span>
                          <span className="text-xs px-2 py-0.5 bg-white/60 rounded-full">{act.category}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() - 1))} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ChevronLeft size={18} /></button>
            <h3 className="font-semibold text-gray-800">{monthName}</h3>
            <button onClick={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() + 1))} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ChevronRight size={18} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const stop = dateStopMap[dateStr];
              const stopIdx = stop ? stops.findIndex(s => s.id === stop.id) : -1;
              return (
                <div key={day} className={`min-h-14 rounded-lg p-1 text-center border transition-colors
                  ${stop ? `${stopColors[stopIdx % stopColors.length]} border-current/20` : 'border-gray-100 hover:bg-gray-50'}`}>
                  <span className="text-xs font-medium block mb-1">{day}</span>
                  {stop && <span className="text-xs font-semibold leading-tight block truncate">{stop.cityName}</span>}
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-2">
            {stops.map((stop, idx) => (
              <span key={stop.id} className={`text-xs px-2 py-1 rounded-full font-medium ${stopColors[idx % stopColors.length]}`}>
                {stop.cityName}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
