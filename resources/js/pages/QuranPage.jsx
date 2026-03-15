import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Book, Search, PlayCircle, Star, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import BottomNav from '../components/BottomNav';

const quranApi = axios.create({
    baseURL: 'https://equran.id/api/v2',
});

const JUZ_DEFINITIONS = {
    1: [1, 1, 2, 141], 2: [2, 142, 2, 252], 3: [2, 253, 3, 92], 4: [3, 93, 4, 23], 5: [4, 24, 4, 147],
    6: [4, 148, 5, 81], 7: [5, 82, 6, 110], 8: [6, 111, 7, 87], 9: [7, 88, 8, 40], 10: [8, 41, 9, 92],
    11: [9, 93, 11, 5], 12: [11, 6, 12, 52], 13: [12, 53, 14, 52], 14: [15, 1, 16, 128], 15: [17, 1, 18, 74],
    16: [18, 75, 20, 135], 17: [21, 1, 22, 78], 18: [23, 1, 25, 20], 19: [25, 21, 27, 55], 20: [27, 56, 29, 45],
    21: [29, 46, 33, 30], 22: [33, 31, 36, 27], 23: [36, 28, 39, 31], 24: [39, 32, 41, 46], 25: [41, 47, 45, 37],
    26: [46, 1, 51, 30], 27: [51, 31, 57, 29], 28: [58, 1, 66, 12], 29: [67, 1, 77, 50], 30: [78, 1, 114, 6]
};

const QuranPage = () => {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const [surahs, setSurahs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list');
    const [listMode, setListMode] = useState('surah');
    const [readingMode, setReadingMode] = useState('surah');
    const [selectedId, setSelectedId] = useState(null);
    const [selectedData, setSelectedData] = useState(null); 
    const [ayahs, setAyahs] = useState([]);
    const [error, setError] = useState(false);
    const [search, setSearch] = useState('');
    const [showTranslation, setShowTranslation] = useState(true);
    const [playingAudio, setPlayingAudio] = useState(null);
    const [swipeDirection, setSwipeDirection] = useState(0);

    useEffect(() => {
        fetchSurahs();
    }, []);

    const fetchSurahs = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await quranApi.get('/surat');
            setSurahs(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch surahs', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const fetchContent = async (id, mode) => {
        setLoading(true);
        setError(false);
        setAyahs([]);
        try {
            if (mode === 'surah') {
                const res = await quranApi.get(`/surat/${id}`);
                const data = res.data.data;
                setSelectedData(data);
                const combined = data.ayat.map(a => ({
                    id: a.nomorAyat,
                    verse_key: `${data.nomor}:${a.nomorAyat}`,
                    text_arabic: a.teksArab,
                    translation: a.teksIndonesia,
                    audio: a.audio['01'],
                    latin: a.teksLatin,
                    surahName: data.namaLatin
                }));
                setAyahs(combined);
            } else {
                const range = JUZ_DEFINITIONS[id];
                const startSurah = range[0];
                const endSurah = range[2];
                const startAyah = range[1];
                const endAyah = range[3];

                let allAyahs = [];
                for (let s = startSurah; s <= endSurah; s++) {
                    const res = await quranApi.get(`/surat/${s}`);
                    const sData = res.data.data;
                    
                    let sAyahs = sData.ayat.map(a => ({
                        id: a.nomorAyat,
                        verse_key: `${sData.nomor}:${a.nomorAyat}`,
                        text_arabic: a.teksArab,
                        translation: a.teksIndonesia,
                        audio: a.audio['01'],
                        latin: a.teksLatin,
                        surahName: sData.namaLatin,
                        surahNomor: sData.nomor
                    }));

                    if (s === startSurah) sAyahs = sAyahs.filter(a => a.id >= startAyah);
                    if (s === endSurah) sAyahs = sAyahs.filter(a => a.id <= endAyah);
                    
                    allAyahs = [...allAyahs, ...sAyahs];
                }
                
                setSelectedData({ juz: id, name: `Juz ${id}` });
                setAyahs(allAyahs);
            }
        } catch (err) {
            console.error('Failed to fetch content', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSurah = (surah) => {
        setSelectedId(surah.nomor);
        setReadingMode('surah');
        setView('reader');
        fetchContent(surah.nomor, 'surah');
        window.scrollTo(0, 0);
    };

    const handleSelectJuz = (juzNomor) => {
        setSelectedId(juzNomor);
        setReadingMode('juz');
        setView('reader');
        fetchContent(juzNomor, 'juz');
        window.scrollTo(0, 0);
    };

    const handleSwipe = (direction) => {
        if (readingMode !== 'juz') return;
        const newJuz = direction === 'left' ? selectedId + 1 : selectedId - 1;
        if (newJuz >= 1 && newJuz <= 30) {
            setSwipeDirection(direction === 'left' ? 1 : -1);
            setSelectedId(newJuz);
            fetchContent(newJuz, 'juz');
            window.scrollTo(0, 0);
        }
    };

    const saveBookmark = async (ayah) => {
        const bookmark = {
            id: selectedId,
            mode: readingMode,
            name: readingMode === 'surah' ? selectedData.namaLatin : `Juz ${selectedId}`,
            verseKey: ayah.verse_key
        };
        
        try {
            const res = await axios.post('/api/quran-history', {
                last_quran_history: bookmark
            });
            if (res.data.user) {
                setUser(res.data.user);
            }
        } catch (err) {
            console.error('Failed to save history to server', err);
            // Fallback to local storage
            localStorage.setItem('last_read_quran', JSON.stringify(bookmark));
        }
    };

    const lastRead = user?.last_quran_history || JSON.parse(localStorage.getItem('last_read_quran'));

    const filteredSurahs = surahs.filter(s =>
        s.namaLatin.toLowerCase().includes(search.toLowerCase()) ||
        s.arti.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="quran-page" style={{ background: '#0f172a', color: 'white', minHeight: '100vh', paddingBottom: '90px' }}>
            {/* Header */}
            <header style={{ 
                padding: '15px 20px', 
                position: 'sticky', 
                top: 0, 
                background: 'rgba(15, 23, 42, 0.95)', 
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                zIndex: 100 
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {view === 'reader' && (
                            <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', color: 'white', padding: '5px' }}>
                                <ArrowLeft size={24} />
                            </button>
                        )}
                        <div>
                            <h1 style={{ fontSize: '18px', margin: 0 }}>
                                {view === 'reader' ? (readingMode === 'surah' ? selectedData?.namaLatin : `Juz ${selectedId}`) : 'Al-Quran Digital'}
                            </h1>
                        </div>
                    </div>
                </div>

                {view === 'list' && (
                    <div style={{ marginTop: '15px' }}>
                        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px', marginBottom: '15px' }}>
                            <button onClick={() => setListMode('surah')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: listMode === 'surah' ? 'var(--accent-blue)' : 'none', color: listMode === 'surah' ? '#0f172a' : 'white', fontWeight: 'bold', fontSize: '12px' }}>SURAH</button>
                            <button onClick={() => setListMode('juz')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: listMode === 'juz' ? 'var(--accent-blue)' : 'none', color: listMode === 'juz' ? '#0f172a' : 'white', fontWeight: 'bold', fontSize: '12px' }}>JUZ</button>
                        </div>
                        <div style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', borderRadius: '15px' }}>
                            <Search size={18} opacity={0.4} />
                            <input 
                                placeholder={listMode === 'surah' ? "Cari nama surah..." : "Cari juz..."}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ background: 'none', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '14px' }}
                            />
                        </div>
                    </div>
                )}
            </header>

            <main style={{ padding: '20px' }}>
                {loading && (view === 'list' || (view === 'reader' && ayahs.length === 0)) ? (
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                        <div className="loader"></div>
                        <p style={{ marginTop: '20px', opacity: 0.5, fontSize: '14px' }}>Memproses bacaan...</p>
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <p style={{ color: '#ef4444' }}>Gagal memuat data.</p>
                        <button onClick={() => view === 'list' ? fetchSurahs() : fetchContent(selectedId, readingMode)} style={{ marginTop: '20px', background: 'var(--accent-blue)', color: '#0f172a', border: 'none', padding: '10px 30px', borderRadius: '25px', fontWeight: 'bold' }}>Coba Lagi</button>
                    </div>
                ) : view === 'list' ? (
                    <div>
                        {lastRead && (
                            <div 
                                className="glass-card" 
                                onClick={() => {
                                    setReadingMode(lastRead.mode);
                                    setSelectedId(lastRead.id);
                                    setView('reader');
                                    fetchContent(lastRead.id, lastRead.mode);
                                }}
                                style={{ padding: '20px', marginBottom: '25px', border: '1px solid var(--accent-gold)', position: 'relative', background: 'linear-gradient(135deg, rgba(249, 212, 35, 0.1), rgba(15, 23, 42, 0.5))' }}
                            >
                                <span style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 'bold' }}>LANJUTKAN BACAAN AKUN ANDA</span>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', margin: '5px 0' }}>{lastRead.name}</div>
                                <div style={{ fontSize: '13px', opacity: 0.7 }}>Ayat {lastRead.verseKey.split(':')[1]}</div>
                            </div>
                        )}

                        {listMode === 'surah' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {filteredSurahs.map(s => (
                                    <div key={s.nomor} onClick={() => handleSelectSurah(s)} className="glass-card" style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}>
                                        <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px' }}>{s.nomor}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '700' }}>{s.namaLatin}</div>
                                            <div style={{ fontSize: '11px', opacity: 0.5 }}>{s.arti} • {s.jumlahAyat} Ayat</div>
                                        </div>
                                        <div style={{ fontSize: '22px', fontFamily: "'Scheherazade New', serif", color: 'var(--accent-gold)' }}>{s.nama}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                {Object.keys(JUZ_DEFINITIONS).map(jNum => (
                                    <div key={jNum} onClick={() => handleSelectJuz(parseInt(jNum))} className="glass-card" style={{ padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
                                        <div style={{ fontSize: '11px', color: 'var(--accent-blue)', fontWeight: 'bold', marginBottom: '4px' }}>JUZ {jNum}</div>
                                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Mushaf Juz {jNum}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="reader-view">
                        {readingMode === 'juz' && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', color: 'var(--accent-gold)', fontSize: '11px', fontWeight: 'bold' }}>
                                <button onClick={() => handleSwipe('right')} disabled={selectedId <= 1} style={{ background: 'none', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center', opacity: selectedId <= 1 ? 0.2 : 1 }}><ChevronLeft size={16} /> JUZ {selectedId - 1}</button>
                                <span style={{opacity:0.4}}>GESER UNTUK GANTI JUZ</span>
                                <button onClick={() => handleSwipe('left')} disabled={selectedId >= 30} style={{ background: 'none', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center', opacity: selectedId >= 30 ? 0.2 : 1 }}>JUZ {selectedId + 1} <ChevronRight size={16} /></button>
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${readingMode}-${selectedId}`}
                                initial={{ x: swipeDirection > 0 ? 50 : swipeDirection < 0 ? -50 : 0, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: swipeDirection > 0 ? -50 : swipeDirection < 0 ? 50 : 0, opacity: 0 }}
                                drag={readingMode === 'juz' ? "x" : false}
                                dragConstraints={{ left: 0, right: 0 }}
                                onDragEnd={(e, { offset }) => {
                                    if (offset.x < -80) handleSwipe('left');
                                    if (offset.x > 80) handleSwipe('right');
                                }}
                            >
                                {ayahs.map((ayah, index) => {
                                    const showSurahHeader = index === 0 || (ayahs[index - 1].surahNomor !== ayah.surahNomor);
                                    return (
                                        <div key={`${ayah.verse_key}-${index}`}>
                                            {showSurahHeader && (
                                                <div style={{ textAlign: 'center', padding: '30px 0 10px 0', marginBottom: '25px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px' }}>
                                                    <h3 style={{ fontSize: '22px', color: 'var(--accent-gold)', fontFamily: "'Scheherazade New', serif" }}>{ayah.surahName}</h3>
                                                </div>
                                            )}
                                            <div id={`ayah-${ayah.id}`} style={{ marginBottom: '35px', paddingBottom:'25px', borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                                    <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '6px', opacity: 0.6 }}>{ayah.verse_key}</span>
                                                    <div style={{ display: 'flex', gap: '12px' }}>
                                                        <button onClick={() => {
                                                            const audio = new Audio(ayah.audio);
                                                            audio.play();
                                                            setPlayingAudio(ayah.verse_key);
                                                            audio.onended = () => setPlayingAudio(null);
                                                        }} style={{ background: 'none', border: 'none', color: playingAudio === ayah.verse_key ? 'var(--accent-gold)' : 'white' }}><PlayCircle size={18} fill={playingAudio === ayah.verse_key ? 'currentColor' : 'none'} /></button>
                                                        <button onClick={() => saveBookmark(ayah)} style={{ background: 'none', border: 'none', color: lastRead?.verseKey === ayah.verse_key ? 'var(--accent-gold)' : 'white' }}><Star size={18} fill={lastRead?.verseKey === ayah.verse_key ? 'currentColor' : 'none'} /></button>
                                                    </div>
                                                </div>
                                                <p style={{ fontSize: '30px', textAlign: 'right', direction: 'rtl', lineHeight: '2.4', fontFamily: "'Scheherazade New', serif", marginBottom: '12px' }}>{ayah.text_arabic}</p>
                                                {showTranslation && (
                                                    <div style={{ paddingLeft: '5px' }}>
                                                        <p style={{ fontSize: '12px', color: 'var(--accent-blue)', fontStyle: 'italic', marginBottom: '6px', opacity: 0.8 }}>{ayah.latin}</p>
                                                        <p style={{ fontSize: '14px', lineHeight: '1.6', opacity: 0.7 }}>{ayah.translation}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                )}
            </main>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap');
                .loader { width: 30px; height: 30px; border: 3px solid rgba(0, 210, 255, 0.1); border-top-color: var(--accent-blue); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .glass-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 18px; transition: 0.2s; }
                .glass-card:active { transform: scale(0.98); background: rgba(255,255,255,0.06); }
            `}</style>
            <BottomNav />
        </div>
    );
};

export default QuranPage;
