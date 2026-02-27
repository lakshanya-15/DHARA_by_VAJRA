import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: phone, 2: otp
  const { requestOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await requestOTP(phone);
    if (res.success) {
      setStep(2);
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await verifyOTP(phone, otp);
    if (res.success) {
      const role = res.user.role?.toLowerCase();
      if (role === 'operator') navigate('/operator/dashboard');
      else navigate('/farmer/dashboard');
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0" style={{ backgroundImage: 'url("/extracomponents/uibg1.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
      </div>

      <button onClick={() => navigate(-1)} className="absolute top-6 left-6 md:top-8 md:left-12 z-50 group flex items-center gap-3 px-5 py-2.5 bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl text-slate-600 hover:text-green-600 transition-all active:scale-95 shadow-sm">
        <ArrowLeft size={16} strokeWidth={3} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Go Back</span>
      </button>

      <div className="relative z-10 max-w-md w-full mx-4 animate-fade-up">
        <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl border border-white">
          <div className="text-center mb-10">
            <img src="/dhara_logo.png" alt="Logo" className="w-16 h-16 object-cover rounded-full mx-auto mb-6" />
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">{t('login.title')}</h2>
            <p className="text-slate-500 mt-2 font-bold text-sm uppercase tracking-widest">Login with Phone</p>
          </div>

          <form onSubmit={step === 1 ? handleRequestOTP : handleVerifyOTP} className="space-y-6">
            {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-black uppercase text-center">{error}</div>}

            {step === 1 ? (
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-green-600 outline-none font-bold"
                  placeholder="91XXXXXXXX"
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Enter 6-digit OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-green-600 outline-none font-bold text-center tracking-[0.5em]"
                  placeholder="123456"
                  maxLength={6}
                  required
                />
                <p className="text-[10px] text-center text-slate-400 mt-2">Check your phone for the code</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95 disabled:bg-slate-100 uppercase tracking-widest text-sm"
            >
              {loading ? 'Processing...' : (step === 1 ? 'Send OTP' : 'Verify & Login')}
            </button>
            {step === 2 && (
              <button type="button" onClick={() => setStep(1)} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-green-600">Change Phone Number</button>
            )}
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-slate-400 font-bold">{t('login.noAccount')}</p>
            <Link to="/register" className="inline-block mt-2 text-green-600 font-black border-b-2 border-green-600/10 hover:border-green-600 uppercase tracking-widest text-[10px]">
              {t('login.createAccount')}
            </Link>
          </div>
        </div>
        <div className="text-center mt-8 text-white/20 text-[10px] font-black uppercase tracking-[0.3em] cursor-default select-none">
          © 2026 VAJRA Systems • Rural India Empowered
        </div>
      </div>
    </div>
  );
};

export default Login;
