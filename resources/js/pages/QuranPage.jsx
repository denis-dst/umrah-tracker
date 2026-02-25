import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Book, Search, PlayCircle, Menu, X, Info, Star } from 'lucide-react';
import axios from 'axios';
import BottomNav from '../components/BottomNav';

const quranApi = axios.create({
    baseURL: 'https://equran.id/api/v2',
});

const JUZ_MAPPING = [
    { juz: 1, surah: 1, ayat: 1, name: 'Al-Fatihah' },
    { juz: 2, surah: 2, ayat: 142, name: 'Al-Baqarah' },
    { juz: 3, surah: 2, ayat: 253, name: 'Al-Baqarah' },
    { juz: 4, surah: 3, ayat: 93, name: 'Ali \'Imran' },
    { juz: 5, surah: 4, ayat: 24, name: 'An-Nisa\'' },
    { juz: 6, surah: 4, ayat: 148, name: 'An-Nisa\'' },
    { juz: 7, surah: 5, ayat: 82, name: 'Al-Ma\'idah' },
    { juz: 8, surah: 6, ayat: 111, name: 'Al-An\'am' },
    { juz: 9, surah: 7, ayat: 88, name: 'Al-A\'raf' },
    { juz: 10, surah: 8, ayat: 41, name: 'Al-Anfal' },
    { juz: 11, surah: 9, ayat: 93, name: 'At-Tawbah' },
    { juz: 12, surah: 11, ayat: 6, name: 'Hud' },
    { juz: 13, surah: 12, ayat: 53, name: 'Yusuf' },
    { juz: 14, surah: 15, ayat: 1, name: 'Al-Hijr' },
    { juz: 15, surah: 17, ayat: 1, name: 'Al-Isra\'' },
    { juz: 16, surah: 18, ayat: 75, name: 'Al-Kahf' },
    { juz: 17, surah: 21, ayat: 1, name: 'Al-Anbiya\'' },
    { juz: 18, surah: 23, ayat: 1, name: 'Al-Mu\'minun' },
    { juz: 19, surah: 25, ayat: 21, name: 'Al-Furqan' },
    { juz: 20, surah: 27, ayat: 56, name: 'An-Naml' },
    { juz: 21, surah: 29, ayat: 46, name: 'Al-\'Ankabut' },
    { juz: 22, surah: 33, ayat: 31, name: 'Al-Ahzab' },
    { juz: 23, surah: 36, ayat: 28, name: 'Ya-Sin' },
    { juz: 24, surah: 39, ayat: 31, name: 'Az-Zumar' },
    { juz: 25, surah: 41, ayat: 47, name: 'Fussilat' },
    { juz: 26, surah: 46, ayat: 1, name: 'Al-Ahqaf' },
    { juz: 27, surah: 51, ayat: 31, name: 'Adh-Dhariyat' },
    { juz: 28, surah: 58, ayat: 1, name: 'Al-Mujadila' },
    { juz: 29, surah: 67, ayat: 1, name: 'Al-Mulk' },
    { juz: 30, surah: 78, ayat: 1, name: 'An-Naba\'' }
];

const QuranPage = () => {
    const navigate = useNavigate();
    const [surahs, setSurahs] = useState([]);
    const [selectedSurah, setSelectedSurah] = useState(null);
    const [ayahs, setAyahs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list' or 'reader'
    const [listMode, setListMode] = useState('surah'); // 'surah' or 'juz'
    const [error, setError] = useState(false);
    const [search, setSearch] = useState('');
    const [resourceType, setResourceType] = useState('translation'); // 'translation' or 'tafsir'
    const [showTranslation, setShowTranslation] = useState(true);
    const [playingAudio, setPlayingAudio] = useState(null);
    const [lastRead, setLastRead] = useState(null);
    const [targetAyah, setTargetAyah] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem('last_read_quran');
        if (saved) setLastRead(JSON.parse(saved));
    }, []);

    const saveBookmark = (ayah) => {
        const bookmark = {
            surahId: selectedSurah.nomor,
            surahName: selectedSurah.namaLatin,
            verseKey: ayah.nomorAyat
        };
        localStorage.setItem('last_read_quran', JSON.stringify(bookmark));
        setLastRead(bookmark);
    };

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

    useEffect(() => {
        fetchSurahs();
    }, []);

    useEffect(() => {
        if (selectedSurah) {
            fetchAyahs(selectedSurah.nomor);
        }
    }, [resourceType, selectedSurah?.nomor]);

    const fetchAyahs = async (surahNomor) => {
        setLoading(true);
        setError(false);
        try {
            const endpoint = resourceType === 'translation' ? `/surat/${surahNomor}` : `/tafsir/${surahNomor}`;
            const res = await quranApi.get(endpoint);

            if (!res.data.data) {
                throw new Error('Data tidak ditemukan');
            }

            const data = res.data.data;
            if (resourceType === 'translation') {
                const combined = data.ayat.map(a => ({
                    id: a.nomorAyat,
                    verse_key: `${data.nomor}:${a.nomorAyat}`,
                    text_arabic: a.teksArab,
                    translation: a.teksIndonesia,
                    audio: a.audio['01'], // Abdullah Al-Juhany
                    latin: a.teksLatin
                }));
                setAyahs(combined);
            } else {
                const combined = data.tafsir.map(t => ({
                    id: t.ayat,
                    verse_key: `${data.nomor}:${t.ayat}`,
                    text_arabic: '', // Tafsir endpoint typically doesn't repeat full arabic if it's separate
                    translation: t.teks,
                    latin: ''
                }));
                setAyahs(combined);
            }

            // Handle scrolling after ayahs are loaded
            if (targetAyah) {
                setTimeout(() => {
                    const el = document.getElementById(`ayah-${targetAyah}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTargetAyah(null);
                }, 500);
            }
        } catch (err) {
            console.error('Failed to fetch ayahs', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const filteredSurahs = surahs.filter(s =>
        s.namaLatin.toLowerCase().includes(search.toLowerCase()) ||
        s.arti.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="quran-page" style={{ color: 'white', minHeight: '100vh', paddingBottom: '100px' }}>
            {/* Header */}
            <header style={{ padding: '20px', position: 'sticky', top: 0, background: 'var(--bg-dark)', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {view === 'reader' && (
                        <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', color: 'white' }}>
                            <ArrowLeft />
                        </button>
                    )}
                    <h1 style={{ fontSize: '20px' }}>{view === 'reader' ? selectedSurah?.namaLatin : 'Al-Quran Digital'}</h1>
                </div>
                {view === 'list' && (
                    <>
                        <div className="list-toggle" style={{ display: 'flex', gap: '5px', background: 'rgba(255,255,255,0.05)', padding: '5px', borderRadius: '10px', marginTop: '10px' }}>
                            <button
                                onClick={() => setListMode('surah')}
                                style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '8px', background: listMode === 'surah' ? 'var(--accent-blue)' : 'none', color: listMode === 'surah' ? '#1a1a2e' : 'white', fontWeight: 'bold', fontSize: '12px', transition: '0.3s' }}
                            >SURAH</button>
                            <button
                                onClick={() => setListMode('juz')}
                                style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '8px', background: listMode === 'juz' ? 'var(--accent-blue)' : 'none', color: listMode === 'juz' ? '#1a1a2e' : 'white', fontWeight: 'bold', fontSize: '12px', transition: '0.3s' }}
                            >JUZ</button>
                        </div>
                        <div className="glass-card" style={{ marginTop: '15px', display: 'flex', gap: '10px', padding: '10px 15px', borderRadius: '12px' }}>
                            <Search size={18} opacity={0.5} />
                            <input
                                type="text"
                                placeholder={listMode === 'surah' ? "Cari Surah..." : "Cari Juz..."}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ background: 'none', border: 'none', color: 'white', outline: 'none', width: '100%' }}
                            />
                        </div>
                    </>
                )}
            </header>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <div className="loader"></div>
                    <p style={{ marginTop: '15px', opacity: 0.6 }}>Memuat Al-Quran...</p>
                </div>
            ) : error ? (
                <div className="glass-card" style={{ margin: '20px', textAlign: 'center', padding: '40px 20px' }}>
                    <p style={{ color: '#ff4444', marginBottom: '20px' }}>Gagal memuat data Al-Quran.</p>
                    <button
                        onClick={() => view === 'list' ? fetchSurahs() : (selectedSurah && fetchAyahs(selectedSurah.id))}
                        style={{ background: 'var(--accent-blue)', border: 'none', color: '#1a1a2e', padding: '10px 25px', borderRadius: '10px', fontWeight: 'bold' }}
                    >Coba Lagi</button>
                </div>
            ) : view === 'list' ? (
                <div className="surah-list" style={{ padding: '0 20px' }}>
                    {lastRead && (
                        <div
                            className="glass-card bookmark-card"
                            style={{ padding: '15px', marginBottom: '20px', border: '1px solid var(--accent-gold)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            onClick={() => {
                                const s = surahs.find(sur => sur.nomor === lastRead.surahId);
                                if (s) {
                                    setSelectedSurah(s);
                                    setView('reader');
                                }
                            }}
                        >
                            <div>
                                <div style={{ fontSize: '10px', color: 'var(--accent-gold)', marginBottom: '4px' }}>LANJUTKAN MEMBACA</div>
                                <div style={{ fontWeight: 'bold' }}>{lastRead.surahName}: Ayat {lastRead.verseKey.split(':')[1]}</div>
                            </div>
                            <Book size={20} color="var(--accent-gold)" />
                        </div>
                    )}
                    {listMode === 'surah' ? (
                        filteredSurahs.map(s => (
                            <div
                                key={s.nomor}
                                onClick={() => { setSelectedSurah(s); setView('reader'); }}
                                className="surah-item glass-card"
                                style={{ padding: '15px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}
                            >
                                <div className="surah-num" style={{ width: '35px', height: '35px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-blue)' }}>
                                    {s.nomor}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold' }}>{s.namaLatin}</div>
                                    <div style={{ fontSize: '11px', opacity: 0.6 }}>{s.arti} • {s.jumlahAyat} Ayat</div>
                                </div>
                                <div className="arabic-name" style={{ fontSize: '20px', fontFamily: "'Scheherazade New', serif" }}>{s.nama}</div>
                            </div>
                        ))
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            {JUZ_MAPPING.filter(j => j.juz.toString().includes(search) || j.name.toLowerCase().includes(search.toLowerCase())).map(j => (
                                <div
                                    key={j.juz}
                                    className="glass-card juz-item"
                                    onClick={() => {
                                        const s = surahs.find(sur => sur.nomor === j.surah);
                                        if (s) {
                                            setSelectedSurah(s);
                                            setTargetAyah(j.ayat);
                                            setView('reader');
                                        }
                                    }}
                                    style={{ padding: '20px', textAlign: 'center', borderRadius: '15px', cursor: 'pointer' }}
                                >
                                    <div style={{ fontSize: '12px', color: 'var(--accent-blue)', fontWeight: 'bold', marginBottom: '8px' }}>JUZ {j.juz}</div>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{j.name}</div>
                                    <div style={{ fontSize: '10px', opacity: 0.5, marginTop: '5px' }}>Mulai Ayat {j.ayat}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="quran-reader" style={{ padding: '0 20px' }}>
                    <div className="reader-controls" style={{ display: 'flex', gap: '10px', marginBottom: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                        <button
                            onClick={() => setResourceType('translation')}
                            className={resourceType === 'translation' ? 'tab active' : 'tab'}
                        >
                            Terjemahan
                        </button>
                        <button
                            onClick={() => setResourceType('tafsir')}
                            className={resourceType === 'tafsir' ? 'tab active' : 'tab'}
                        >
                            Tafsir
                        </button>
                        <div style={{ borderLeft: '1px solid var(--glass-border)', margin: '0 3px' }}></div>
                        <button
                            onClick={() => setShowTranslation(!showTranslation)}
                            className={showTranslation ? 'tab active' : 'tab'}
                        >
                            {showTranslation ? 'Sembunyi' : 'Tampil'}
                        </button>
                    </div>

                    {ayahs.map(ayah => (
                        <div key={ayah.id} id={`ayah-${ayah.id}`} className="ayah-item" style={{ marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' }}>
                            <div className="ayah-num-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <span style={{ fontSize: '12px', background: 'var(--accent-blue)', color: '#1a1a2e', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{ayah.verse_key}</span>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    {ayah.audio && (
                                        <button
                                            onClick={() => {
                                                if (playingAudio === ayah.id) {
                                                    setPlayingAudio(null);
                                                } else {
                                                    const audio = new Audio(ayah.audio);
                                                    audio.play();
                                                    setPlayingAudio(ayah.id);
                                                    audio.onended = () => setPlayingAudio(null);
                                                }
                                            }}
                                            style={{ background: 'none', border: 'none', color: playingAudio === ayah.id ? 'var(--accent-gold)' : 'white' }}
                                        >
                                            <PlayCircle size={18} fill={playingAudio === ayah.id ? 'var(--accent-gold)' : 'none'} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => saveBookmark(ayah)}
                                        style={{ background: 'none', border: 'none', color: lastRead?.verseKey === ayah.id ? 'var(--accent-gold)' : 'white', cursor: 'pointer' }}
                                    >
                                        <Star size={16} fill={lastRead?.verseKey === ayah.id ? 'var(--accent-gold)' : 'none'} />
                                    </button>
                                </div>
                            </div>

                            {ayah.text_arabic && (
                                <p
                                    className="arabic-text"
                                    style={{ fontSize: '32px', textAlign: 'right', lineHeight: '2.5', fontFamily: "'Scheherazade New', serif", marginBottom: '10px' }}
                                >{ayah.text_arabic}</p>
                            )}

                            {showTranslation && ayah.latin && (
                                <p className="latin-text" style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--accent-blue)', opacity: 0.7, marginBottom: '10px' }}>{ayah.latin}</p>
                            )}

                            {showTranslation && (
                                <p className="trans-text" style={{ fontSize: resourceType === 'tafsir' ? '12px' : '14px', lineHeight: '1.6', opacity: resourceType === 'tafsir' ? 0.6 : 0.8 }} dangerouslySetInnerHTML={{ __html: ayah.translation }} />
                            )}
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap');
                .loader { width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.1); border-top-color: var(--accent-blue); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .surah-item:active { transform: scale(0.98); background: rgba(255,255,255,0.08); }
                .tab { background: rgba(255,255,255,0.05); border: none; color: white; padding: 8px 16px; border-radius: 8px; font-size: 13px; cursor: pointer; transition: 0.3s; white-space: nowrap; }
                .tab.active { background: var(--accent-gold); color: #1a1a2e; font-weight: bold; }
                
                /* Translation Footnotes */
                .trans-text sup { color: var(--accent-gold); font-size: 8px; margin-left: 2px; }
            `}</style>
            <BottomNav />
        </div>
    );
};

export default QuranPage;
