import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Sun, Moon, Star, Clock } from 'lucide-react';
import axios from 'axios';
import BottomNav from '../components/BottomNav';

const PRAYER_TYPES = {
    fardhu: [
        { id: 'sbh', name: 'Subuh', rakaat: 2, icon: Sun, color: '#FFD700' },
        { id: 'dzhr', name: 'Dzuhur', rakaat: 4, icon: Sun, color: '#00BFFF' },
        { id: 'ashr', name: 'Ashar', rakaat: 4, icon: Sun, color: '#FFA500' },
        { id: 'mghb', name: 'Maghrib', rakaat: 3, icon: Moon, color: '#FF4500' },
        { id: 'isya', name: 'Isya', rakaat: 4, icon: Moon, color: '#483D8B' },
    ],
    sunnah: [
        { id: 'thjd', name: 'Tahajjud', rakaat: 2, icon: Moon, color: '#A9A9A9' },
        { id: 'dhha', name: 'Dhuha', rakaat: 2, icon: Sun, color: '#F0E68C' },
        { id: 'rwit', name: 'Rawatib', rakaat: 2, icon: Clock, color: '#98FB98' },
        { id: 'witr', name: 'Witir', rakaat: 3, icon: Moon, color: '#DDA0DD' },
    ]
};

const PrayerLogPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({}); // { id: 'loading' | 'done' }

    const logPrayer = async (prayer) => {
        if (status[prayer.id] === 'loading' || status[prayer.id] === 'done') return;

        setLoading(true);
        setStatus(prev => ({ ...prev, [prayer.id]: 'loading' }));

        try {
            await axios.post('/api/worship-logs', {
                activity_type: `SHALAT_${prayer.name.toUpperCase()}`,
                value: prayer.rakaat,
                notes: `Manual log: ${prayer.name}`
            });
            setStatus(prev => ({ ...prev, [prayer.id]: 'done' }));
            if (navigator.vibrate) navigator.vibrate(100);
        } catch (err) {
            console.error(err);
            setStatus(prev => ({ ...prev, [prayer.id]: null }));
            alert('Gagal mencatat shalat. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="prayer-log-page" style={{ padding: '20px', paddingBottom: '100px' }}>
            <div className="header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'white' }}>
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ fontSize: '24px' }}>Catat Shalat</h1>
            </div>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '15px', color: 'var(--accent-blue)' }}>Shalat Fardhu</h2>
                <div className="prayer-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {PRAYER_TYPES.fardhu.map(p => (
                        <button
                            key={p.id}
                            className={`glass-card prayer-card ${status[p.id] === 'done' ? 'completed' : ''}`}
                            onClick={() => logPrayer(p)}
                            disabled={status[p.id] === 'done'}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '20px',
                                position: 'relative',
                                background: status[p.id] === 'done' ? 'rgba(0, 255, 136, 0.1)' : 'var(--glass-bg)',
                                border: status[p.id] === 'done' ? '1px solid #00ff88' : '1px solid var(--glass-border)',
                                color: 'white'
                            }}
                        >
                            <p.icon size={24} color={p.color} />
                            <span style={{ fontWeight: '600' }}>{p.name}</span>
                            <span style={{ fontSize: '10px', opacity: 0.6 }}>{p.rakaat} Rakaat</span>
                            {status[p.id] === 'done' && <CheckCircle size={16} color="#00ff88" style={{ position: 'absolute', top: '10px', right: '10px' }} />}
                            {status[p.id] === 'loading' && <span className="loader-mini"></span>}
                        </button>
                    ))}
                </div>
            </section>

            <section>
                <h2 style={{ fontSize: '18px', marginBottom: '15px', color: 'var(--accent-gold)' }}>Shalat Sunnah</h2>
                <div className="prayer-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {PRAYER_TYPES.sunnah.map(p => (
                        <button
                            key={p.id}
                            className={`glass-card prayer-card ${status[p.id] === 'done' ? 'completed' : ''}`}
                            onClick={() => logPrayer(p)}
                            disabled={status[p.id] === 'done'}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '20px',
                                position: 'relative',
                                color: 'white'
                            }}
                        >
                            <Star size={24} color={p.color} />
                            <span style={{ fontWeight: '600' }}>{p.name}</span>
                            <span style={{ fontSize: '10px', opacity: 0.6 }}>{p.rakaat} Rakaat</span>
                            {status[p.id] === 'done' && <CheckCircle size={16} color="#00ff88" style={{ position: 'absolute', top: '10px', right: '10px' }} />}
                        </button>
                    ))}
                </div>
            </section>

            <BottomNav />

            <style>{`
                .prayer-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid var(--glass-border); border-radius: 16px; cursor: pointer; }
                .prayer-card:active { transform: scale(0.95); }
                .prayer-card.completed { cursor: default; }
                .loader-mini { width: 15px; height: 15px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default PrayerLogPage;
