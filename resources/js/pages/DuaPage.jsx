import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Bookmark, Search } from 'lucide-react';
import axios from 'axios';
import BottomNav from '../components/BottomNav';

const DUA_DATA = [
    {
        id: 'umrah-1',
        title: 'Doa Masuk Masjidil Haram',
        arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
        latin: 'Allahumma-ftah lii abwaaba rahmatik',
        translation: 'Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu.',
        category: 'Umrah'
    },
    {
        id: 'umrah-2',
        title: 'Dzikir Pagi (Ayat Kursi)',
        arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...',
        latin: 'Allahu laa ilaaha illa huwal hayyul qayyum...',
        translation: 'Allah, tidak ada Tuhan melainkan Dia yang Hidup kekal lagi terus menerus mengurus (makhluk-Nya)...',
        category: 'Harian'
    },
    {
        id: 'umrah-3',
        title: 'Doa Antara Dua Rukun',
        arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
        latin: 'Rabbana aatina fid dunya hasanatan wa fil akhirati hasanatan wa qina \'adhaban nar',
        translation: 'Wahai Tuhan kami, berikanlah kami kebaikan di dunia dan kebaikan di akhirat dan peliharalah kami dari siksa neraka.',
        category: 'Umrah'
    }
];

const DuaPage = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [playing, setPlaying] = useState(null);
    const [duas, setDuas] = useState(DUA_DATA);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);
    const [filter, setFilter] = useState('all'); // 'all' or 'fav'
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    useEffect(() => {
        const saved = localStorage.getItem('favorite_duas');
        if (saved) setFavorites(JSON.parse(saved));

        const fetchDuas = async () => {
            try {
                // Fetch from EQuran.id Doa API
                const res = await axios.get('https://equran.id/api/doa');
                const apiDuas = (res.data.data || []).map(d => ({
                    id: `equran-${d.id}`,
                    title: d.nama,
                    arabic: d.ar,
                    latin: d.tr,
                    translation: d.idn,
                    category: d.grup,
                    info: d.tentang
                }));
                // Combine with Umrah-specific static data
                setDuas([...DUA_DATA, ...apiDuas]);
            } catch (err) {
                console.error('Failed to fetch duas', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDuas();
    }, []);

    // Reset pagination when searching or filtering
    useEffect(() => {
        setCurrentPage(1);
    }, [search, filter]);

    const toggleFavorite = (id) => {
        const newFavs = favorites.includes(id)
            ? favorites.filter(f => f !== id)
            : [...favorites, id];
        setFavorites(newFavs);
        localStorage.setItem('favorite_duas', JSON.stringify(newFavs));
    };

    const filteredDuas = duas.filter(d => {
        const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase()) ||
            d.category.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || favorites.includes(d.id);
        return matchesSearch && matchesFilter;
    });

    const totalPages = Math.ceil(filteredDuas.length / itemsPerPage);
    const pagedDuas = filteredDuas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="dua-page" style={{ padding: '20px', paddingBottom: '100px' }}>
            <div className="header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'white' }}>
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ fontSize: '24px' }}>Doa & Dzikir</h1>
            </div>

            <div className="search-bar glass-card" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', marginBottom: '25px', borderRadius: '12px' }}>
                <Search size={18} opacity={0.5} />
                <input
                    type="text"
                    placeholder="Cari doa atau dzikir..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ background: 'none', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '14px' }}
                />
            </div>

            <div className="filter-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                    onClick={() => setFilter('all')}
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: filter === 'all' ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)', color: filter === 'all' ? '#1a1a2e' : 'white', fontWeight: 'bold', fontSize: '13px' }}
                >Semua</button>
                <button
                    onClick={() => setFilter('fav')}
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: filter === 'fav' ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)', color: filter === 'fav' ? '#1a1a2e' : 'white', fontWeight: 'bold', fontSize: '13px' }}
                >Favorit ({favorites.length})</button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <div className="loader" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                    <p style={{ marginTop: '15px', opacity: 0.6 }}>Memuat Doa...</p>
                </div>
            ) : filteredDuas.length === 0 ? (
                <div className="glass-card" style={{ padding: '40px 20px', textAlign: 'center', borderRadius: '20px' }}>
                    <p style={{ opacity: 0.5 }}>{filter === 'fav' ? 'Belum ada doa favorit.' : 'Doa tidak ditemukan.'}</p>
                </div>
            ) : (
                <>
                    <div className="dua-list" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {Object.entries(
                            pagedDuas.reduce((acc, dua) => {
                                if (!acc[dua.category]) acc[dua.category] = [];
                                acc[dua.category].push(dua);
                                return acc;
                            }, {})
                        ).map(([category, categoryDuas]) => (
                            <div key={category} className="category-section">
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    marginBottom: '15px',
                                    padding: '0 5px'
                                }}>
                                    <div style={{ height: '2px', flex: 1, background: 'linear-gradient(90deg, var(--accent-blue), transparent)', opacity: 0.3 }}></div>
                                    <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '1px' }}>{category}</h2>
                                    <div style={{ height: '2px', flex: 1, background: 'linear-gradient(270deg, var(--accent-blue), transparent)', opacity: 0.3 }}></div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {categoryDuas.map(dua => (
                                        <div key={dua.id} className="glass-card dua-card" style={{ padding: '20px', borderRadius: '20px', border: '1px solid var(--glass-border)', position: 'relative', overflow: 'hidden' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
                                                    {String(dua.id).startsWith('equran-') ? String(dua.id).split('-')[1] : '★'}
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <button
                                                        onClick={() => toggleFavorite(dua.id)}
                                                        style={{ background: 'none', border: 'none', color: favorites.includes(dua.id) ? 'var(--accent-gold)' : 'white' }}
                                                    >
                                                        <Bookmark size={18} fill={favorites.includes(dua.id) ? 'var(--accent-gold)' : 'none'} opacity={favorites.includes(dua.id) ? 1 : 0.6} />
                                                    </button>
                                                    <button
                                                        onClick={() => setPlaying(playing === dua.id ? null : dua.id)}
                                                        style={{ background: 'var(--accent-gold)', border: 'none', color: '#1a1a2e', padding: '6px', borderRadius: '50%', display: 'flex' }}
                                                    >
                                                        {playing === dua.id ? <Pause size={16} /> : <Play size={16} />}
                                                    </button>
                                                </div>
                                            </div>
                                            <h3 style={{ fontSize: '16px', marginBottom: '15px', color: 'var(--accent-gold)', lineHeight: '1.4' }}>{dua.title}</h3>
                                            <p className="arabic" style={{ fontSize: '26px', textAlign: 'right', marginBottom: '15px', lineHeight: '1.8', fontFamily: "'Scheherazade New', serif" }}>{dua.arabic}</p>
                                            <p className="latin" style={{ fontSize: '13px', fontStyle: 'italic', marginBottom: '10px', opacity: 0.8, color: 'var(--accent-blue)', lineHeight: '1.5' }}>{dua.latin}</p>
                                            <p className="translation" style={{ fontSize: '12px', opacity: 0.6, lineHeight: '1.6' }}>{dua.translation}</p>
                                            {dua.info && (
                                                <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '11px', opacity: 0.5, borderLeft: '2px solid var(--accent-gold)' }}>
                                                    {dua.info}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '40px' }}>
                            <button
                                onClick={() => {
                                    setCurrentPage(curr => Math.max(1, curr - 1));
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                disabled={currentPage === 1}
                                className="glass-card"
                                style={{ padding: '10px 20px', border: 'none', borderRadius: '10px', color: 'white', opacity: currentPage === 1 ? 0.3 : 1, transition: '0.3s' }}
                            >Prev</button>

                            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
                                {currentPage} / {totalPages}
                            </span>

                            <button
                                onClick={() => {
                                    setCurrentPage(curr => Math.min(totalPages, curr + 1));
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                disabled={currentPage === totalPages}
                                className="glass-card"
                                style={{ padding: '10px 20px', border: 'none', borderRadius: '10px', color: 'white', opacity: currentPage === totalPages ? 0.3 : 1, transition: '0.3s' }}
                            >Next</button>
                        </div>
                    )}
                </>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap');
                @keyframes spin { to { transform: rotate(360deg); } }
                .dua-card { transition: 0.3s; }
                .dua-card:active { transform: scale(0.98); }
            `}</style>

            <BottomNav />
        </div>
    );
};

export default DuaPage;
