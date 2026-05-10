import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, Plane } from 'lucide-react';

export default function Login() {
  const { state, dispatch, addToast } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (mode === 'signup' && !form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    if (mode !== 'forgot' && !form.password) e.password = 'Password is required';
    else if (mode !== 'forgot' && form.password.length < 6) e.password = 'Password must be at least 6 characters';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (mode === 'forgot') {
        addToast('Password reset link sent (simulated)', 'info');
        setMode('login');
        return;
      }
      if (mode === 'login') {
        const user = state.users.find(u => u.email === form.email && u.password === form.password);
        if (!user) { setErrors({ general: 'Invalid email or password' }); return; }
        dispatch({ type: 'LOGIN', payload: user });
        addToast(`Welcome back, ${user.name}!`);
        navigate('/dashboard');
      } else {
        if (state.users.find(u => u.email === form.email)) {
          setErrors({ email: 'Email already registered' }); return;
        }
        const newUser = {
          id: `u${Date.now()}`, name: form.name, email: form.email, password: form.password,
          photo: null, language: 'English', savedDestinations: [], isAdmin: false,
          joinedDate: new Date().toISOString().split('T')[0], suspended: false,
        };
        dispatch({ type: 'SIGNUP', payload: newUser });
        addToast(`Welcome to Traveloop, ${form.name}!`);
        navigate('/dashboard');
      }
    }, 800);
  };

  const Field = ({ id, label, type = 'text', placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        id={id} type={type} placeholder={placeholder} value={form[id]}
        onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
        className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition
          ${errors[id] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}
      />
      {errors[id] && <p className="text-red-500 text-xs mt-1">{errors[id]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <Plane size={22} className="text-white" />
            </div>
            <span className="text-3xl font-bold"><span className="text-amber-500">Travel</span><span className="text-teal-600">oop</span></span>
          </div>
          <p className="text-gray-500 text-sm">Personalized travel planning made easy</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {mode !== 'forgot' && (
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              {['login', 'signup'].map(m => (
                <button key={m} onClick={() => { setMode(m); setErrors({}); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all capitalize
                    ${mode === m ? 'bg-white shadow text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  {m === 'login' ? 'Log In' : 'Sign Up'}
                </button>
              ))}
            </div>
          )}

          {mode === 'forgot' && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Reset Password</h2>
              <p className="text-sm text-gray-500 mt-1">Enter your email to receive a reset link.</p>
            </div>
          )}

          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{errors.general}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && <Field id="name" label="Full Name" placeholder="Your name" />}
            <Field id="email" label="Email" type="email" placeholder="you@example.com" />
            {mode !== 'forgot' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className={`w-full px-4 py-2.5 pr-10 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition
                      ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              {mode === 'login' ? 'Log In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </button>
          </form>

          {mode === 'login' && (
            <button onClick={() => { setMode('forgot'); setErrors({}); }}
              className="mt-4 text-sm text-teal-600 hover:underline w-full text-center">
              Forgot Password?
            </button>
          )}
          {mode === 'forgot' && (
            <button onClick={() => { setMode('login'); setErrors({}); }}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700 w-full text-center">
              ← Back to Login
            </button>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
            Demo: bharani@traveloop.com / password123
          </div>
        </div>
      </div>
    </div>
  );
}
