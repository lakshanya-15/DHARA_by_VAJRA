import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

import { useTranslation } from 'react-i18next';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('FARMER');
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await register(name, email, password, role);
    if (result.success) {
      navigate('/login');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden py-12 px-4">
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

      <div className="relative z-10 max-w-lg w-full animate-fade-up">
        {/* Light & Elegant Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] p-10 md:p-12 shadow-2xl relative overflow-hidden group border border-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-green-500/20 transition-colors duration-700"></div>

          <div className="text-center mb-10 relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[1.5rem] bg-green-50 mb-6 shadow-sm border border-green-100">
              <UserPlus className="w-10 h-10 text-green-600" strokeWidth={3} />
            </div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter">{t('register.title')}</h2>
            <p className="text-green-600 font-black uppercase tracking-[0.3em] text-[10px] mt-3">{t('register.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 px-2">{t('register.accountType')}</label>
              <div className="grid grid-cols-2 gap-4">
                {['FARMER', 'OPERATOR'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-4 px-6 text-[10px] font-black rounded-2xl uppercase tracking-[0.2em] transition-all relative overflow-hidden group/role
                      ${role === r
                        ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                        : 'bg-slate-50 text-slate-400 border border-slate-100 hover:border-slate-200'}`}
                  >
                    {r === 'FARMER' ? t('common.farmer') : t('common.operator')}
                    {role === r && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
                  </button>
                ))}
              </div>
            </div>

            <div className="group/input relative">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 px-2 group-focus-within/input:text-green-600 transition-colors">{t('register.fullName')}</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none text-slate-900 font-bold transition-all placeholder:text-slate-300"
                placeholder="Ex. Arjun Patel"
              />
            </div>

            <div className="group/input relative">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 px-2 group-focus-within/input:text-green-600 transition-colors">{t('register.email')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none text-slate-900 font-bold transition-all placeholder:text-slate-300"
                placeholder="connect@dhara.com"
              />
            </div>

            <div className="group/input relative">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 px-2 group-focus-within/input:text-green-600 transition-colors">{t('register.password')}</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none text-slate-900 font-bold transition-all placeholder:text-slate-300"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-green-600/20 active:scale-95 btn-premium uppercase tracking-[0.3em] text-xs mt-4"
            >
              {t('register.initialize')}
            </button>
          </form>

          <div className="mt-10 text-center relative z-10">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              {t('register.hasAccount')}{' '}
              <Link to="/login" className="text-green-600 hover:text-green-700 underline underline-offset-4 decoration-2">
                {t('register.secureLogin')}
              </Link>
            </p>
          </div>
        </div>

        {/* Brand Footer */}
        <div className="mt-8 text-center animate-fade-in delay-500">
          <p className="text-slate-300 text-[9px] font-black uppercase tracking-[0.5em] flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-slate-100"></span>
            DHARA Digital Protocol
            <span className="w-8 h-px bg-slate-100"></span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
