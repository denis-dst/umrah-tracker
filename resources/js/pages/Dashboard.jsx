import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Play, Clock, MapPin, Book, Star, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import BottomNav from '../components/BottomNav';

const Dashboard = () => {
    console.log('Dashboard rendering...');
    const { user } = useAuth();
    const [prayerTimes, setPrayerTimes] = useState({ makkah: null, madinah: null });
    const [hijriDate, setHijriDate] = useState({ makkah: '', madinah: '' });
    const [todayLogs, setTodayLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeCity, setActiveCity] = useState('makkah');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatInTimeZone = (date, timeZone, includeSeconds = true) => {
        try {
            return new Intl.DateTimeFormat('id-ID', {
                timeZone,
                hour: '2-digit',
                minute: '2-digit',
                second: includeSeconds ? '2-digit' : undefined,
                hour12: false
            }).format(date);
        } catch (e) {
            return date.toLocaleTimeString();
        }
    };

    const fetchPrayerTimes = async () => {
        setLoading(true);
        setError(false);
        try {
            // Using window.fetch to avoid Axios defaults that might cause CORS issues with external APIs
            const getTimes = async (city) => {
                const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Saudi+Arabia&method=4`);
                const data = await res.json();
                if (data.code === 200) return data.data;
                throw new Error('API Error');
            };

            const [makkahData, madinahData] = await Promise.all([
                getTimes('Makkah'),
                getTimes('Madinah')
            ]);

            setPrayerTimes({
                makkah: makkahData.timings,
                madinah: madinahData.timings
            });

            setHijriDate({
                makkah: `${makkahData.date.hijri.day} ${makkahData.date.hijri.month.en} ${makkahData.date.hijri.year}H`,
                madinah: `${madinahData.date.hijri.day} ${madinahData.date.hijri.month.en} ${madinahData.date.hijri.year}H`
            });

            // Fetch logs for timeline
            try {
                const logsRes = await axios.get('/api/worship-logs');
                const logsData = logsRes.data?.data || (Array.isArray(logsRes.data) ? logsRes.data : []);
                setTodayLogs(logsData.slice(0, 5));
            } catch (err) {
                console.error('Failed to fetch worship logs', err);
                // Don't set error: true here to avoid blocking prayer times if only logs fail
            }

        } catch (err) {
            console.error('Failed to fetch prayer times data', err);
            setError(true); // Only set error if prayer times fetching fails
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrayerTimes();
    }, []);

    const times = prayerTimes[activeCity];
    const hijri = hijriDate[activeCity];

    const getNextPrayer = () => {
        if (!times) return null;

        const saudiTimeStr = formatInTimeZone(currentTime, 'Asia/Riyadh', false);
        // id-ID often uses dot (.) as separator, replace with colon (:)
        const cleanTime = saudiTimeStr.replace(/\./g, ':');
        const [nowH, nowM] = cleanTime.split(':').map(Number);

        if (isNaN(nowH) || isNaN(nowM)) return null;

        const nowTotalMins = nowH * 60 + nowM;

        const prayerList = [
            { name: 'Subuh', time: times.Fajr },
            { name: 'Dzuhur', time: times.Dhuhr },
            { name: 'Ashar', time: times.Asr },
            { name: 'Maghrib', time: times.Maghrib },
            { name: 'Isya', time: times.Isha }
        ];

        for (let p of prayerList) {
            // Some API times might have (KSA) or other suffix, clean it
            const timeOnly = p.time.split(' ')[0];
            const [pH, pM] = timeOnly.split(':').map(Number);
            const pTotalMins = pH * 60 + pM;

            if (pTotalMins > nowTotalMins) {
                const diff = pTotalMins - nowTotalMins;
                const h = Math.floor(diff / 60);
                const m = diff % 60;
                return {
                    name: p.name,
                    time: timeOnly,
                    countdown: h > 0 ? `${h} jam ${m} mnt` : `${m} menit`
                };
            }
        }

        return { name: 'Subuh', time: times.Fajr.split(' ')[0], isTomorrow: true };
    };

    const nextPrayer = getNextPrayer();

    return (
        <div className="dashboard-page">
            <header className="glass-card" style={{ marginTop: '20px' }}>
                <p>Selamat Datang,</p>
                <h1>{user?.full_name || 'Jamaah'}</h1>
                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                    <div className="stat-item">
                        <span className="label">Keberangkatan</span>
                        <span className="value">{user?.departure_date || '-'}</span>
                    </div>
                    <div className="stat-item">
                        <span className="label">Grup</span>
                        <span className="value">{user?.group_name || 'Individu'}</span>
                    </div>
                </div>
            </header>

            <section className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h2>Progres Hari Ini</h2>
                    <Link to="/log-prayer" className="btn-primary" style={{ padding: '8px 15px', fontSize: '11px', background: 'var(--accent-blue)', color: 'white', textDecoration: 'none', borderRadius: '8px' }}>
                        Catat Shalat
                    </Link>
                </div>
                <div className="progress-container">
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: '65%' }}></div>
                    </div>
                    <p style={{ marginTop: '5px' }}>65% ibadah terselesaikan</p>
                </div>

                <div className="timeline-section" style={{ marginTop: '20px' }}>
                    <h3 style={{ fontSize: '14px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={14} /> Timeline Ibadah
                    </h3>
                    {todayLogs.length === 0 ? (
                        <p style={{ fontSize: '11px', opacity: 0.5, textAlign: 'center', padding: '10px' }}>Belum ada ibadah hari ini.</p>
                    ) : (
                        <div className="timeline-container">
                            {todayLogs.slice(0, 3).map((log) => {
                                const timeStr = log.log_datetime?.includes('T')
                                    ? log.log_datetime.split('T')[1]?.substring(0, 5)
                                    : log.log_datetime?.split(' ')[1]?.substring(0, 5) || '--:--';
                                return (
                                    <div key={log.id} className="timeline-item">
                                        <div className="t-time">{timeStr}</div>
                                        <div className="t-dot"></div>
                                        <div className="t-activity">{log.activity_type?.replace('SHALAT_', '')}</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            <div className="quick-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '0 15px', marginTop: '15px' }}>
                <Link to="/tracker/tawaf" className="glass-card quick-btn" style={{ margin: 0, textDecoration: 'none', color: 'inherit' }}>
                    <Play fill="#00d2ff" color="#00d2ff" />
                    <span>Mulai Tawaf</span>
                </Link>
                <Link to="/tracker/sai" className="glass-card quick-btn" style={{ margin: 0, textDecoration: 'none', color: 'inherit' }}>
                    <Play fill="#f9d423" color="#f9d423" />
                    <span>Mulai Sa'i</span>
                </Link>
            </div>

            <section className="glass-card" style={{ marginTop: '15px' }}>
                <h2 style={{ fontSize: '15px', marginBottom: '15px' }}>Menu Utama Ibadah</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    <Link to="/quran" className="menu-item-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="menu-icon" style={{ background: 'rgba(0, 255, 136, 0.1)' }}>
                            <Book size={20} color="#00ff88" />
                        </div>
                        <span>Al-Quran</span>
                    </Link>
                    <Link to="/doas" className="menu-item-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="menu-icon" style={{ background: 'rgba(249, 212, 35, 0.1)' }}>
                            <Star size={20} color="#f9d423" />
                        </div>
                        <span>Doa Dzikir</span>
                    </Link>
                    <Link to="/history" className="menu-item-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="menu-icon" style={{ background: 'rgba(0, 210, 255, 0.1)' }}>
                            <History size={20} color="#00d2ff" />
                        </div>
                        <span>Riwayat</span>
                    </Link>
                </div>
            </section>

            <section className="glass-card prayer-section">
                <div className="dual-clock-container">
                    <div className="clock-item">
                        <span className="c-lbl">Saudi (KSA)</span>
                        <span className="c-val">{formatInTimeZone(currentTime, 'Asia/Riyadh')}</span>
                    </div>
                    <div className="clock-divider"></div>
                    <div className="clock-item">
                        <span className="c-lbl">Lampung (WIB)</span>
                        <span className="c-val">{formatInTimeZone(currentTime, 'Asia/Jakarta')}</span>
                    </div>
                </div>

                {nextPrayer && !loading && !error && (
                    <div className="next-prayer-alert">
                        <div className="alert-content">
                            <Clock size={16} strokeWidth={3} />
                            <span>Shalat Berikutnya: <strong>{nextPrayer.name}</strong> pukul <strong>{nextPrayer.time}</strong></span>
                        </div>
                        <div className="countdown-tag">
                            {nextPrayer.isTomorrow ? 'Besok' : nextPrayer.countdown}
                        </div>
                    </div>
                )}

                <div className="prayer-header">
                    <div className="city-info">
                        <div className="city-title">
                            <MapPin size={14} color="var(--accent-blue)" />
                            <span>Jadwal di {activeCity.toUpperCase()}</span>
                        </div>
                        {hijri && <div className="hijri-badge">{hijri}</div>}
                    </div>
                    <div className="city-toggle">
                        <button
                            className={activeCity === 'makkah' ? 'active' : ''}
                            onClick={() => setActiveCity('makkah')}
                        >Makkah</button>
                        <button
                            className={activeCity === 'madinah' ? 'active' : ''}
                            onClick={() => setActiveCity('madinah')}
                        >Madinah</button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-prayer">Memuat jadwal...</div>
                ) : error ? (
                    <div className="error-prayer">
                        <p>Gagal memuat jadwal shalat.</p>
                        <button onClick={fetchPrayerTimes} className="btn-retry">Coba Lagi</button>
                    </div>
                ) : (
                    <div className="prayer-grid">
                        <div className="prayer-item">
                            <span className="p-name">Subuh</span>
                            <span className="p-time">{times?.Fajr || '--:--'}</span>
                        </div>
                        <div className="prayer-item">
                            <span className="p-name">Dzuhur</span>
                            <span className="p-time">{times?.Dhuhr || '--:--'}</span>
                        </div>
                        <div className="prayer-item">
                            <span className="p-name">Ashar</span>
                            <span className="p-time">{times?.Asr || '--:--'}</span>
                        </div>
                        <div className="prayer-item">
                            <span className="p-name">Maghrib</span>
                            <span className="p-time">{times?.Maghrib || '--:--'}</span>
                        </div>
                        <div className="prayer-item">
                            <span className="p-name">Isya</span>
                            <span className="p-time">{times?.Isha || '--:--'}</span>
                        </div>
                    </div>
                )}
            </section>

            <BottomNav />

            <style>{`
                .stat-item { flex: 1; display: flex; flex-direction: column; background: rgba(255,255,255,0.03); padding: 10px; border-radius: 12px; }
                .stat-item .label { font-size: 10px; opacity: 0.6; }
                .stat-item .value { font-size: 14px; font-weight: 600; color: var(--accent-blue); }
                .progress-bar { height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; }
                .progress-fill { height: 100%; background: linear-gradient(to right, #00d2ff, #3a7bd5); }
                .quick-btn { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; font-weight: 600; padding: 25px; }
                .quick-btn svg { width: 32px; height: 32px; }
                
                .prayer-section { margin-top: 15px; padding: 15px; }
                .dual-clock-container { display: flex; justify-content: space-around; align-items: center; background: rgba(0,210,255,0.05); padding: 12px; border-radius: 12px; margin-bottom: 20px; border: 1px solid rgba(0,210,255,0.1); }
                .clock-item { display: flex; flex-direction: column; align-items: center; }
                .c-lbl { font-size: 9px; opacity: 0.6; text-transform: uppercase; margin-bottom: 2px; }
                .c-val { font-size: 18px; font-weight: 800; color: white; font-family: 'Courier New', monospace; letter-spacing: 1px; }
                .clock-divider { width: 1px; height: 30px; background: var(--glass-border); }

                .next-prayer-alert { display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, rgba(249,212,35,0.2) 0%, rgba(255,102,0,0.1) 100%); padding: 12px 15px; border-radius: 12px; margin-bottom: 20px; border: 1px solid rgba(249,212,35,0.3); }
                .alert-content { display: flex; align-items: center; gap: 10px; font-size: 13px; color: white; }
                .alert-content strong { color: var(--accent-gold); }
                .countdown-tag { background: var(--accent-gold); color: #1a1a2e; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; }

                .prayer-header { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
                .city-info { display: flex; justify-content: space-between; align-items: center; min-height: 30px; }
                .city-title { display: flex; align-items: center; gap: 6px; font-weight: 700; color: white; font-size: 14px; }
                .hijri-badge { background: rgba(249,212,35,0.15); color: var(--accent-gold); padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; border: 1px solid rgba(249,212,35,0.3); }
                
                .city-toggle { display: flex; background: rgba(255,255,255,0.05); border-radius: 10px; padding: 4px; }
                .city-toggle button { flex: 1; border: none; background: none; color: white; padding: 8px; border-radius: 8px; font-size: 12px; cursor: pointer; transition: 0.3s; font-weight: 500; }
                .city-toggle button.active { background: var(--accent-blue); color: #1a1a2e; font-weight: bold; }
                
                .prayer-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; }
                .prayer-item { display: flex; flex-direction: column; align-items: center; background: rgba(255,255,255,0.03); padding: 10px 5px; border-radius: 10px; border: 1px solid var(--glass-border); }
                .p-name { font-size: 9px; opacity: 0.6; text-transform: uppercase; margin-bottom: 4px; }
                .p-time { font-size: 12px; font-weight: 700; color: var(--accent-gold); }
                .loading-prayer, .error-prayer { text-align: center; padding: 20px; font-size: 14px; opacity: 0.7; }
                .error-prayer p { margin-bottom: 10px; color: #ff3333; }
                .btn-retry { background: var(--accent-blue); border: none; padding: 5px 15px; border-radius: 5px; font-weight: bold; cursor: pointer; }

                .timeline-container { display: flex; flex-direction: column; gap: 15px; padding-left: 10px; border-left: 1px dashed rgba(255,255,255,0.2); margin-left: 10px; }
                .timeline-item { display: flex; align-items: center; gap: 15px; position: relative; }
                .t-time { font-size: 10px; opacity: 0.6; min-width: 40px; }
                .t-dot { width: 8px; height: 8px; background: var(--accent-blue); border-radius: 50%; position: absolute; left: -14.5px; box-shadow: 0 0 10px var(--accent-blue); }
                .t-activity { font-size: 12px; font-weight: 600; text-transform: capitalize; }
                .menu-item-card { display: flex; flex-direction: column; align-items: center; gap: 8px; background: rgba(255,255,255,0.03); padding: 15px 10px; border-radius: 12px; border: 1px solid var(--glass-border); transition: 0.3s; }
                .menu-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; justify-content: center; align-items: center; }
                .menu-item-card span { font-size: 11px; font-weight: 600; text-align: center; }
            `}</style>
        </div>
    );
};

export default Dashboard;
