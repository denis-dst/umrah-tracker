import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, CheckCircle, Plus, Loader, Map } from 'lucide-react';
import BottomNav from '../components/BottomNav';

const PlanningPage = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await axios.get('/api/plans');
            setPlans(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const applyTemplate = async (template) => {
        setLoading(true);
        try {
            await axios.post('/api/plans/template', { template });
            fetchPlans();
        } catch (err) {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><Loader className="spin" /></div>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>Rencana Ibadah</h1>

            {plans.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <Map size={48} style={{ color: 'var(--accent-blue)', marginBottom: '15px' }} />
                    <p>Belum ada rencana ibadah harian.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                        <button className="btn-primary" onClick={() => applyTemplate('standar')}>
                            Gunakan Paket Standar
                        </button>
                        <button className="btn-primary" style={{ background: 'linear-gradient(to right, #f9d423, #ff4e50)' }} onClick={() => applyTemplate('khusyuk')}>
                            Gunakan Paket Khusyuk
                        </button>
                    </div>
                </div>
            ) : (
                <div className="plan-list">
                    {plans.map(plan => (
                        <div key={plan.id} className="glass-card plan-item" style={{ marginBottom: '15px' }}>
                            <div className="plan-date">
                                <Calendar size={14} />
                                <span>{new Date(plan.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                            </div>
                            <div className="plan-content">
                                <h3>{plan.activity_name}</h3>
                                <p>Target: {plan.target_value} {plan.unit}</p>
                            </div>
                            {plan.is_completed ? (
                                <CheckCircle color="#00ff88" />
                            ) : (
                                <div className="status-badge-mini">Pending</div>
                            )}
                        </div>
                    ))}
                    <button className="btn-primary" style={{ marginTop: '10px', background: 'rgba(255,255,255,0.1)' }}>
                        <Plus size={18} /> Tambah Kegiatan Kustom
                    </button>
                </div>
            )}

            <style>{`
                .plan-date { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--accent-blue); margin-bottom: 8px; }
                .plan-item { display: flex; align-items: center; justify-content: space-between; }
                .plan-content h3 { font-size: 16px; margin-bottom: 2px; }
                .status-badge-mini { font-size: 10px; background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 10px; }
                .spin { animation: spin 2s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
            <BottomNav />
        </div>
    );
};

export default PlanningPage;
