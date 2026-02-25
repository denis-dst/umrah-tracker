import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Calendar, LogOut, Save, Loader, Shield, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import BottomNav from '../components/BottomNav';

const ProfilePage = () => {
    const { user, setUser, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        phone: user?.phone || '',
        departure_date: user?.departure_date || '',
    });

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.put('/api/profile', formData);
            setUser(res.data.user);
            alert('Profil diperbarui!');
        } catch (err) {
            alert('Gagal memperbarui profil');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Profil Saya</h1>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                <div className="avatar-circle">
                    {user?.full_name?.charAt(0) || 'U'}
                </div>
                <h3>{user?.full_name}</h3>
                <span className="role-badge">{user?.role}</span>
            </div>

            <form onSubmit={handleUpdate} style={{ marginTop: '20px' }}>
                <div className="input-group glass-card">
                    <div className="input-item">
                        <User size={18} />
                        <input
                            type="text"
                            placeholder="Nama Lengkap"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        />
                    </div>
                    <div className="input-item">
                        <Phone size={18} />
                        <input
                            type="text"
                            placeholder="Nomor Telepon"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div className="input-item">
                        <Calendar size={18} />
                        <input
                            type="date"
                            value={formData.departure_date}
                            onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                        />
                    </div>
                </div>

                <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '20px' }}>
                    {loading ? <Loader className="spin" size={18} /> : <><Save size={18} /> Simpan Perubahan</>}
                </button>
            </form>

            <Link to="/reminders" className="btn-primary" style={{ marginTop: '20px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Bell size={18} /> Pengaturan Pengingat
            </Link>

            <button className="btn-primary" onClick={logout} style={{ marginTop: '15px', background: 'rgba(255,85,85,0.1)', color: '#ff5555', border: '1px solid rgba(255,85,85,0.2)' }}>
                <LogOut size={18} /> Keluar Aplikasi
            </button>

            {user?.role === 'admin' && (
                <Link to="/admin" className="btn-primary" style={{ marginTop: '15px', background: 'rgba(255,212,35,0.1)', color: 'var(--accent-gold)', border: '1px solid rgba(255,212,35,0.2)', textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Shield size={18} /> Admin Panel
                </Link>
            )}

            <style>{`
                .avatar-circle { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-blue), #3a7bd5); display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; color: white; border: 4px solid var(--glass-border); }
                .role-badge { font-size: 10px; background: var(--accent-gold); color: black; padding: 2px 8px; border-radius: 10px; font-weight: 700; text-transform: uppercase; }
                .input-group { padding: 0; overflow: hidden; }
                .input-item { display: flex; align-items: center; gap: 15px; padding: 15px; border-bottom: 1px solid var(--glass-border); }
                .input-item:last-child { border-bottom: none; }
                .input-item input { flex: 1; background: none; border: none; color: white; outline: none; font-size: 16px; }
                .spin { animation: spin 2s linear infinite; }
            `}</style>
            <BottomNav />
        </div>
    );
};

export default ProfilePage;
