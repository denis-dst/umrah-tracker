import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History, BarChart2, Loader, Trash2, Calendar } from 'lucide-react';
import BottomNav from '../components/BottomNav';

const HistoryPage = () => {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [logsRes, statsRes] = await Promise.all([
                axios.get('/api/worship-logs'),
                axios.get('/api/worship-logs/stats')
            ]);
            setLogs(logsRes.data.data); // Assuming paginated
            setStats(statsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const deleteLog = async (id) => {
        if (!confirm('Hapus catatan ini?')) return;
        try {
            await axios.delete(`/api/worship-logs/${id}`);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><Loader className="spin" /></div>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>Riwayat Ibadah</h1>

            {stats && (
                <div className="glass-card stats-grid">
                    <div className="stat-card">
                        <span className="label">Total Ibadah</span>
                        <span className="value">{logs.length}</span>
                    </div>
                    <div className="stat-card">
                        <span className="label">Hari Ini</span>
                        <span className="value">{stats.today_count}</span>
                    </div>
                </div>
            )}

            <div className="log-list" style={{ marginTop: '20px' }}>
                <h2 style={{ fontSize: '16px', marginBottom: '15px', opacity: 0.7 }}>Aktivitas Terbaru</h2>
                {logs.length === 0 ? (
                    <div className="glass-card" style={{ textAlign: 'center' }}>
                        <p>Belum ada rekaman ibadah.</p>
                    </div>
                ) : (
                    logs.map(log => (
                        <div key={log.id} className="glass-card log-item">
                            <div className="log-left">
                                <span className="type-badge">{log.activity_type}</span>
                                <p className="log-time">
                                    <Calendar size={12} />
                                    {new Date(log.log_datetime).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <div className="log-right">
                                <span className="log-value">+{log.value}</span>
                                <button className="delete-btn" onClick={() => deleteLog(log.id)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style>{`
                .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                .stat-card { display: flex; flex-direction: column; align-items: center; }
                .stat-card .label { font-size: 10px; opacity: 0.6; text-transform: uppercase; }
                .stat-card .value { font-size: 24px; font-weight: 700; color: var(--accent-blue); }
                .log-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
                .type-badge { font-weight: 600; font-size: 14px; display: block; margin-bottom: 4px; }
                .log-time { font-size: 11px; opacity: 0.5; display: flex; align-items: center; gap: 4px; }
                .log-value { font-size: 18px; font-weight: 700; color: var(--accent-gold); margin-right: 15px; }
                .delete-btn { background: none; border: none; color: #ff5555; cursor: pointer; opacity: 0.5; transition: opacity 0.2s; }
                .delete-btn:hover { opacity: 1; }
                .spin { animation: spin 2s linear infinite; }
            `}</style>
            <BottomNav />
        </div>
    );
};

export default HistoryPage;
