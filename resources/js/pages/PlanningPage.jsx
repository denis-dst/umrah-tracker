import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, CheckCircle, Plus, Loader, Map, Trash2, Edit2, X, Check } from 'lucide-react';
import BottomNav from '../components/BottomNav';

const PlanningPage = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState({
        activity_name: '',
        date: new Date().toISOString().split('T')[0],
        target_value: '',
        unit: ''
    });

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPlan) {
                await axios.put(`/api/plans/${editingPlan.id}`, formData);
            } else {
                await axios.post('/api/plans', formData);
            }
            setIsModalOpen(false);
            setEditingPlan(null);
            setFormData({
                activity_name: '',
                date: new Date().toISOString().split('T')[0],
                target_value: '',
                unit: ''
            });
            fetchPlans();
        } catch (err) {
            console.error('Failed to save plan', err);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus rencana ini?')) return;
        try {
            await axios.delete(`/api/plans/${id}`);
            fetchPlans();
        } catch (err) {
            console.error('Failed to delete plan', err);
        }
    };

    const toggleComplete = async (plan) => {
        try {
            await axios.put(`/api/plans/${plan.id}`, { is_completed: !plan.is_completed });
            fetchPlans();
        } catch (err) {
            console.error('Failed to update plan', err);
        }
    };

    const openEditModal = (plan) => {
        setEditingPlan(plan);
        setFormData({
            activity_name: plan.activity_name,
            date: plan.date,
            target_value: plan.target_value,
            unit: plan.unit
        });
        setIsModalOpen(true);
    };

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '100px', background: 'var(--bg-dark)', minHeight: '100vh', color: 'white' }}>
            <Loader className="spin" size={40} />
            <p style={{ marginTop: '20px', opacity: 0.6 }}>Memuat Rencana...</p>
        </div>
    );

    return (
        <div className="planning-page" style={{ padding: '20px', paddingBottom: '100px', minHeight: '100vh' }}>
            <div className="header" style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', background: 'linear-gradient(to right, #fff, var(--accent-blue))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Rencana Ibadah</h1>
                <p style={{ opacity: 0.6, fontSize: '14px' }}>Atur agenda ibadah Umrah Anda</p>
            </div>

            {plans.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '50px 20px', borderRadius: '24px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <Map size={40} style={{ color: 'var(--accent-blue)' }} />
                    </div>
                    <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>Belum Ada Rencana</h2>
                    <p style={{ opacity: 0.6, fontSize: '14px', marginBottom: '30px' }}>Pilih paket template atau buat rencana kustom Anda sendiri.</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button className="btn-primary" onClick={() => applyTemplate('standar')} style={{ padding: '15px' }}>
                            Gunakan Paket Standar
                        </button>
                        <button className="btn-primary" style={{ background: 'linear-gradient(to right, #f9d423, #ff4e50)', border: 'none', padding: '15px' }} onClick={() => applyTemplate('khusyuk')}>
                            Gunakan Paket Khusyuk
                        </button>
                        <button
                            onClick={() => { setEditingPlan(null); setIsModalOpen(true); }}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '15px', borderRadius: '12px', fontWeight: 'bold' }}
                        >
                            Buat Rencana Kustom
                        </button>
                    </div>
                </div>
            ) : (
                <div className="plan-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {plans.map(plan => (
                        <div key={plan.id} className="glass-card plan-item" style={{ padding: '20px', borderRadius: '20px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div
                                onClick={() => toggleComplete(plan)}
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    border: `2px solid ${plan.is_completed ? '#00ff88' : 'rgba(255,255,255,0.2)'}`,
                                    background: plan.is_completed ? 'rgba(0,255,136,0.1)' : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                {plan.is_completed && <Check size={14} color="#00ff88" strokeWidth={3} />}
                            </div>

                            <div style={{ flex: 1 }}>
                                <div className="plan-date">
                                    <Calendar size={12} />
                                    <span>{new Date(plan.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                                </div>
                                <h3 style={{ fontSize: '16px', fontWeight: '600', textDecoration: plan.is_completed ? 'line-through' : 'none', opacity: plan.is_completed ? 0.5 : 1 }}>{plan.activity_name}</h3>
                                {plan.target_value && (
                                    <p style={{ fontSize: '12px', opacity: 0.5 }}>Target: {plan.target_value} {plan.unit}</p>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => openEditModal(plan)} style={{ background: 'none', border: 'none', color: 'white', opacity: 0.4, padding: '5px' }}>
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(plan.id)} style={{ background: 'none', border: 'none', color: '#ff4e50', opacity: 0.6, padding: '5px' }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={() => { setEditingPlan(null); setIsModalOpen(true); }}
                        className="glass-card"
                        style={{ width: '100%', padding: '15px', borderRadius: '15px', border: '1px dashed rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.02)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px' }}
                    >
                        <Plus size={20} /> <span>Tambah Kegiatan</span>
                    </button>
                </div>
            )}

            {/* Modal for CRUD */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '25px', borderRadius: '24px', position: 'relative' }}>
                        <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'white', opacity: 0.5 }}>
                            <X size={20} />
                        </button>

                        <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>{editingPlan ? 'Ubah Rencana' : 'Rencana Baru'}</h2>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '12px', opacity: 0.6 }}>Nama Kegiatan</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.activity_name}
                                    onChange={e => setFormData({ ...formData, activity_name: e.target.value })}
                                    placeholder="Contoh: Tawaf Wadah"
                                    style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '12px', opacity: 0.6 }}>Tanggal</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label style={{ fontSize: '12px', opacity: 0.6 }}>Target</label>
                                    <input
                                        type="number"
                                        value={formData.target_value}
                                        onChange={e => setFormData({ ...formData, target_value: e.target.value })}
                                        placeholder="0"
                                        style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
                                    />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label style={{ fontSize: '12px', opacity: 0.6 }}>Satuan</label>
                                    <input
                                        type="text"
                                        value={formData.unit}
                                        onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                        placeholder="juz/kali/putaran"
                                        style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" style={{ padding: '15px', marginTop: '10px' }}>
                                {editingPlan ? 'Simpan Perubahan' : 'Simpan Rencana'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .plan-date { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--accent-blue); margin-bottom: 5px; opacity: 0.8; }
                .plan-item { transition: 0.3s; }
                .plan-item:active { transform: scale(0.98); }
                .spin { animation: spin 2s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                
                input::placeholder { opacity: 0.3; }
                input::-webkit-calendar-picker-indicator { filter: invert(1); }
            `}</style>
            <BottomNav />
        </div>
    );
};

export default PlanningPage;
