import { useState, useEffect } from 'react';
import { walletAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Wallet, ArrowLeft, Plus, History, TrendingUp, TrendingDown, Info, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const WalletPage = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [depositAmount, setDepositAmount] = useState('');
    const [showDepositModal, setShowDepositModal] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await walletAPI.getMy();
            if (res.data.success) {
                setBalance(res.data.data.balance);
                setTransactions(res.data.data.transactions);
            }
        } catch (err) {
            console.error('Failed to fetch wallet:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeposit = async (e) => {
        e.preventDefault();
        try {
            const amount = parseFloat(depositAmount);
            if (isNaN(amount) || amount <= 0) return;

            await walletAPI.deposit(amount);
            setShowDepositModal(false);
            setDepositAmount('');
            fetchData();
        } catch (err) {
            alert('Deposit failed. Please try again.');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-green-600 transition-colors mb-4 group">
                        <ArrowLeft size={16} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Dashboard</span>
                    </button>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter">My Wallet</h2>
                </div>
                <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-3">
                    <ShieldCheck className="text-green-600" size={24} />
                    <div className="text-[10px] font-black text-green-700 uppercase tracking-widest leading-none">
                        DHARA Secure Escrow Enabled
                    </div>
                </div>
            </div>

            {/* Balance Card */}
            <div className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-[80px] -mr-48 -mt-48 transition-colors"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-green-400 uppercase tracking-[0.3em]">Available Balance</p>
                        <h1 className="text-7xl font-black tracking-tighter">₹{balance.toLocaleString()}</h1>
                        <p className="text-slate-400 font-bold flex items-center gap-2">
                            <Info size={14} />
                            Funds are held in secure escrow during active jobs.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowDepositModal(true)}
                        className="bg-green-500 hover:bg-green-600 text-white px-10 py-6 rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-green-500/20 active:scale-95 transition-all flex items-center gap-3 group"
                    >
                        <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                        Add Money
                    </button>
                </div>
            </div>

            {/* Transactions Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg"><History size={18} className="text-slate-600" /></div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Recent Activity</h3>
                </div>

                <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white/60 shadow-xl overflow-hidden">
                    {transactions.length === 0 ? (
                        <div className="py-20 text-center text-slate-400 font-bold italic">
                            No transactions found. Start booking machinery or add funds to see activity.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-center gap-6">
                                        <div className={`p-4 rounded-2xl ${tx.type === 'DEPOSIT' || tx.type === 'EARNING' || tx.type === 'REFUND' ? 'bg-green-50' : 'bg-red-50'}`}>
                                            {tx.type === 'DEPOSIT' || tx.type === 'EARNING' || tx.type === 'REFUND' ?
                                                <TrendingUp className="text-green-600" size={20} /> :
                                                <TrendingDown className="text-red-600" size={20} />
                                            }
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                                {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                            <h4 className="font-bold text-slate-800 tracking-tight">{tx.description || t(`wallet.${tx.type.toLowerCase()}`)}</h4>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xl font-black tracking-tighter ${tx.type === 'DEPOSIT' || tx.type === 'EARNING' || tx.type === 'REFUND' ? 'text-green-600' : 'text-slate-800'}`}>
                                            {tx.type === 'DEPOSIT' || tx.type === 'EARNING' || tx.type === 'REFUND' ? '+' : '-'}₹{Number(tx.amount).toLocaleString()}
                                        </p>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{tx.type}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Deposit Modal */}
            {showDepositModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowDepositModal(false)}></div>
                    <div className="relative bg-white rounded-[3rem] p-12 w-full max-w-md shadow-2xl animate-fade-up">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Plus className="text-green-600" size={32} strokeWidth={3} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-800 tracking-tighter">Add Money</h3>
                            <p className="text-slate-500 font-bold text-sm mt-2">Enter amount to recharge your DHARA wallet</p>
                        </div>

                        <form onSubmit={handleDeposit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Amount (₹)</label>
                                <input
                                    type="number"
                                    required
                                    autoFocus
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    placeholder="e.g. 5000"
                                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none text-2xl font-black tracking-tighter text-slate-900 transition-all"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-green-600/20 active:scale-95 transition-all text-sm"
                            >
                                Confirm Deposit
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowDepositModal(false)}
                                className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletPage;
