import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { Users, Map, Activity, TrendingUp, Shield } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Admin() {
  const { state, dispatch, addToast } = useApp();

  if (!state.currentUser?.isAdmin) {
    return (
      <div className="text-center py-16">
        <Shield size={48} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">Admin access required.</p>
      </div>
    );
  }

  const totalUsers = state.users.length;
  const totalTrips = state.trips.length;
  const totalActivities = state.activities.length;

  // Most popular city
  const cityCount = {};
  state.stops.forEach(s => { cityCount[s.cityName] = (cityCount[s.cityName] || 0) + 1; });
  const topCity = Object.entries(cityCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Top 5 cities bar chart
  const topCitiesData = Object.entries(cityCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Trips over time (mock monthly data)
  const tripsOverTime = MONTHS.map((month, i) => ({
    month,
    trips: Math.floor(Math.random() * 15) + (i < 5 ? i * 2 : 10),
  }));

  // User trip counts
  const userTripCounts = state.users.map(u => ({
    ...u,
    tripCount: state.trips.filter(t => t.userId === u.id).length,
  }));

  const handleSuspend = (userId) => {
    dispatch({ type: 'SUSPEND_USER', payload: userId });
    const user = state.users.find(u => u.id === userId);
    addToast(`${user?.name} ${user?.suspended ? 'unsuspended' : 'suspended'}`, user?.suspended ? 'success' : 'error');
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
          <Shield size={20} className="text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Platform analytics and user management</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users', value: totalUsers, icon: Users, color: 'text-teal-600 bg-teal-50' },
          { label: 'Total Trips', value: totalTrips, icon: Map, color: 'text-amber-600 bg-amber-50' },
          { label: 'Activities Added', value: totalActivities, icon: Activity, color: 'text-purple-600 bg-purple-50' },
          { label: 'Most Popular City', value: topCity, icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-xl font-bold text-gray-800">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Top Cities Bar Chart */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">Top 5 Most-Visited Cities</h3>
          {topCitiesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topCitiesData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Trips" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-sm text-center py-8">No data yet</p>}
        </div>

        {/* Trips Over Time Line Chart */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">Trips Created Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={tripsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="trips" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Trips" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700">User Management</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trips</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {userTripCounts.map(user => (
                <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${user.suspended ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs flex-shrink-0">
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user.name}</p>
                        {user.isAdmin && <span className="text-xs text-amber-600 font-medium">Admin</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3 font-medium text-gray-700">{user.tripCount}</td>
                  <td className="px-4 py-3 text-gray-500">{user.joinedDate}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.suspended ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {user.suspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {!user.isAdmin && (
                      <button onClick={() => handleSuspend(user.id)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors
                          ${user.suspended ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                        {user.suspended ? 'Unsuspend' : 'Suspend'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
