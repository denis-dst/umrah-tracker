import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { MapPin, RotateCw, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

const SAI_PRAYERS = [
    {
        title: "Doa Memulai Sa'i (Mendekati Safa)",
        arabic: "إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ ۖ فَمَنْ حَجَّ الْبَيْتَ أَوِ اعْتَمَرَ فَلَا جُنَاحَ عَلَيْهِ أَنْ يَطَّوَّفَ بِهِمَا ۚ وَمَنْ تَطَوَّعَ خَيْرًا فَإِنَّ اللَّهَ شَاكِرٌ عَلِيمٌ",
        latin: "Innas-shafâ wal-marwata min sya'â'irillâh, faman hajjal baita awi'tamara falâ junâha 'alaihi ay yaththawwafa bihimâ...",
        meaning: "Sesungguhnya Safa dan Marwah adalah sebagian dari syiar Allah..."
    },
    {
        title: "Doa di Antara Dua Pilar Hijau",
        arabic: "رَبِّ اغْفِرْ وَارْحَمْ وَاعْفُ وَتَكَرَّمْ وَتَجَاوَزْ عَمَّا تَعْلَمُ إِنَّكَ تَعْلَمُ مَا لَا نَعْلَمُ إِنَّكَ أَنْتَ اللَّهُ الْأَعَزُّ الْأَكْرَمُ",
        latin: "Rabbighfir warham wa'fu wa takarram, wa tajâwaz 'ammâ ta'lam...",
        meaning: "Ya Allah, ampunilah, sayangilah, maafkanlah, bermurah hatilah..."
    },
    {
        title: "Doa Setelah Selesai Sa'i (Di Marwah)",
        arabic: "اللَّهُمَّ رَبَّنَا تَقَبَّلْ مِنَّا وَعَافِنَا وَاعْفُ عَنَّا وَعَلَى طَاعَتِكَ وَشُكْرِكَ أَعِنَّا",
        latin: "Allâhumma rabbanâ taqabbal minnâ wa 'âfinâ wa'fu 'annâ...",
        meaning: "Ya Allah ya Tuhan kami, terimalah amal ibadah kami..."
    }
];

const SessionTracker = ({ type = 'tawaf' }) => {
    const [isActive, setIsActive] = useState(false);
    const [count, setCount] = useState(0);
    const [steps, setSteps] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [distance, setDistance] = useState(0);
    const [targetPos, setTargetPos] = useState('MARWAH');
    const [startPos, setStartPos] = useState(null);
    const [currentPos, setCurrentPos] = useState(null);
    const lastTriggeredAt = useRef(0);
    const lastStepTime = useRef(0);
    const timerRef = useRef(null);

    const threshold = 15;

    useEffect(() => {
        if (isActive) {
            timerRef.current = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);

            const handleMotion = (event) => {
                const acc = event.accelerationIncludingGravity;
                if (!acc) return;
                const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
                const now = Date.now();
                if (magnitude > 12 && now - lastStepTime.current > 300) {
                    setSteps(prev => prev + 1);
                    lastStepTime.current = now;
                }
            };

            window.addEventListener('devicemotion', handleMotion);
            return () => {
                clearInterval(timerRef.current);
                window.removeEventListener('devicemotion', handleMotion);
            };
        }
    }, [isActive]);

    useEffect(() => {
        let watchId;
        if (isActive && type === 'tawaf') {
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setCurrentPos({ lat: latitude, lng: longitude });
                    if (startPos) {
                        setDistance(calculateDistance(latitude, longitude, startPos.lat, startPos.lng));
                        checkProgress(latitude, longitude);
                    }
                },
                null,
                { enableHighAccuracy: true }
            );
        }
        return () => navigator.geolocation.clearWatch(watchId);
    }, [isActive, startPos, type]);

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3;
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const checkProgress = (lat, lng) => {
        const dist = calculateDistance(lat, lng, startPos.lat, startPos.lng);
        const now = Date.now();
        if (dist < threshold && now - lastTriggeredAt.current > 60000) {
            setCount(prev => prev + 1);
            lastTriggeredAt.current = now;
            if (navigator.vibrate) navigator.vibrate(200);
        }
    };

    const formatTime = (s) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleStart = () => {
        setSteps(0);
        setSeconds(0);
        setDistance(0);
        if (type === 'tawaf') {
            navigator.geolocation.getCurrentPosition((pos) => {
                setStartPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setIsActive(true);
                setCount(0);
            });
        } else {
            setIsActive(true);
            setCount(0);
            setTargetPos('MARWAH');
        }
    };

    const handleCheckpoint = () => {
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        const newCount = count + 1;
        setCount(newCount);

        if (newCount < 7) {
            setTargetPos(targetPos === 'MARWAH' ? 'SAFA' : 'MARWAH');
        }
    };

    const handleComplete = async () => {
        setIsActive(false);
        try {
            await axios.post('/api/worship-logs', {
                activity_type: type.toUpperCase(),
                value: count,
                notes: `${type.toUpperCase()}: ${steps} langkah, ${formatTime(seconds)} durasi.`
            });
            alert(`Selesai! Data tersimpan.`);
        } catch (err) {
            console.error(err);
        }
    };

    const isFinalSai = type === 'sai' && count === 6 && targetPos === 'MARWAH';

    return (
        <div className="tracker-card glass-card strava-style">
            <div className="status-badge" style={{ background: isActive ? 'rgba(0,255,136,0.1)' : 'rgba(255,51,51,0.1)', color: isActive ? '#00ff88' : '#ff3333' }}>
                {isActive ? `${type.toUpperCase()} RECORDING` : 'Siap'}
            </div>

            {/* Journey Visualization */}
            <div className="journey-visualizer" style={{ width: '100%', padding: '10px 0' }}>
                {type === 'tawaf' ? (
                    <div className="tawaf-rings" style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto' }}>
                        <div className="kaaba-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '30px', height: '30px', background: '#111', border: '2px solid #f9d423', borderRadius: '4px' }}></div>
                        {[...Array(7)].map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    position: 'absolute',
                                    top: '50%', left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: `${50 + (i * 12)}px`,
                                    height: `${50 + (i * 12)}px`,
                                    borderRadius: '50%',
                                    border: `2px solid ${count > i ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)'}`,
                                    boxShadow: count > i ? '0 0 10px var(--accent-blue)' : 'none',
                                    transition: '0.5s'
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="sai-path" style={{ position: 'relative', width: '100%', height: '60px', padding: '0 20px' }}>
                        <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '2px', background: 'rgba(255,255,255,0.1)', transform: 'translateY(-50%)' }}></div>
                        <div className="points" style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: (targetPos === 'SAFA' || (count === 7 && type === 'sai')) ? 'var(--accent-gold)' : '#555', margin: '0 auto' }}></div>
                                <span style={{ fontSize: '10px', opacity: 0.6 }}>SAFA</span>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: (targetPos === 'MARWAH' && count < 7) ? 'var(--accent-gold)' : '#555', margin: '0 auto' }}></div>
                                <span style={{ fontSize: '10px', opacity: 0.6 }}>MARWAH</span>
                            </div>
                        </div>
                        {/* Progress segments - 7 travels */}
                        <div style={{ display: 'flex', gap: '4px', marginTop: '15px' }}>
                            {[...Array(7)].map((_, i) => (
                                <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: count > i ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)', transition: '0.3s' }}></div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="counter-display">
                <span className="count">{count}</span>
                <span className="label">{type === 'tawaf' ? 'Putaran' : 'Perjalanan'}</span>
            </div>

            <div className="stats-grid-strava">
                <div className="stat-item">
                    <span className="val">{steps}</span>
                    <span className="lbl">Langkah</span>
                </div>
                <div className="stat-item">
                    <span className="val">{formatTime(seconds)}</span>
                    <span className="lbl">Waktu</span>
                </div>
                <div className="stat-item">
                    <span className="val">{Math.round(distance)}m</span>
                    <span className="lbl">Jarak</span>
                </div>
            </div>

            {isActive && type === 'sai' && (
                <div className="sai-guidance glass-card" style={{ width: '100%', border: '1px solid var(--accent-gold)' }}>
                    <p style={{ color: 'var(--accent-gold)', fontWeight: '700' }}>
                        {count >= 7 ? 'IBADAH SELESAI' : `Menuju: ${targetPos}`}
                    </p>
                </div>
            )}

            <div className="actions" style={{ marginTop: '10px', width: '100%' }}>
                {!isActive ? (
                    <button className="btn-primary main-start" onClick={handleStart}>MULAI {type.toUpperCase()}</button>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {type === 'sai' && count < 7 && (
                            <button
                                className="btn-primary"
                                style={{ background: isFinalSai ? '#00ff88' : 'var(--accent-gold)', color: 'black' }}
                                onClick={handleCheckpoint}
                            >
                                {isFinalSai ? 'FINISH DI MARWAH' : `SAMPAI DI ${targetPos}`}
                            </button>
                        )}

                        <div style={{ display: 'flex', gap: '10px' }}>
                            {(type === 'tawaf' || count >= 7) && (
                                <button className="btn-primary" style={{ flex: 2, background: '#00ff88', color: '#1a1a2e' }} onClick={handleComplete}>
                                    <CheckCircle size={18} /> SIMPAN SESI
                                </button>
                            )}
                            <button className="btn-primary" style={{ flex: 1, background: 'rgba(255,51,51,0.2)', color: '#ff3333' }} onClick={() => setIsActive(false)}>
                                <XCircle size={18} /> BATAL
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {isActive && type === 'sai' && (
                <div className="prayer-guide-scroll glass-card" style={{ marginTop: '20px', textAlign: 'left', maxHeight: '300px', overflowY: 'auto', padding: '15px' }}>
                    <h3 style={{ fontSize: '14px', color: 'var(--accent-blue)', marginBottom: '15px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '5px' }}>
                        Panduan Doa Sa'i
                    </h3>
                    {SAI_PRAYERS.map((p, i) => (
                        <div key={i} style={{ marginBottom: '20px' }}>
                            <h4 style={{ fontSize: '12px', opacity: 0.7 }}>{p.title}</h4>
                            <p className="arabic" style={{ fontSize: '18px', textAlign: 'right', margin: '10px 0', color: 'white', lineHeight: '1.8' }}>{p.arabic}</p>
                            <p style={{ fontSize: '11px', fontStyle: 'italic', color: 'var(--accent-gold)' }}>{p.latin}</p>
                            <p style={{ fontSize: '10px', marginTop: '5px' }}>{p.meaning}</p>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                .strava-style { padding: 30px 20px; gap: 20px; }
                .stats-grid-strava { display: grid; grid-template-columns: repeat(3, 1fr); width: 100%; gap: 10px; border-top: 1px solid var(--glass-border); border-bottom: 1px solid var(--glass-border); padding: 15px 0; }
                .stat-item { display: flex; flex-direction: column; align-items: center; }
                .stat-item .val { font-size: 20px; font-weight: 800; color: white; }
                .stat-item .lbl { font-size: 10px; opacity: 0.5; text-transform: uppercase; margin-top: 4px; }
                .main-start { height: 60px; font-size: 18px; font-weight: 800; }
                .prayer-guide-scroll::-webkit-scrollbar { width: 4px; }
                .prayer-guide-scroll::-webkit-scrollbar-thumb { background: var(--glass-border); border-radius: 10px; }
                .arabic { font-family: 'Traditional Arabic', serif; }
            `}</style>
        </div>
    );
};

export default SessionTracker;
