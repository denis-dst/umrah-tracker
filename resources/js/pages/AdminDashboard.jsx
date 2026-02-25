import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, FileText, BarChart3, Loader, Upload } from 'lucide-react';
import BottomNav from '../components/BottomNav';

const AdminDashboard = () => {
    const [jamaah, setJamaah] = useState([]);
    const [loading, setLoading] = useState(true);
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [jamaahRes, groupsRes] = await Promise.all([
                axios.get('/api/admin/jamaah'),
                axios.get('/api/groups') // Admin can see groups or we can make a specific admin endpoint
            ]);
            setJamaah(jamaahRes.data);
            setGroups(groupsRes.data.owned || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><Loader className="spin" /></div>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>Travel Agent Panel</h1>
            <p style={{ opacity: 0.6 }}>Kelola rombongan dan pantau jamaah.</p>

            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                <div className="glass-card stat-box">
                    <span className="val">{jamaah.length}</span>
                    <span className="lbl">Total Jamaah</span>
                </div>
                <div className="glass-card stat-box">
                    <span className="val">{groups.length}</span>
                    <span className="lbl">Grup Aktif</span>
                </div>
            </div>

            <section style={{ marginTop: '30px' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Daftar Rombongan</h2>
                {groups.map(group => (
                    <div key={group.id} className="glass-card group-admin-item">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '16px' }}>{group.group_name}</h3>
                                <p style={{ fontSize: '12px' }}>Kode: {group.invite_code}</p>
                            </div>
                            <button className="btn-mini" onClick={() => alert('Fitur upload itinerary via CSV segera hadir')}>
                                <Upload size={14} /> Itinerary
                            </button>
                        </div>
                    </div>
                ))}
            </section>

            <section style={{ marginTop: '30px' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Data Jamaah</h2>
                <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                    {jamaah.map(j => (
                        <div key={j.id} className="jamaah-row">
                            <div className="j-info">
                                <strong>{j.full_name}</strong>
                                <span>{j.phone}</span>
                            </div>
                            <div className="j-status">
                                <span className={`role-tag ${j.role}`}>{j.role}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <style>{`
                .stat-box { text-align: center; display: flex; flex-direction: column; }
                .stat-box .val { font-size: 28px; font-weight: 800; color: var(--accent-blue); }
                .stat-box .lbl { font-size: 10px; opacity: 0.6; text-transform: uppercase; }
                .group-admin-item { margin-bottom: 12px; border-left: 4px solid var(--accent-gold); }
                .btn-mini { background: rgba(0,210,255,0.1); border: 1px solid var(--accent-blue); color: var(--accent-blue); padding: 4px 10px; border-radius: 6px; font-size: 12px; display: flex; align-items: center; gap: 5px; cursor: pointer; }
                .jamaah-row { display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid var(--glass-border); }
                .jamaah-row:last-child { border-bottom: none; }
                .j-info { display: flex; flex-direction: column; }
                .j-info span { font-size: 11px; opacity: 0.5; }
                .role-tag { font-size: 9px; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; font-weight: 700; }
                .role-tag.admin { background: #ff4e50; color: white; }
                .role-tag.jamaah { background: #00d2ff; color: #1a1a2e; }
                .spin { animation: spin 2s linear infinite; }
            `}</style>
            <BottomNav />
        </div>
    );
};

export default AdminDashboard;
