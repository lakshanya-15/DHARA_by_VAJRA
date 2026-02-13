import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserCircle } from 'lucide-react';

import { useTranslation } from 'react-i18next';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        if (result.user.role === 'OPERATOR') {
          navigate('/operator/dashboard');
        } else {
          navigate('/farmer/dashboard');
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("Login catch error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Immersive Background - Softened */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("/extracomponents/uibg1.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 max-w-md w-full mx-4 animate-fade-up">
        {/* Light & Elegant Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group border border-white">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-colors duration-500"></div>

          <div className="text-center mb-10 relative z-10">
            <div className="inline-flex items-center justify-center w-24 h-24 mb-6 animate-float">
              <img src="/dhara_logo.png" alt="Logo" className="w-16 h-16 object-cover rounded-full drop-shadow-xl" />
            </div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">{t('login.title')}</h2>
            <p className="text-slate-500 mt-2 font-bold text-sm uppercase tracking-widest">{t('login.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-xs font-black uppercase tracking-widest text-center animate-pulse">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">{t('login.email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all text-slate-900 font-bold placeholder:text-slate-300"
                placeholder="farmer@dhara.com"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">{t('login.password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all text-slate-900 font-bold placeholder:text-slate-300"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-green-600/20 active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 btn-premium uppercase tracking-widest text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {t('login.authenticating')}
                </span>
              ) : t('login.signIn')}
            </button>
          </form>

          <div className="mt-10 text-center relative z-10">
            <p className="text-sm text-slate-400 font-bold">
              {t('login.noAccount')}
            </p>
            <Link to="/register" className="inline-block mt-2 text-green-600 hover:text-green-700 font-black transition-colors border-b-2 border-green-600/10 hover:border-green-600 pb-0.5 uppercase tracking-widest text-[10px]">
              {t('login.createAccount')}
            </Link>
          </div>
        </div>

        {/* Brand Footer */}
        <div className="text-center mt-8 text-white/20 text-[10px] font-black uppercase tracking-[0.3em] cursor-default select-none">
          © 2026 VAJRA Systems • Rural India Empowered
        </div>
      </div>
    </div>
  );
};

export default Login;
