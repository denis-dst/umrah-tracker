import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, Plus, Loader } from 'lucide-react';
import BottomNav from '../components/BottomNav';

const ChecklistPage = () => {
    const [checklists, setChecklists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChecklists();
    }, []);

    const fetchChecklists = async () => {
        try {
            const res = await axios.get('/api/checklists');
            setChecklists(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleItem = async (id) => {
        try {
            const res = await axios.patch(`/api/checklists/${id}/toggle`);
            setChecklists(prev => prev.map(item => item.id === id ? res.data : item));
        } catch (err) {
            console.error(err);
        }
    };

    const seedDefaults = async () => {
        setLoading(true);
        try {
            await axios.post('/api/checklists/seed');
            fetchChecklists();
        } catch (err) {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><Loader className="spin" /></div>;

    const categories = [...new Set(checklists.map(item => item.category))];

    return (
        <div style={{ padding: '20px' }}>
            <h1>Persiapan Persiapan</h1>

            {checklists.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <p>Belum ada daftar persiapan.</p>
                    <button className="btn-primary" onClick={seedDefaults} style={{ marginTop: '15px' }}>
                        Gunakan Template Standar
                    </button>
                </div>
            ) : (
                categories.map(cat => (
                    <div key={cat} style={{ marginBottom: '25px' }}>
                        <h2 style={{ fontSize: '14px', opacity: 0.6, textTransform: 'uppercase', paddingLeft: '15px' }}>{cat}</h2>
                        {checklists.filter(i => i.category === cat).map(item => (
                            <div
                                key={item.id}
                                className="glass-card"
                                onClick={() => toggleItem(item.id)}
                                style={{ display: 'flex', alignItems: 'center', gap: '15px', margin: '10px 0', cursor: 'pointer' }}
                            >
                                <div className={`check-box ${item.is_completed ? 'checked' : ''}`}>
                                    {item.is_completed && <Check size={14} />}
                                </div>
                                <span style={{ textDecoration: item.is_completed ? 'line-through' : 'none', opacity: item.is_completed ? 0.5 : 1 }}>
                                    {item.item_name}
                                </span>
                            </div>
                        ))}
                    </div>
                ))
            )}

            <style>{`
                .check-box { width: 24px; height: 24px; border: 2px solid var(--accent-blue); border-radius: 6px; display: flex; alignItems: center; justify-content: center; }
                .check-box.checked { background: var(--accent-blue); }
                .spin { animation: spin 2s linear infinite; }
            `}</style>
            <BottomNav />
        </div>
    );
};

export default ChecklistPage;
