import { useState } from 'react';
import { disputesAPI } from '../../services/api';
import { AlertTriangle, X, ShieldAlert, CheckCircle } from 'lucide-react';

const DisputeModal = ({ booking, onClose, onSuccess }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await disputesAPI.create({
                bookingId: booking.id,
                reason
            });
            setSubmitted(true);
            setTimeout(() => onSuccess(), 2000);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to raise dispute');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"></div>
                <div className="relative bg-white rounded-[3rem] p-12 w-full max-w-md shadow-2xl text-center border-4 border-amber-400">
                    <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle className="text-amber-600" size={48} strokeWidth={3} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tighter">Dispute Raised</h3>
                    <p className="text-slate-500 font-bold mt-4">
                        DHARA Trust Team has been notified. We will contact you and the operator within 24 hours.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative bg-white rounded-[3rem] p-10 w-full max-w-lg shadow-2xl animate-fade-up border border-red-100">
                <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors">
                    <X size={24} />
                </button>

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center shrink-0">
                        <AlertTriangle className="text-red-500" size={32} />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tighter">Report an Issue</h3>
                        <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-0.5">Booking #{booking.id.slice(0, 8)}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">What went wrong?</label>
                        <textarea
                            required
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-red-500/10 focus:border-red-600 outline-none text-slate-900 font-bold min-h-[150px] transition-all"
                            placeholder="e.g. Machine arrived late, operator was unprofessional, job not completed as promised..."
                        />
                    </div>

                    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex items-start gap-4">
                        <ShieldAlert className="text-amber-600 mt-1 shrink-0" size={20} />
                        <div>
                            <p className="text-[10px] font-black text-amber-800 uppercase tracking-wider mb-1">Escrow Protection Active</p>
                            <p className="text-[11px] font-bold text-amber-700/80 leading-relaxed italic">
                                Raising a dispute will pause the payment release to the operator. Our team will verify the claim and initiate a refund if necessary.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="py-5 rounded-2xl font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-red-600/20 active:scale-95 transition-all text-xs disabled:bg-slate-300"
                        >
                            {loading ? 'Processing...' : 'Raise Dispute'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DisputeModal;
