import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, BellOff, Clock, Loader } from 'lucide-react';
import BottomNav from '../components/BottomNav';

const ReminderPage = () => {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReminders();
    }, []);

    const fetchReminders = async () => {
        try {
            const res = await axios.get('/api/reminders');
            setReminders(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleReminder = async (id) => {
        try {
            const res = await axios.patch(`/api/reminders/${id}/toggle`);
            setReminders(prev => prev.map(r => r.id === id ? res.data.reminder : r));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><Loader className="spin" /></div>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>Pengaturan Pengingat</h1>
            <p style={{ opacity: 0.6, marginBottom: '20px' }}>Notifikasi untuk jadwal ibadah harian Anda.</p>

            <div className="reminder-list">
                {reminders.length === 0 ? (
                    <div className="glass-card" style={{ textAlign: 'center' }}>
                        <p>Belum ada pengingat yang diatur.</p>
                        <button className="btn-primary" style={{ marginTop: '15px' }} onClick={() => alert('Fitur tambah pengingat segera hadir')}>
                            Tambah Pengingat Baru
                        </button>
                    </div>
                ) : (
                    reminders.map(rem => (
                        <div key={rem.id} className={`glass-card reminder-item ${rem.is_enabled ? 'enabled' : 'disabled'}`}>
                            <div className="rem-info">
                                <div className="rem-head">
                                    <Clock size={16} />
                                    <span>{rem.reminder_time}</span>
                                </div>
                                <h3>{rem.type.replace('_', ' ')}</h3>
                                <p>Interval: {rem.interval_minutes} menit</p>
                            </div>
                            <button className={`toggle-btn ${rem.is_enabled ? 'on' : 'off'}`} onClick={() => toggleReminder(rem.id)}>
                                {rem.is_enabled ? <Bell size={20} /> : <BellOff size={20} />}
                            </button>
                        </div>
                    ))
                )}
            </div>

            <style>{`
                .reminder-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-left: 4px solid transparent; transition: all 0.3s; }
                .reminder-item.enabled { border-left-color: var(--accent-blue); background: rgba(0,210,255,0.05); }
                .reminder-item.disabled { opacity: 0.6; }
                .rem-head { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--accent-blue); font-weight: 700; margin-bottom: 5px; }
                .rem-info h3 { font-size: 16px; text-transform: capitalize; }
                .rem-info p { font-size: 11px; }
                .toggle-btn { width: 50px; height: 50px; border-radius: 12px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .toggle-btn.on { background: var(--accent-blue); color: white; }
                .toggle-btn.off { background: rgba(255,255,255,0.1); color: var(--text-dim); }
                .spin { animation: spin 2s linear infinite; }
            `}</style>
            <BottomNav />
        </div>
    );
};

export default ReminderPage;
