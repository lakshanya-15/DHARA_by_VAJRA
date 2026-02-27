import { useState } from 'react';
import { reviewsAPI } from '../../services/api';
import { Star, X, MessageSquare, ShieldCheck } from 'lucide-react';

const ReviewModal = ({ booking, onClose, onSuccess }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await reviewsAPI.create({
                bookingId: booking.id,
                rating,
                comment
            });
            onSuccess();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative bg-white rounded-[3rem] p-10 w-full max-w-lg shadow-2xl animate-fade-up border border-white">
                <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors">
                    <X size={24} />
                </button>

                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Star className="text-amber-500 fill-amber-500" size={32} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tighter">Rate Your Experience</h3>
                    <p className="text-slate-500 font-bold text-sm mt-2">How was the service for {booking.Asset?.name}?</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Stars */}
                    <div className="flex justify-center gap-4">
                        {[1, 2, 3, 4, 5].map((num) => (
                            <button
                                key={num}
                                type="button"
                                onClick={() => setRating(num)}
                                className={`transition-all active:scale-90 ${rating >= num ? 'text-amber-500 hover:text-amber-600' : 'text-slate-200 hover:text-slate-300'}`}
                            >
                                <Star size={40} fill={rating >= num ? 'currentColor' : 'none'} strokeWidth={2.5} />
                            </button>
                        ))}
                    </div>

                    {/* Comment */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                            <MessageSquare size={14} />
                            Your Feedback (Optional)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-green-500/10 focus:border-green-600 outline-none text-slate-900 font-bold min-h-[120px] transition-all"
                            placeholder="Tell us about the machine condition, operator behavior..."
                        />
                    </div>

                    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex items-start gap-3">
                        <ShieldCheck className="text-blue-600 mt-1" size={18} />
                        <p className="text-[10px] font-bold text-blue-800 leading-relaxed uppercase tracking-wider">
                            Your rating helps other farmers choose better machines and builds a stronger community!
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all text-sm disabled:bg-slate-400"
                    >
                        {loading ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
