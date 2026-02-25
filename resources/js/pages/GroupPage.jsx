import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserPlus, Info, CheckCircle, Loader, Copy } from 'lucide-react';
import BottomNav from '../components/BottomNav';

const GroupPage = () => {
    const [groups, setGroups] = useState({ owned: [], joined: [] });
    const [inviteCode, setInviteCode] = useState('');
    const [newGroupName, setNewGroupName] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeGroup, setActiveGroup] = useState(null);
    const [members, setMembers] = useState([]);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await axios.get('/api/groups');
            setGroups(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const createGroup = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/groups', { group_name: newGroupName });
            setNewGroupName('');
            fetchGroups();
        } catch (err) {
            alert('Gagal membuat grup');
        }
    };

    const joinGroup = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/groups/join', { invite_code: inviteCode });
            setInviteCode('');
            fetchGroups();
        } catch (err) {
            alert('Kode undangan salah atau sudah bergabung');
        }
    };

    const viewMembers = async (group) => {
        setActiveGroup(group);
        try {
            const res = await axios.get(`/api/groups/${group.id}/members`);
            setMembers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><Loader className="spin" /></div>;

    if (activeGroup) {
        return (
            <div style={{ padding: '20px' }}>
                <button className="btn-primary" style={{ width: 'auto', marginBottom: '20px', background: 'rgba(255,255,255,0.1)' }} onClick={() => setActiveGroup(null)}>
                    Kembali
                </button>
                <h1>{activeGroup.group_name}</h1>
                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div>
                        <span style={{ fontSize: '10px', opacity: 0.6 }}>KODE UNDANGAN</span>
                        <h2 style={{ margin: 0, color: 'var(--accent-gold)' }}>{activeGroup.invite_code}</h2>
                    </div>
                    <button className="copy-btn" onClick={() => { navigator.clipboard.writeText(activeGroup.invite_code); alert('Kode disalin!'); }}>
                        <Copy size={18} />
                    </button>
                </div>

                <div className="member-list">
                    <h2 style={{ fontSize: '16px', marginBottom: '15px' }}>Anggota Rombongan</h2>
                    {members.map(member => (
                        <div key={member.id} className="glass-card member-item">
                            <div className="member-info">
                                <span className="member-name">{member.user.full_name}</span>
                                <span className="member-role">{member.member_role}</span>
                            </div>
                            <div className="member-stats">
                                <div className="stat">
                                    <span className="val">{member.user.checklists_count}</span>
                                    <span className="lbl">Persiapan</span>
                                </div>
                                <div className="stat">
                                    <span className="val">{member.user.worship_logs_count}</span>
                                    <span className="lbl">Ibadah</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <style>{`
                    .member-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
                    .member-name { font-weight: 600; display: block; }
                    .member-role { font-size: 10px; opacity: 0.5; text-transform: uppercase; }
                    .member-stats { display: flex; gap: 15px; text-align: right; }
                    .member-stats .stat { display: flex; flex-direction: column; }
                    .member-stats .val { font-weight: 700; color: var(--accent-blue); }
                    .member-stats .lbl { font-size: 9px; opacity: 0.6; }
                    .copy-btn { background: none; border: none; color: var(--text-dim); cursor: pointer; }
                `}</style>
                <BottomNav />
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1>Group Sharing</h1>
            <p style={{ marginBottom: '20px' }}>Pantau progres keluarga dan rombongan Anda.</p>

            <form className="glass-card" onSubmit={joinGroup} style={{ marginBottom: '20px' }}>
                <h3>Gabung Grup</h3>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <input
                        className="input-field"
                        placeholder="Kode Undangan (mis: ABC123)"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                    />
                    <button type="submit" className="btn-primary" style={{ width: 'auto' }}>
                        Join
                    </button>
                </div>
            </form>

            <form className="glass-card" onSubmit={createGroup} style={{ marginBottom: '30px' }}>
                <h3>Buat Grup Baru</h3>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <input
                        className="input-field"
                        placeholder="Nama Grup (mis: Keluarga Ahmad)"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                    />
                    <button type="submit" className="btn-primary" style={{ width: 'auto' }}>
                        Create
                    </button>
                </div>
            </form>

            <div className="group-sections">
                <h2 style={{ fontSize: '14px', opacity: 0.6, marginBottom: '10px' }}>GRUP ANDA</h2>
                {[...groups.owned, ...groups.joined].map(group => (
                    <div key={group.id} className="glass-card group-item" onClick={() => viewMembers(group)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div className="group-icon">
                                <Users size={20} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '16px' }}>{group.group_name}</h3>
                                <p style={{ fontSize: '12px' }}>{group.members_count || 0} Anggota</p>
                            </div>
                        </div>
                        <Info size={18} opacity={0.5} />
                    </div>
                ))}
            </div>

            <style>{`
                .input-field { flex: 1; padding: 12px; border-radius: 10px; border: 1px solid var(--glass-border); background: rgba(0,0,0,0.2); color: white; }
                .group-item { display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; cursor: pointer; }
                .group-icon { width: 40px; height: 40px; background: rgba(0,210,255,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--accent-blue); }
                .spin { animation: spin 2s linear infinite; }
            `}</style>
            <BottomNav />
        </div>
    );
};

export default GroupPage;
