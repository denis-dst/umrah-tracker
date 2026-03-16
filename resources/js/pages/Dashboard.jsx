import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Play, Clock, MapPin, Book, Star, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import BottomNav from '../components/BottomNav';

const Dashboard = () => {
    const { user } = useAuth();
    const [prayerTimes, setPrayerTimes] = useState({ makkah: null, madinah: null });
    const [hijriDate, setHijriDate] = useState({ makkah: '', madinah: '' });
    const [todayLogs, setTodayLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [groupCount, setGroupCount] = useState(0);
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

            // Fetch today's logs for progress
            const logsRes = await axios.get('/api/worship-logs');
            const allLogs = logsRes.data?.data || (Array.isArray(logsRes.data) ? logsRes.data : []);
            const today = new Date().toISOString().split('T')[0];
            const filtered = allLogs.filter(log => log.log_datetime.startsWith(today));
            setTodayLogs(filtered);

            // Fetch group summary
            const groupsRes = await axios.get('/api/groups');
            setGroupCount((groupsRes.data.owned?.length || 0) + (groupsRes.data.joined?.length || 0));

        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrayerTimes();
    }, []);

    const progressStats = useMemo(() => {
        // We define what constitutes a "full day" of worship
        // Typical: 5 prayers + 1 other worship (Quran/Dzikir) = 6
        const target = 6;
        
        if (!todayLogs.length) return { percentage: 0, done: 0, target };
        
        const activities = todayLogs.map(l => l.activity_type.toUpperCase());
        
        // Use a Set to count unique categories of worship performed today
        const uniqueWorships = new Set();
        
        if (activities.some(a => a.includes('FAJR') || a.includes('SUBUH'))) uniqueWorships.add('subuh');
        if (activities.some(a => a.includes('DHUHR') || a.includes('DZUHUR'))) uniqueWorships.add('dzuhur');
        if (activities.some(a => a.includes('ASR') || a.includes('ASHAR'))) uniqueWorships.add('ashar');
        if (activities.some(a => a.includes('MAGHRIB'))) uniqueWorships.add('maghrib');
        if (activities.some(a => a.includes('ISHA') || a.includes('ISYA'))) uniqueWorships.add('isya');
        
        // Count any other activity (Quran, Tawaf, etc.) as the 6th point
        if (activities.some(a => !a.includes('SHALAT') || a.includes('QURAN') || a.includes('TAWAF') || a.includes('SAI'))) {
            uniqueWorships.add('other');
        }
        
        const done = uniqueWorships.size;
        return { 
            percentage: Math.min(Math.round((done / target) * 100), 100), 
            done, 
            target 
        };
    }, [todayLogs]);

    const times = prayerTimes[activeCity];
    const hijri = hijriDate[activeCity];

    const getNextPrayer = () => {
        if (!times) return null;
        const saudiTimeStr = formatInTimeZone(currentTime, 'Asia/Riyadh', false).replace(/\./g, ':');
        const [nowH, nowM] = saudiTimeStr.split(':').map(Number);
        if (isNaN(nowH)) return null;
        const nowTotalMins = nowH * 60 + nowM;
        const prayerList = [{ name: 'Subuh', time: times.Fajr }, { name: 'Dzuhur', time: times.Dhuhr }, { name: 'Ashar', time: times.Asr }, { name: 'Maghrib', time: times.Maghrib }, { name: 'Isya', time: times.Isha }];
        for (let p of prayerList) {
            const timeOnly = p.time.split(' ')[0];
            const [pH, pM] = timeOnly.split(':').map(Number);
            const pTotalMins = pH * 60 + pM;
            if (pTotalMins > nowTotalMins) {
                const diff = pTotalMins - nowTotalMins;
                const h = Math.floor(diff / 60);
                const m = diff % 60;
                return { name: p.name, time: timeOnly, countdown: h > 0 ? `${h}j ${m}m` : `${m}m` };
            }
        }
        return { name: 'Subuh', time: times.Fajr.split(' ')[0], isTomorrow: true };
    };

    const nextPrayer = getNextPrayer();

    return (
        <div className="dashboard-page" style={{ paddingBottom: '100px', padding: '20px' }}>
            <header className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(0, 210, 255, 0.1), rgba(15, 23, 42, 0.8))' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '25px', background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', color: '#1a1a2e' }}>
                        {user?.full_name?.charAt(0) || 'J'}
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '12px', opacity: 0.7 }}>Selamat Datang,</p>
                        <h1 style={{ margin: 0, fontSize: '20px' }}>{user?.full_name || 'Jamaah'}</h1>
                    </div>
                </div>
            </header>

            <section className="glass-card" style={{ marginTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h2 style={{ fontSize: '16px' }}>Progres Hari Ini</h2>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--accent-gold)' }}>{progressStats.done}/{progressStats.target} Ibadah</span>
                </div>
                <div className="progress-bar" style={{ height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                    <div className="progress-fill" style={{ width: `${progressStats.percentage}%`, height: '100%', background: 'linear-gradient(90deg, #00d2ff, #00ff88)', borderRadius: '6px', transition: '1s ease-in-out' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                    <p style={{ fontSize: '12px', margin: 0 }}>{progressStats.percentage}% Terselesaikan</p>
                    <Link to="/log-prayer" style={{ fontSize: '12px', color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 'bold' }}>Update +</Link>
                </div>

                <Link to="/groups" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="glass-card" style={{ marginTop: '20px', background: 'rgba(249, 212, 35, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: '1px solid rgba(249,212,35,0.1)', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ background: 'rgba(249, 212, 35, 0.1)', padding: '8px', borderRadius: '10px' }}><History size={18} color="var(--accent-gold)" /></div>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: 'bold' }}>Rombongan Anda</div>
                                <div style={{ fontSize: '11px', opacity: 0.6 }}>Anda tergabung dalam {groupCount} grup</div>
                            </div>
                        </div>
                        <div style={{ background: 'var(--accent-gold)', color: '#1a1a2e', width: '22px', height: '22px', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>
                            {groupCount}
                        </div>
                    </div>
                </Link>
            </section>

            <div className="quick-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '15px' }}>
                <Link to="/tracker/tawaf" className="glass-card" style={{ margin: 0, textDecoration: 'none', color: 'inherit', padding: '20px', textAlign: 'center' }}>
                    <div style={{ marginBottom: '10px' }}><Play fill="#00d2ff" color="#00d2ff" size={24} /></div>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Mulai Tawaf</span>
                </Link>
                <Link to="/tracker/sai" className="glass-card" style={{ margin: 0, textDecoration: 'none', color: 'inherit', padding: '20px', textAlign: 'center' }}>
                    <div style={{ marginBottom: '10px' }}><Play fill="#f9d423" color="#f9d423" size={24} /></div>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Mulai Sa'i</span>
                </Link>
            </div>

            <section className="glass-card" style={{ marginTop: '15px' }}>
                <h2 style={{ fontSize: '15px', marginBottom: '15px' }}>Layanan Ibadah</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    <Link to="/quran" className="menu-item-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="menu-icon" style={{ background: 'rgba(0, 255, 136, 0.1)' }}><Book size={20} color="#00ff88" /></div>
                        <span>Al-Quran</span>
                    </Link>
                    <Link to="/doas" className="menu-item-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="menu-icon" style={{ background: 'rgba(249, 212, 35, 0.1)' }}><Star size={20} color="#f9d423" /></div>
                        <span>Doa Dzikir</span>
                    </Link>
                    <Link to="/history" className="menu-item-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="menu-icon" style={{ background: 'rgba(0, 210, 255, 0.1)' }}><History size={20} color="#00d2ff" /></div>
                        <span>Riwayat</span>
                    </Link>
                </div>
            </section>

            <section className="glass-card" style={{ marginTop: '15px', padding: '15px' }}>
                <div className="dual-clock-container" style={{ display: 'flex', justifyContent: 'space-around', background: 'rgba(0,210,255,0.05)', padding: '12px', borderRadius: '12px', marginBottom: '15px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '8px', opacity: 0.5 }}>SAUDI</span>
                        <div style={{ fontSize: '16px', fontWeight: '800' }}>{formatInTimeZone(currentTime, 'Asia/Riyadh', false)}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '8px', opacity: 0.5 }}>LOKAL</span>
                        <div style={{ fontSize: '16px', fontWeight: '800' }}>{formatInTimeZone(currentTime, 'Asia/Jakarta', false)}</div>
                    </div>
                </div>
                <div className="prayer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px' }}>
                    {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map(p => (
                        <div key={p} style={{ textAlign: 'center', padding: '8px 4px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '8px', opacity: 0.5 }}>{p}</div>
                            <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent-gold)' }}>{times?.[p] || '--:--'}</div>
                        </div>
                    ))}
                </div>
            </section>

            <BottomNav />
            <style>{`.menu-item-card { display: flex; flex-direction: column; align-items: center; gap: 8px; background: rgba(255,255,255,0.03); padding: 15px 10px; border-radius: 12px; border: 1px solid var(--glass-border); text-align: center; } .menu-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; justify-content: center; align-items: center; } .menu-item-card span { font-size: 11px; font-weight: 600; }`}</style>
        </div>
    );
};

export default Dashboard;
