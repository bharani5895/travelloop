import { CheckCircle, XCircle, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toasts } = useApp();
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium animate-fade-in
          ${t.type === 'success' ? 'bg-teal-600' : t.type === 'error' ? 'bg-red-500' : 'bg-amber-500'}`}>
          {t.type === 'success' ? <CheckCircle size={16} /> : t.type === 'error' ? <XCircle size={16} /> : <Info size={16} />}
          {t.message}
        </div>
      ))}
    </div>
  );
}
